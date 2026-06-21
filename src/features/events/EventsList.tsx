import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { VmsEvent } from "@/types/event";
import { Link } from "react-router-dom";

export function EventsList() {
  const [events, setEvents] = useState<VmsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*, division:divisions(name), meeting_type:meeting_types(name), city:cities(name)')
        .order('created_at', { ascending: false });
      if (data) setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Event Registry</h2>
        <Link to="/events/create" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">
          New Event
        </Link>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3">Code</th>
            <th className="p-3">Name</th>
            <th className="p-3">Division</th>
            <th className="p-3">City</th>
            <th className="p-3">Start Date</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr><td colSpan={7} className="p-3 text-center text-gray-500">No events found.</td></tr>
          ) : events.map(evt => (
            <tr key={evt.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium text-blue-600">{evt.event_code || 'TBD'}</td>
              <td className="p-3 font-medium">{evt.event_name}</td>
              <td className="p-3">{(evt as any).division?.name || '-'}</td>
              <td className="p-3">{(evt as any).city?.name || '-'}</td>
              <td className="p-3">{evt.start_date || '-'}</td>
              <td className="p-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs border">
                  {evt.lifecycle_status}
                </span>
              </td>
              <td className="p-3 text-right">
                <Link to={`/events/${evt.id}/summary`} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                  View Workspace
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
