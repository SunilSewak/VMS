import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { VmsEvent } from "@/types/event";
import { recommendVenues, RecommendationResult } from "@/lib/recommendationEngine";
import { useAuthStore } from "@/store/authStore";
import { logEventActivity } from "@/lib/eventLogger";

interface Props {
  event: VmsEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export function VenueAllocationModal({ event, onClose, onSuccess }: Props) {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      const results = await recommendVenues(event);
      setRecommendations(results);
      setLoading(false);
    }
    fetchRecommendations();
  }, [event]);

  const handlePropose = async (hotelId: string, hallId: string) => {
    if (!user) return;
    setSubmitting(true);
    
    // 1. Insert Venue Allocation
    const { error: allocErr } = await supabase.from('venue_allocations').insert({
      event_id: event.id,
      hotel_id: hotelId,
      hall_id: hallId,
      status: 'Proposed',
      allocated_by: user.id
    });

    if (!allocErr) {
      // 2. Update Event Status
      await supabase.from('events').update({ lifecycle_status: 'VENUE_PROPOSED' }).eq('id', event.id);
      
      // 3. Log Activity
      await logEventActivity(event.id, 'VENUE_PROPOSED', user.id, event.lifecycle_status, 'VENUE_PROPOSED');
      
      onSuccess();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded shadow max-w-2xl w-full">Loading recommendations...</div>
  </div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Venue Recommendations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {recommendations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No approved and available venues found matching capacity for these dates.
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={`${rec.hotel.id}-${rec.hall.id}`} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Match Score: {rec.score.toFixed(0)}</span>
                      <h3 className="font-bold text-lg">{rec.hotel.hotel_name}</h3>
                    </div>
                    <p className="text-gray-600 mt-1">Hall: {rec.hall.hall_name} (Cap: {rec.hall.capacity})</p>
                  </div>
                  <button 
                    disabled={submitting}
                    onClick={() => handlePropose(rec.hotel.id, rec.hall.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Propose Venue
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
