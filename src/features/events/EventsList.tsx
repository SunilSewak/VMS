import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CalendarDays, MapPin, Building, Users, ChevronRight, Plus, Search, Filter, MoreHorizontal, Briefcase } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

// Helper to determine the current active stage index based on DB status
const getActiveStageIndex = (status: string) => {
  if (['CLOSED', 'EXECUTED'].includes(status)) return 7;
  if (['PAYMENT_PENDING'].includes(status)) return 6;
  if (['INVOICE_AUDIT'].includes(status)) return 5;
  if (['INVOICE_PENDING'].includes(status)) return 4;
  if (['ROOMING_PENDING', 'ROOMING_FINALIZED'].includes(status)) return 3;
  if (['ACCOMMODATION_PENDING'].includes(status)) return 2;
  if (['VENUE_PROPOSED', 'APPROVED', 'ALTERNATIVE_REQUESTED'].includes(status)) return 1;
  return 0; 
};

export function EventsList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*, division:divisions(division_name), meeting_type:meeting_types(meeting_type_name), city:cities(city_name)')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Registry Query Failed:");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Details:", error.details);
        console.error("Hint:", error.hint);
      }
        
      if (data) setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(e => 
      e.event_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (e.city?.city_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const getStatusBadge = (status: string) => {
    if (['DRAFT', 'PLANNED'].includes(status)) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 border shadow-none">Planning</Badge>;
    if (['VENUE_PROPOSED', 'APPROVED', 'ALTERNATIVE_REQUESTED'].includes(status)) return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 border shadow-none">Venue</Badge>;
    if (['ACCOMMODATION_PENDING'].includes(status)) return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200 border shadow-none">Accommodation</Badge>;
    if (['ROOMING_PENDING', 'ROOMING_FINALIZED'].includes(status)) return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 border shadow-none">Rooming</Badge>;
    if (['INVOICE_PENDING'].includes(status)) return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 border shadow-none">Invoice</Badge>;
    if (['INVOICE_AUDIT'].includes(status)) return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200 border shadow-none">Audit</Badge>;
    if (['PAYMENT_PENDING'].includes(status)) return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200 border shadow-none">SAP</Badge>;
    if (['CLOSED', 'EXECUTED'].includes(status)) return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 border shadow-none">Closed</Badge>;
    if (['CANCELLED'].includes(status)) return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 border shadow-none">Cancelled</Badge>;
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200 border shadow-none">{status}</Badge>;
  };

  if (loading) return <div className="p-8 text-vms-primary font-medium">Loading Events Registry...</div>;

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      
      {/* Registry Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-vms-primary-dark tracking-tight">Event Management</h1>
          <p className="text-vms-gray-600 mt-1 text-sm font-medium">{filteredEvents.length} Active Event{filteredEvents.length !== 1 ? 's' : ''} • Global registry of active and historical venue bookings.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vms-gray-500" />
            <input 
              type="text" 
              placeholder="Search events, cities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-vms-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vms-primary"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto bg-white">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button onClick={() => navigate('/events/create')} className="w-full sm:w-auto shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Quick Create
          </Button>
        </div>
      </div>

      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="default" className="bg-white hover:bg-vms-gray-50 cursor-pointer">Status: All Active</Badge>
        <Badge variant="default" className="bg-white hover:bg-vms-gray-50 cursor-pointer">Date Range: Upcoming</Badge>
      </div>

      {/* Event Cards */}
      <div className="space-y-4 pb-12">
        {filteredEvents.length === 0 ? (
          <Card className="border-0 shadow-sm border-t-4 border-t-vms-primary">
            <CardContent className="p-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-vms-primary-light rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-vms-primary" />
              </div>
              <h3 className="text-2xl font-black text-vms-primary-dark mb-2">No Events Yet</h3>
              <p className="text-vms-gray-500 max-w-md mb-8">
                Create your first event to begin venue discovery, rooming management, invoice auditing, and SAP closure workflows.
              </p>
              <Button size="lg" onClick={() => navigate('/events/create')} className="shadow-md">
                <Plus className="w-5 h-5 mr-2" /> Create First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(evt => {
            const activeIndex = getActiveStageIndex(evt.lifecycle_status);
            
            return (
              <Card key={evt.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group flex flex-col">
                <div className="flex flex-col lg:flex-row flex-1">
                  
                  {/* Left Identity Column */}
                  <div className="lg:w-[30%] bg-vms-primary-dark text-white p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                      <Briefcase className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10 mb-3">
                      <h3 className="text-xl font-black leading-tight mb-1">{evt.event_name}</h3>
                      <span className="text-xs font-bold text-vms-accent tracking-widest uppercase">{evt.event_code || '-'}</span>
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-2 gap-y-3 gap-x-3 mb-3">
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Division</span>
                        <span className="text-sm font-bold">{evt.division?.division_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">City</span>
                        <span className="text-sm font-bold">{evt.city?.city_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Start Date</span>
                        <span className="text-sm font-bold">{evt.start_date ? new Date(evt.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">End Date</span>
                        <span className="text-sm font-bold">{evt.end_date ? new Date(evt.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Expected PAX</span>
                        <span className="text-sm font-bold">{evt.expected_pax || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Guaranteed PAX</span>
                        <span className="text-sm font-bold">{evt.guaranteed_pax || '-'}</span>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      {getStatusBadge(evt.lifecycle_status)}
                    </div>
                  </div>

                  {/* Center Operations Column */}
                  <div className="flex-1 p-4 bg-white flex flex-col justify-center border-r border-vms-gray-100">
                    <div className="w-full">
                      <h4 className="text-xs font-bold text-vms-gray-500 uppercase tracking-widest mb-6 text-center">Operational Lifecycle</h4>
                      <div className="relative flex justify-between items-center w-full px-2">
                        {/* Base Gray Line */}
                        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 bg-vms-gray-100 rounded-full" />
                        
                        {/* Green Line for Completed Stages */}
                        <div 
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-l-full transition-all duration-500" 
                          style={{ width: activeIndex > 0 ? `calc(${((activeIndex) / (LIFECYCLE_STAGES.length - 1)) * 100}% - 1rem)` : '0%' }}
                        />

                        {/* Note: In AVEMS, current stage is the gold node, the line before it is completed, so the green line goes all the way to activeIndex. If we wanted the line leading up to the current stage to be gold, we would split it, but a solid green line to the current gold node perfectly communicates "completed path". Let's stick to green for the path and gold for the active node. */}

                        {LIFECYCLE_STAGES.map((stage, idx) => {
                          const isCompleted = idx < activeIndex;
                          const isCurrent = idx === activeIndex;
                          
                          let circleClasses = 'border-vms-gray-300 bg-white';
                          if (isCompleted) circleClasses = 'border-green-500 bg-green-500';
                          if (isCurrent) circleClasses = 'border-vms-accent bg-vms-accent ring-4 ring-vms-accent/30 scale-125';

                          return (
                            <div key={stage.id} className="relative flex flex-col items-center group/stage z-10 w-4">
                              <div className={`w-4 h-4 rounded-full border-2 transition-all ${circleClasses}`} />
                              <span className={`absolute top-6 text-[10px] whitespace-nowrap uppercase tracking-wider ${isCurrent ? 'text-vms-primary-dark font-black' : 'text-vms-gray-400 font-bold'}`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Column */}
                  <div className="lg:w-[15%] p-4 bg-vms-gray-50 flex flex-col justify-center items-stretch space-y-2">
                    <Button variant="secondary" onClick={() => navigate(`/events/${evt.id}/summary`)} className="w-full font-bold shadow-md bg-vms-primary text-white hover:bg-vms-primary-dark">
                      Open Workspace
                    </Button>
                    
                    {activeIndex >= 1 && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/events/${evt.id}/venue`)} className="w-full bg-white text-xs">
                        Venue
                      </Button>
                    )}
                    {activeIndex >= 2 && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/events/${evt.id}/accommodation`)} className="w-full bg-white text-xs">
                        Accommodation
                      </Button>
                    )}
                    {activeIndex >= 3 && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/events/${evt.id}/rooming`)} className="w-full bg-white text-xs">
                        Rooming
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bottom Strip */}
                {(evt.division?.division_name || evt.meeting_type?.meeting_type_name || (evt.residential_flag !== null && evt.residential_flag !== undefined) || evt.zone_id) && (
                  <div className="bg-white border-t border-vms-gray-100 p-2 flex flex-wrap gap-2 text-xs font-medium text-vms-gray-600">
                    {evt.division?.division_name && (
                      <div className="bg-vms-gray-50 px-3 py-1 rounded-md border border-vms-gray-100 flex items-center">
                        <span className="text-vms-gray-400 uppercase tracking-widest text-[9px] mr-2">Div</span> {evt.division.division_name}
                      </div>
                    )}
                    {evt.meeting_type?.meeting_type_name && (
                      <div className="bg-vms-gray-50 px-3 py-1 rounded-md border border-vms-gray-100 flex items-center">
                        <span className="text-vms-gray-400 uppercase tracking-widest text-[9px] mr-2">Type</span> {evt.meeting_type.meeting_type_name}
                      </div>
                    )}
                    {evt.residential_flag !== null && evt.residential_flag !== undefined && (
                      <div className="bg-vms-gray-50 px-3 py-1 rounded-md border border-vms-gray-100 flex items-center">
                        <span className="text-vms-gray-400 uppercase tracking-widest text-[9px] mr-2">Res</span> {evt.residential_flag ? 'Residential' : 'Non-Residential'}
                      </div>
                    )}
                    {evt.zone_id && (
                      <div className="bg-vms-gray-50 px-3 py-1 rounded-md border border-vms-gray-100 flex items-center">
                        <span className="text-vms-gray-400 uppercase tracking-widest text-[9px] mr-2">Zone</span> {evt.zone_id}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
