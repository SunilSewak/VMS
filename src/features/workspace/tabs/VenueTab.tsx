import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { VenueAllocation } from "@/types/venue";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { logEventActivity } from "@/lib/eventLogger";
import { VenueAllocationModal } from "./VenueAllocationModal";
import { isEventClosed } from "@/lib/eventLocking";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPin, Users, Star, BedDouble, CheckCircle, XCircle, Search, Sparkles } from "lucide-react";

export function VenueTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  const [allocations, setAllocations] = useState<VenueAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const closed = isEventClosed(event.lifecycle_status);
  const isSalesHead = user?.role?.role_name === 'SALES_HEAD' && !closed;
  const isAdmin = (user?.role?.role_name === 'SUPER_ADMIN' || user?.role?.role_name === 'VMS_ADMIN') && !closed;

  const fetchAllocations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('venue_allocations')
      .select('*, hotel:hotels(hotel_name, city_id), hall:halls(hall_name, capacity)')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });
    
    if (data) setAllocations(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllocations();
  }, [event.id]);

  const handleApprove = async (allocation: VenueAllocation) => {
    if (!user || !event.start_date || !event.end_date) return;
    
    const { data: existingBooking } = await supabase.from('bookings').select('id').eq('event_id', event.id).single();
    if (existingBooking) {
      console.warn("A booking already exists for this event.");
      return;
    }

    await supabase.from('venue_allocations').update({ status: 'Approved' }).eq('id', allocation.id);
    
    await supabase.from('venue_calendar').insert({
      hotel_id: allocation.hotel_id,
      hall_id: allocation.hall_id,
      event_id: event.id,
      start_date: event.start_date,
      end_date: event.end_date,
      status: 'Reserved'
    });

    await supabase.from('bookings').insert({
      event_id: event.id,
      hotel_id: allocation.hotel_id,
      hall_id: allocation.hall_id,
      booking_status: 'Pending',
      booking_date: new Date().toISOString().split('T')[0]
    });
    await logEventActivity(event.id, 'BOOKING_CREATED', user.id, event.lifecycle_status, event.lifecycle_status);

    await supabase.from('events').update({ lifecycle_status: 'APPROVED' }).eq('id', event.id);
    await logEventActivity(event.id, 'APPROVED', user.id, event.lifecycle_status, 'APPROVED');
    
    fetchAllocations();
  };

  const handleReject = async (allocation: VenueAllocation) => {
    if (!user) return;
    await supabase.from('venue_allocations').update({ status: 'Rejected' }).eq('id', allocation.id);
    await supabase.from('events').update({ lifecycle_status: 'ALTERNATIVE_REQUESTED' }).eq('id', event.id);
    await logEventActivity(event.id, 'ALTERNATIVE_REQUESTED', user.id, event.lifecycle_status, 'ALTERNATIVE_REQUESTED');
    fetchAllocations();
  };

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-vms-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-vms-primary-dark tracking-tight">Venue Discovery</h2>
          <p className="text-vms-gray-600 mt-1">Sourcing and approval of premium hotel properties.</p>
        </div>
        {isAdmin && event.lifecycle_status !== 'APPROVED' && (
          <Button onClick={() => setShowModal(true)} className="shadow-md text-sm">
            <Search className="w-4 h-4 mr-2" /> Source New Property
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-10 text-center font-bold text-vms-gray-500 animate-pulse">Scanning premium properties...</div>
      ) : allocations.length === 0 ? (
        <Card className="border-0 shadow-sm border-t-4 border-t-vms-accent">
          <CardContent className="p-16 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-vms-accent-light rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-vms-accent-dark" />
            </div>
            <h3 className="text-2xl font-black text-vms-primary-dark mb-2">No Properties Shortlisted</h3>
            <p className="text-vms-gray-500 max-w-md mb-8">
              The sourcing team has not proposed any venues for this event yet. Initiate a property search to begin.
            </p>
            {isAdmin && event.lifecycle_status !== 'APPROVED' && (
              <Button size="lg" onClick={() => setShowModal(true)} className="shadow-md">
                <Search className="w-5 h-5 mr-2" /> Start Sourcing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {allocations.map((alloc: any) => (
            <Card key={alloc.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group rounded-xl">
              
              <div className="flex flex-col lg:flex-row h-full">
                {/* Hero Image (Placeholder logic based on hotel name length to generate pseudo-random photo) */}
                <div className="lg:w-2/5 relative h-64 lg:h-auto overflow-hidden bg-vms-gray-900">
                  <div className="absolute inset-0 bg-black/20 z-10" />
                  <img 
                    src={`https://images.unsplash.com/photo-${(alloc.hotel?.hotel_name.length % 2 === 0) ? '1566073771259-6a8506099945' : '1542314831-c53cd3814c0a'}?auto=format&fit=crop&q=80&w=800`} 
                    alt="Hotel Exterior"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <Badge variant={
                      alloc.status === 'Approved' ? 'success' :
                      alloc.status === 'Rejected' ? 'danger' :
                      'warning'
                    } className="text-sm px-3 shadow-md backdrop-blur-md bg-white/90 border-0 uppercase font-black">
                      {alloc.status}
                    </Badge>
                  </div>
                </div>

                {/* Hotel Details Column */}
                <div className="lg:w-3/5 p-8 flex flex-col justify-between bg-white relative">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-vms-accent mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-vms-gray-600 text-xs font-bold ml-2">5.0 Property</span>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-vms-primary-dark tracking-tight leading-none mb-3">
                      {alloc.hotel?.hotel_name}
                    </h3>
                    
                    <p className="text-vms-primary text-sm font-bold flex items-center mb-6">
                      <MapPin className="w-4 h-4 mr-1.5" /> {(event as any).city?.name || 'City Center'}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-vms-gray-50 p-4 rounded-lg border border-vms-gray-100">
                        <p className="text-[10px] font-black uppercase text-vms-gray-400 tracking-widest mb-1 flex items-center"><Users className="w-3 h-3 mr-1" /> Hall Capacity</p>
                        <p className="text-lg font-black text-vms-primary-dark">{alloc.hall?.hall_name}</p>
                        <p className="text-sm font-medium text-vms-gray-600">Max {alloc.hall?.capacity} PAX</p>
                      </div>
                      
                      <div className="bg-vms-gray-50 p-4 rounded-lg border border-vms-gray-100">
                        <p className="text-[10px] font-black uppercase text-vms-gray-400 tracking-widest mb-1 flex items-center"><BedDouble className="w-3 h-3 mr-1" /> Est. Inventory</p>
                        <p className="text-lg font-black text-vms-primary-dark">Available</p>
                        <p className="text-sm font-medium text-vms-success flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1"/> Validated</p>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="flex justify-between items-center border-t border-vms-gray-100 pt-6 mt-2">
                    <p className="text-xs font-medium text-vms-gray-400">
                      Proposed on {new Date(alloc.created_at).toLocaleDateString()}
                    </p>
                    
                    {isSalesHead && alloc.status === 'Proposed' && (
                      <div className="flex space-x-3">
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleReject(alloc)}>
                          <XCircle className="w-4 h-4 mr-2" /> Decline
                        </Button>
                        <Button className="bg-vms-success hover:bg-green-700 text-white shadow-md" onClick={() => handleApprove(alloc)}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve Venue
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <VenueAllocationModal 
          event={event} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            fetchAllocations();
          }} 
        />
      )}
    </div>
  );
}
