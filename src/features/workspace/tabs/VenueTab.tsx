import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { VenueAllocation } from "@/types/venue";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { logEventActivity } from "@/lib/eventLogger";
import { VenueAllocationModal } from "./VenueAllocationModal";

export function VenueTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  const [allocations, setAllocations] = useState<VenueAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const isSalesHead = user?.role?.name === 'SALES_HEAD';
  const isAdmin = user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'VMS_ADMIN';

  const fetchAllocations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('venue_allocations')
      .select('*, hotel:hotels(hotel_name), hall:halls(hall_name, capacity)')
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
    
    // 1. Update Allocation
    await supabase.from('venue_allocations').update({ status: 'Approved' }).eq('id', allocation.id);
    
    // 2. Reserve Calendar
    await supabase.from('venue_calendar').insert({
      hotel_id: allocation.hotel_id,
      hall_id: allocation.hall_id,
      event_id: event.id,
      start_date: event.start_date,
      end_date: event.end_date,
      status: 'Reserved'
    });

    // 3. Update Event
    await supabase.from('events').update({ lifecycle_status: 'APPROVED' }).eq('id', event.id);
    await logEventActivity(event.id, 'APPROVED', user.id, event.lifecycle_status, 'APPROVED');
    
    fetchAllocations();
  };

  const handleReject = async (allocation: VenueAllocation) => {
    if (!user) return;
    
    // 1. Update Allocation
    await supabase.from('venue_allocations').update({ status: 'Rejected' }).eq('id', allocation.id);
    
    // 2. Rollback Event Status
    await supabase.from('events').update({ lifecycle_status: 'ALTERNATIVE_REQUESTED' }).eq('id', event.id);
    await logEventActivity(event.id, 'ALTERNATIVE_REQUESTED', user.id, event.lifecycle_status, 'ALTERNATIVE_REQUESTED');
    
    fetchAllocations();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Venue Allocation</h2>
        {isAdmin && event.lifecycle_status !== 'APPROVED' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
          >
            Propose Venue
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading allocations...</p>
      ) : allocations.length === 0 ? (
        <div className="text-center p-8 border rounded bg-gray-50">
          <p className="text-gray-500">No venue allocations proposed yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allocations.map(alloc => (
            <div key={alloc.id} className="border rounded p-4 flex justify-between items-center bg-white shadow-sm">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    alloc.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    alloc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alloc.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{(alloc as any).hotel?.hotel_name}</h3>
                <p className="text-gray-600">Hall: {(alloc as any).hall?.hall_name} (Cap: {(alloc as any).hall?.capacity})</p>
              </div>
              
              {isSalesHead && alloc.status === 'Proposed' && (
                <div className="flex space-x-2">
                  <button onClick={() => handleReject(alloc)} className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50">Reject</button>
                  <button onClick={() => handleApprove(alloc)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                </div>
              )}
            </div>
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
