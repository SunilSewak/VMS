import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useParams, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { VmsEvent } from "@/types/event";

export function EventWorkspaceLayout() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const [event, setEvent] = useState<VmsEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;
      const { data } = await supabase
        .from('events')
        .select('*, division:divisions(name), meeting_type:meeting_types(name), city:cities(name)')
        .eq('id', eventId)
        .single();
      
      if (data) setEvent(data as any);
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]);

  if (loading) return <div>Loading workspace...</div>;
  if (!event) return <div>Event not found.</div>;

  // Exact path redirect
  if (location.pathname === `/events/${eventId}` || location.pathname === `/events/${eventId}/`) {
    return <Navigate to={`/events/${eventId}/summary`} replace />;
  }

  const tabs = [
    { name: "Summary", path: "summary" },
    { name: "Venue", path: "venue" },
    { name: "Accommodation", path: "accommodation" },
    { name: "Rooming", path: "rooming" },
    { name: "Invoices", path: "invoices" },
    { name: "Audit", path: "audit" },
    { name: "SAP Closure", path: "sap" },
    { name: "Timeline", path: "timeline" },
    { name: "Documents", path: "documents" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Event Header Context */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{event.event_name}</h1>
            <p className="text-gray-500 font-medium">{event.event_code || 'Code Pending'}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 font-bold rounded-full text-sm">
            {event.lifecycle_status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
          <div>
            <span className="block text-gray-400 text-xs uppercase tracking-wider">Division</span>
            <span className="font-medium">{(event as any).division?.name || '-'}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs uppercase tracking-wider">Meeting Type</span>
            <span className="font-medium">{(event as any).meeting_type?.name || '-'}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs uppercase tracking-wider">City</span>
            <span className="font-medium">{(event as any).city?.name || '-'}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs uppercase tracking-wider">Dates</span>
            <span className="font-medium">
              {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'} - 
              {event.end_date ? new Date(event.end_date).toLocaleDateString() : 'TBD'}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Navigation */}
      <div className="border-b mb-6 bg-white px-6 pt-4 rounded shadow">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map(tab => {
            const fullPath = `/events/${eventId}/${tab.path}`;
            const isActive = location.pathname.startsWith(fullPath);
            return (
              <Link
                key={tab.path}
                to={fullPath}
                className={`pb-3 whitespace-nowrap ${
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white rounded shadow overflow-auto">
        <Outlet context={{ event }} />
      </div>
    </div>
  );
}
