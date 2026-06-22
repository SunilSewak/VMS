import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useParams, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { VmsEvent } from "@/types/event";
import { isEventClosed } from "@/lib/eventLocking";
import { CalendarDays, MapPin, Building, Users, Briefcase, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

const LIFECYCLE_STAGES = [
  { id: 'planning', label: 'Planning', statuses: ['DRAFT', 'PLANNED'] },
  { id: 'venue', label: 'Venue', statuses: [] },
  { id: 'accommodation', label: 'Accommodation', statuses: [] },
  { id: 'rooming', label: 'Rooming', statuses: ['ROOMING_FINALIZED'] },
  { id: 'invoice', label: 'Invoice', statuses: ['INVOICE_PENDING'] },
  { id: 'audit', label: 'Audit', statuses: ['INVOICE_AUDIT'] },
  { id: 'sap', label: 'SAP', statuses: ['PAYMENT_PENDING'] },
  { id: 'closed', label: 'Closed', statuses: ['CLOSED', 'EXECUTED'] }
];

const getActiveStageIndex = (status: string) => {
  if (['CLOSED', 'EXECUTED'].includes(status)) return 7;
  if (['PAYMENT_PENDING'].includes(status)) return 6;
  if (['INVOICE_AUDIT'].includes(status)) return 5;
  if (['INVOICE_PENDING'].includes(status)) return 4;
  if (['ROOMING_FINALIZED'].includes(status)) return 3;
  return 0; 
};

export function EventWorkspaceLayout() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;
      const { data } = await supabase
        .from('events')
        .select('*, division:divisions(division_name, cluster_id, cluster:clusters(cluster_name)), meeting_type:meeting_types(meeting_type_name), city:cities(city_name)')
        .eq('id', eventId)
        .single();
      
      if (data) {
        setEvent(data);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]);

  if (loading) return <div className="p-8 font-medium text-vms-primary">Loading workspace...</div>;
  if (!event) return <div className="p-8 text-vms-danger">Event not found.</div>;

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
  ];

  const activeIndex = getActiveStageIndex(event.lifecycle_status);
  
  const getStatusBadge = (status: string) => {
    if (['DRAFT', 'PLANNED'].includes(status)) return <Badge variant="default" className="text-sm px-3 py-1">Planning</Badge>;
    if (['CLOSED', 'EXECUTED'].includes(status)) return <Badge variant="success" className="text-sm px-3 py-1">Closed</Badge>;
    if (['CANCELLED'].includes(status)) return <Badge variant="danger" className="text-sm px-3 py-1">Cancelled</Badge>;
    return <Badge variant="info" className="text-sm px-3 py-1">{status}</Badge>;
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F7FB] animate-in fade-in duration-500">
      
      {/* Executive Event Banner */}
      <Card className="border-0 shadow-xl mb-6 rounded-2xl overflow-hidden relative bg-vms-primary-dark text-white">
        <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Briefcase className="w-64 h-64" />
        </div>
        
        <CardContent className="p-0">
          <div className="p-8 lg:p-10 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                {getStatusBadge(event.lifecycle_status)}
                <span className="font-bold text-vms-accent tracking-widest uppercase text-sm">{event.event_code || 'CODE PENDING'}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">{event.event_name}</h1>
              <p className="text-vms-primary-light font-medium flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" /> {event.meeting_type?.meeting_type_name || 'Meeting Type TBD'} | {event.division?.cluster?.cluster_name ? `${event.division.cluster.cluster_name} - ` : ''}{event.division?.division_name || 'Division TBD'}
              </p>
            </div>
          </div>
          
          <div className="bg-black/20 p-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 text-sm">
            <div className="flex flex-col">
              <span className="text-vms-gray-400 uppercase tracking-widest font-bold text-xs mb-1 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> Destination</span>
              <span className="font-bold text-white text-base">{event.city?.name || 'Pending'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-vms-gray-400 uppercase tracking-widest font-bold text-xs mb-1 flex items-center"><Building className="w-3.5 h-3.5 mr-1" /> Selected Venue</span>
              <span className="font-bold text-white text-base truncate pr-4">{event.hotel_name || 'Sourcing Active'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-vms-gray-400 uppercase tracking-widest font-bold text-xs mb-1 flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1" /> Operational Dates</span>
              <span className="font-bold text-white text-base">
                {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : 'TBD'} - 
                {event.end_date ? new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : 'TBD'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-vms-gray-400 uppercase tracking-widest font-bold text-xs mb-1 flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> Scale</span>
              <span className="font-bold text-white text-base">{event.expected_pax ? `${event.expected_pax} PAX` : 'TBD'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Progress Tracker */}
      <div className="px-8 py-6 mb-6">
        <div className="relative flex justify-between items-center max-w-5xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-vms-gray-200 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-vms-success rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${(activeIndex / (LIFECYCLE_STAGES.length - 1)) * 100}%` }}
          />
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div key={stage.id} className="relative flex flex-col items-center group/stage">
                <div className={`w-5 h-5 rounded-full border-4 bg-white z-10 transition-all duration-500 ${isCompleted ? 'border-vms-success' : 'border-vms-gray-300'} ${isCurrent ? 'ring-8 ring-vms-success/20 bg-vms-success border-vms-success scale-125' : ''}`} />
                <span className={`absolute top-8 text-xs font-black whitespace-nowrap uppercase tracking-widest transition-colors duration-500 ${isCurrent ? 'text-vms-primary-dark scale-110 origin-top' : isCompleted ? 'text-vms-gray-600' : 'text-vms-gray-400'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Workspace Navigation */}
      <div className="bg-white px-8 rounded-t-2xl shadow-sm border-b border-vms-gray-100 sticky top-0 z-20 mt-8">
        <nav className="flex space-x-1 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const fullPath = `/events/${eventId}/${tab.path}`;
            const isActive = location.pathname.startsWith(fullPath);
            return (
              <Link
                key={tab.path}
                to={fullPath}
                className={`px-6 py-4 whitespace-nowrap text-sm font-bold tracking-wide transition-all ${
                  isActive
                    ? "border-b-4 border-vms-primary text-vms-primary-dark"
                    : "text-vms-gray-500 hover:text-vms-primary hover:bg-vms-gray-50 border-b-4 border-transparent"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 bg-white rounded-b-2xl shadow-sm p-8 min-h-[500px]">
        <Outlet context={{ event }} />
      </div>
    </div>
  );
}
