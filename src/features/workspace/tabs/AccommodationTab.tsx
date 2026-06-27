import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { Booking, RoomRequirement } from "@/types/booking";
import { HotelAccommodationInventory } from "@/types/master";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { calculateRoomBlocks, HierarchyCounts, CalculatedBlocks } from "@/lib/roomBlockingEngine";
import { logEventActivity } from "@/lib/eventLogger";
import { isEventClosed } from "@/lib/eventLocking";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BedDouble, AlertTriangle, CheckCircle, Save, Lock } from "lucide-react";

export function AccommodationTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [inventory, setInventory] = useState<HotelAccommodationInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedReq, setSavedReq] = useState<RoomRequirement | null>(null);

  const [counts, setCounts] = useState<HierarchyCounts>({
    so_count: 0, dm_count: 0, rsm_count: 0, dsm_count: 0,
    ch_count: 0, ibh_count: 0, nsm_count: 0
  });
  
  const [blocks, setBlocks] = useState<CalculatedBlocks>({
    single_rooms: 0, double_rooms: 0, triple_rooms: 0, suites: 0
  });

  const closed = isEventClosed(event.lifecycle_status);
  const canManage = (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && !closed;

  const totalPax = Object.values(counts).reduce((a, b) => a + b, 0);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: bData } = await supabase
        .from('bookings')
        .select('*')
        .eq('event_id', event.id)
        .single();
      
      if (bData) {
        setBooking(bData as any);
        
        const { data: invData } = await supabase
          .from('hotel_accommodation_inventory')
          .select('*')
          .eq('hotel_id', bData.hotel_id)
          .single();
        if (invData) setInventory(invData as any);

        const { data: rData } = await supabase
          .from('room_requirements')
          .select('*')
          .eq('booking_id', bData.id)
          .single();
        
        if (rData) {
          setSavedReq(rData as any);
          setCounts({
            so_count: rData.so_count, dm_count: rData.dm_count,
            rsm_count: rData.rsm_count, dsm_count: rData.dsm_count,
            ch_count: rData.ch_count, ibh_count: rData.ibh_count,
            nsm_count: rData.nsm_count
          });
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [event.id]);

  useEffect(() => {
    if (booking) {
      calculateRoomBlocks(booking.hotel_id, counts).then(res => setBlocks(res));
    }
  }, [counts, booking]);

  const overAllocated = inventory ? (
    blocks.single_rooms > inventory.single_rooms ||
    blocks.double_rooms > inventory.double_rooms ||
    blocks.triple_rooms > inventory.triple_rooms ||
    blocks.suites > inventory.suites
  ) : false;

  const handleSave = async () => {
    if (!booking || !user || overAllocated) return;
    setSaving(true);
    
    const payload = {
      booking_id: booking.id,
      ...counts,
      ...blocks
    };

    if (savedReq) {
      await supabase.from('room_requirements').update(payload).eq('id', savedReq.id);
    } else {
      const { data } = await supabase.from('room_requirements').insert(payload).select().single();
      if (data) setSavedReq(data as any);
    }

    await logEventActivity(event.id, 'ROOM_BLOCKING_COMPLETED', user.id, event.lifecycle_status, event.lifecycle_status);

    if (event.lifecycle_status === 'APPROVED' || event.lifecycle_status === 'BOOKED') {
      await supabase.from('events').update({ lifecycle_status: 'ROOMING_PENDING' }).eq('id', event.id);
      await logEventActivity(event.id, 'ROOMING_PENDING', user.id, event.lifecycle_status, 'ROOMING_PENDING');
    }

    setSaving(false);
  };

  const handleChange = (field: keyof HierarchyCounts, value: string) => {
    setCounts(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  if (loading) return <div className="p-8 font-medium text-vms-primary animate-pulse">Loading accommodation matrix...</div>;

  if (!booking) {
    return (
      <Card className="border-0 shadow-sm border-t-4 border-t-vms-warning bg-vms-warning-bg/20 mt-4">
        <CardContent className="p-10 flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 text-vms-warning mb-4" />
          <h2 className="text-xl font-bold text-vms-primary-dark mb-2">Venue Booking Required</h2>
          <p className="text-vms-gray-600 max-w-md">
            The accommodation engine requires a confirmed venue booking before room blocks can be calculated against property inventory.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-vms-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-vms-primary-dark tracking-tight">Room Blocks</h2>
          <p className="text-vms-gray-600 mt-1">Hierarchical mapping and capacity validation against hotel inventory.</p>
        </div>
      </div>

      {overAllocated && (
        <div className="bg-vms-danger-bg border border-vms-danger/20 text-vms-danger p-4 rounded-lg mb-8 font-bold flex items-center shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          Calculated blocks exceed available hotel inventory. Adjust participant counts or request inventory extension.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Output Section (Inventory Blocks) - Takes priority visually */}
        <div className="lg:col-span-8">
          <Card className={`border-0 shadow-lg ${overAllocated ? 'ring-2 ring-vms-danger/50' : 'ring-1 ring-vms-gray-200'}`}>
            <CardHeader className={`${overAllocated ? 'bg-vms-danger-bg' : 'bg-vms-gray-50'} border-b ${overAllocated ? 'border-vms-danger/20' : 'border-vms-gray-100'} py-5`}>
              <h3 className={`font-bold text-lg flex items-center ${overAllocated ? 'text-vms-danger' : 'text-vms-primary-dark'}`}>
                <BedDouble className="w-5 h-5 mr-2" /> Required Room Blocks
              </h3>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* Single Rooms */}
                <div className="bg-white p-6 rounded-xl border border-vms-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-vms-primary/30 transition-colors">
                  <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest mb-4">Single</span>
                  <span className={`text-5xl font-black mb-3 ${inventory && blocks.single_rooms > inventory.single_rooms ? 'text-vms-danger' : 'text-vms-primary-dark'}`}>
                    {blocks.single_rooms}
                  </span>
                  <div className="w-full bg-vms-gray-50 py-2 rounded-md text-xs font-bold text-vms-gray-500">
                    Avail: {inventory?.single_rooms || 0}
                  </div>
                </div>

                {/* Double Rooms */}
                <div className="bg-white p-6 rounded-xl border border-vms-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-vms-primary/30 transition-colors">
                  <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest mb-4">Double / Twin</span>
                  <span className={`text-5xl font-black mb-3 ${inventory && blocks.double_rooms > inventory.double_rooms ? 'text-vms-danger' : 'text-vms-primary-dark'}`}>
                    {blocks.double_rooms}
                  </span>
                  <div className="w-full bg-vms-gray-50 py-2 rounded-md text-xs font-bold text-vms-gray-500">
                    Avail: {inventory?.double_rooms || 0}
                  </div>
                </div>

                {/* Triple Rooms */}
                <div className="bg-white p-6 rounded-xl border border-vms-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-vms-primary/30 transition-colors">
                  <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest mb-4">Triple</span>
                  <span className={`text-5xl font-black mb-3 ${inventory && blocks.triple_rooms > inventory.triple_rooms ? 'text-vms-danger' : 'text-vms-primary-dark'}`}>
                    {blocks.triple_rooms}
                  </span>
                  <div className="w-full bg-vms-gray-50 py-2 rounded-md text-xs font-bold text-vms-gray-500">
                    Avail: {inventory?.triple_rooms || 0}
                  </div>
                </div>

                {/* Suites */}
                <div className="bg-white p-6 rounded-xl border border-vms-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-vms-primary/30 transition-colors">
                  <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest mb-4">Suites</span>
                  <span className={`text-5xl font-black mb-3 ${inventory && blocks.suites > inventory.suites ? 'text-vms-danger' : 'text-vms-primary-dark'}`}>
                    {blocks.suites}
                  </span>
                  <div className="w-full bg-vms-gray-50 py-2 rounded-md text-xs font-bold text-vms-gray-500">
                    Avail: {inventory?.suites || 0}
                  </div>
                </div>

              </div>
              
              <div className="mt-8 pt-6 border-t border-vms-gray-100 flex justify-between items-center">
                <p className="text-xs font-medium text-vms-gray-500">Engine uses global & hotel-specific occupancy matrices.</p>
                {savedReq && !saving && (
                   <span className="text-vms-success text-sm font-bold flex items-center bg-vms-success-bg px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4 mr-1.5"/> Validated</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Section (Hierarchy Counts) */}
        <div className="lg:col-span-4">
          <Card className="border-0 shadow-md ring-1 ring-vms-gray-200">
            <CardHeader className="bg-vms-primary-dark text-white rounded-t-xl py-5">
              <h3 className="font-bold text-lg">Occupancy Matrix</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-8">
                {Object.keys(counts).map((key) => {
                  const label = key.split('_')[0].toUpperCase();
                  return (
                    <div key={key} className="flex justify-between items-center bg-vms-gray-50 p-2 rounded border border-vms-gray-100">
                      <label className="font-bold text-sm text-vms-primary-dark ml-2 w-16">{label}</label>
                      <input 
                        type="number" 
                        min="0"
                        disabled={!isAdmin}
                        className="w-20 border-0 rounded bg-white shadow-inner p-2 text-center font-black text-lg focus:ring-2 focus:ring-vms-primary"
                        value={counts[key as keyof HierarchyCounts]} 
                        onChange={(e) => handleChange(key as keyof HierarchyCounts, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="bg-vms-gray-50 p-4 rounded-lg border border-vms-gray-100 mb-6 flex justify-between items-center">
                <span className="font-bold text-vms-gray-600 text-sm">Total PAX:</span>
                <span className={`text-2xl font-black ${totalPax > (event.expected_pax || 0) ? "text-vms-danger" : "text-vms-success"}`}>
                  {totalPax} <span className="text-sm text-vms-gray-400 font-bold">/ {event.expected_pax}</span>
                </span>
              </div>
              
              {isAdmin && (
                <Button 
                  onClick={handleSave}
                  disabled={saving || overAllocated}
                  className="w-full shadow-md py-6 text-base"
                >
                  {saving ? 'Processing...' : (savedReq ? <><Save className="w-4 h-4 mr-2"/> Update Matrix</> : <><Lock className="w-4 h-4 mr-2"/> Lock Blocks</>)}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
