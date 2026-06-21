import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { logEventActivity } from "@/lib/eventLogger";

export function EventCreate() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expectedPax, setExpectedPax] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    const generatedEventCode = `EVT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create the event in DRAFT status
    const { data, error: insertError } = await supabase.from('events').insert({
      event_code: generatedEventCode,
      event_name: eventName,
      start_date: startDate,
      end_date: endDate,
      expected_pax: parseInt(expectedPax) || 0,
      lifecycle_status: 'DRAFT'
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (data) {
      await logEventActivity(data.id, 'CREATED', user.id, undefined, 'DRAFT');
      navigate('/events/registry');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Create New Event</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <input 
            type="text" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" 
            value={eventName} 
            onChange={(e) => setEventName(e.target.value)} 
            required 
            placeholder="e.g. Q3 Sales Kickoff"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input 
              type="date" 
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input 
              type="date" 
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expected Pax (Attendees)</label>
          <input 
            type="number" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" 
            value={expectedPax} 
            onChange={(e) => setExpectedPax(e.target.value)} 
            required 
            min="1"
          />
        </div>
        
        <div className="pt-4 flex space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/events/registry')}
            className="px-4 py-2 border rounded font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Event Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
