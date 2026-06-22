import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { CalendarDays, MapPin, Building, Users, ChevronRight, Plus, Search, Filter, MoreHorizontal, Briefcase, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const LIFECYCLE_STAGES = [
  { id: 'planning', label: 'Planning', statuses: ['DRAFT', 'PLANNED'] },
  { id: 'venue', label: 'Venue', statuses: ['VENUE_PROPOSED'] },
  { id: 'review', label: 'Review', statuses: ['ALTERNATIVE_REQUESTED'] },
  { id: 'booked', label: 'Booked', statuses: ['APPROVED'] },
  { id: 'room-blocking', label: 'Room Blocking', statuses: ['ACCOMMODATION_PENDING'] },
  { id: 'rooming', label: 'Rooming', statuses: ['ROOMING_PENDING', 'ROOMING_FINALIZED'] },
  { id: 'invoice', label: 'Invoice', statuses: ['INVOICE_PENDING'] },
  { id: 'audit', label: 'Audit', statuses: ['INVOICE_AUDIT'] },
  { id: 'sap', label: 'SAP', statuses: ['PAYMENT_PENDING'] },
  { id: 'closed', label: 'Closed', statuses: ['CLOSED', 'EXECUTED'] }
];

// Helper to determine the current active stage index based on DB status
const getActiveStageIndex = (status: string) => {
  if (['CLOSED', 'EXECUTED'].includes(status)) return 9;
  if (['PAYMENT_PENDING'].includes(status)) return 8;
  if (['INVOICE_AUDIT'].includes(status)) return 7;
  if (['INVOICE_PENDING'].includes(status)) return 6;
  if (['ROOMING_PENDING', 'ROOMING_FINALIZED'].includes(status)) return 5;
  if (['ACCOMMODATION_PENDING'].includes(status)) return 4;
  if (['APPROVED'].includes(status)) return 3;
  if (['ALTERNATIVE_REQUESTED'].includes(status)) return 2;
  if (['VENUE_PROPOSED'].includes(status)) return 1;
  return 0; 
};

export function EventsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSalesHead = user?.role?.role_name === 'SALES_HEAD';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *, 
          division:divisions(division_name), 
          meeting_type:meeting_types(meeting_type_name), 
          city:cities(city_name),
          venue:venues(venue_name),
          hall:halls(hall_name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Registry Query Failed:", error);
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
    if (status === 'VENUE_PROPOSED') return <Badge className="bg-amber-100 text-amber-800 border-amber-200">🟠 Venue Review Pending</Badge>;
    if (status === 'ALTERNATIVE_REQUESTED') return <Badge className="bg-red-100 text-red-800 border-red-200">🔴 Alternative Requested</Badge>;
    if (status === 'ROOMING_PENDING' || status === 'ROOMING_FINALIZED') return <Badge className="bg-purple-100 text-purple-800 border-purple-200 shadow-none">🟣 Rooming Submitted</Badge>;
    if (status === 'INVOICE_PENDING') return <Badge className="bg-gray-800 text-white border-gray-900 shadow-none">⚫ Invoice Pending</Badge>;
    if (status === 'APPROVED') return <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none">🟢 Booked</Badge>;

    if (['DRAFT', 'PLANNED'].includes(status)) return <Badge className="bg-gray-100 text-gray-800 border-gray-200 shadow-none">Planning</Badge>;
    if (['ACCOMMODATION_PENDING'].includes(status)) return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 shadow-none">Room Blocking</Badge>;
    if (['INVOICE_AUDIT'].includes(status)) return <Badge className="bg-red-100 text-red-800 border-red-200 shadow-none">Audit</Badge>;
    if (['PAYMENT_PENDING'].includes(status)) return <Badge className="bg-teal-100 text-teal-800 border-teal-200 shadow-none">SAP</Badge>;
    if (['CLOSED', 'EXECUTED'].includes(status)) return <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none">Closed</Badge>;
    if (['CANCELLED'].includes(status)) return <Badge className="bg-gray-100 text-gray-800 border-gray-200 shadow-none">Cancelled</Badge>;
    
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200 shadow-none">{status}</Badge>;
  };

  const getHealthBadge = (status: string) => {
    if (status === 'ALTERNATIVE_REQUESTED' || status === 'ROOMING_PENDING') {
      return <Badge className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1 w-full justify-center"><AlertTriangle className="w-3 h-3" /> Attention Needed</Badge>;
    }
    if (status === 'DRAFT' || status === 'CANCELLED') {
      return <Badge className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1 w-full justify-center"><AlertCircle className="w-3 h-3" /> Blocked</Badge>;
    }
    return <Badge className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1 w-full justify-center"><CheckCircle className="w-3 h-3" /> Healthy</Badge>;
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
          {!isSalesHead && (
            <Button onClick={() => navigate('/events/create')} className="w-full sm:w-auto shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          )}
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
              {!isSalesHead && (
                <Button size="lg" onClick={() => navigate('/events/create')} className="shadow-md">
                  <Plus className="w-5 h-5 mr-2" /> Create Event
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(evt => {
            const activeIndex = getActiveStageIndex(evt.lifecycle_status);
            
            return (
              <Card key={evt.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                <div className="flex flex-col lg:flex-row flex-1">
                  
                  {/* Left Column (40%): Identity & Venue */}
                  <div className="lg:w-[40%] bg-white p-5 flex flex-col justify-between border-r border-vms-gray-100 relative">
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-vms-primary-dark leading-tight mb-1">{evt.event_name}</h3>
                      <span className="text-xs font-bold text-vms-accent tracking-widest uppercase">{evt.event_code || '-'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Division</span>
                        <span className="text-sm font-bold text-vms-gray-800">{evt.division?.division_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">City</span>
                        <span className="text-sm font-bold text-vms-gray-800">{evt.city?.city_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Dates</span>
                        <span className="text-sm font-bold text-vms-gray-800">
                          {evt.start_date ? new Date(evt.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Expected PAX</span>
                        <span className="text-sm font-bold text-vms-gray-800">{evt.expected_pax || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Hotel</span>
                        <span className="text-sm font-bold text-vms-gray-800 truncate max-w-[150px] inline-block">{evt.venue?.venue_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Hall</span>
                        <span className="text-sm font-bold text-vms-gray-800 truncate max-w-[150px] inline-block">{evt.hall?.hall_name || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Column (45%): Extended Lifecycle */}
                  <div className="flex-1 p-5 bg-vms-gray-50 flex flex-col justify-center border-r border-vms-gray-100">
                    <h4 className="text-xs font-bold text-vms-gray-500 uppercase tracking-widest mb-8 text-center">Operational Lifecycle</h4>
                    <div className="relative flex justify-between items-center w-full px-4">
                      {/* Base Gray Line */}
                      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-vms-gray-200 rounded-full" />
                      
                      {/* Green Line for Completed Stages */}
                      <div 
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-l-full transition-all duration-500" 
                        style={{ width: activeIndex > 0 ? `calc(${((activeIndex) / (LIFECYCLE_STAGES.length - 1)) * 100}% - 2rem)` : '0%' }}
                      />

                      {LIFECYCLE_STAGES.map((stage, idx) => {
                        const isCompleted = idx < activeIndex;
                        const isCurrent = idx === activeIndex;
                        
                        let circleClasses = 'border-vms-gray-300 bg-white';
                        if (isCompleted) circleClasses = 'border-green-500 bg-green-500';
                        if (isCurrent) circleClasses = 'border-vms-accent bg-vms-accent ring-4 ring-vms-accent/30 scale-125';

                        return (
                          <div key={stage.id} className="relative flex flex-col items-center group/stage z-10 w-2">
                            <div className={`w-3 h-3 rounded-full border-2 transition-all ${circleClasses}`} />
                            <span className={`absolute top-5 text-[8px] whitespace-normal text-center w-12 leading-tight uppercase tracking-wider ${isCurrent ? 'text-vms-primary-dark font-black' : 'text-vms-gray-400 font-bold'} -ml-5`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column (15%): Status, Health, Actions */}
                  <div className="lg:w-[15%] p-5 bg-white flex flex-col justify-between items-center">
                    <div className="w-full space-y-3">
                      <div className="w-full flex justify-center">{getStatusBadge(evt.lifecycle_status)}</div>
                      <div className="w-full flex justify-center">{getHealthBadge(evt.lifecycle_status)}</div>
                    </div>
                    
                    <div className="w-full mt-6">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/events/${evt.id}/summary`)} className="w-full bg-vms-primary text-white shadow-md font-bold">
                        Open Workspace
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bottom Strip: Rooming, Invoice, SAP Status */}
                <div className="bg-white border-t border-vms-gray-100 p-2 flex flex-wrap gap-4 text-xs font-medium text-vms-gray-600 justify-between items-center px-5">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-vms-gray-400 uppercase tracking-widest text-[10px]">Rooming:</span>
                      <span className="font-bold text-vms-primary-dark">
                        {evt.lifecycle_status === 'ROOMING_FINALIZED' || evt.lifecycle_status === 'ROOMING_PENDING' || activeIndex >= 5 ? evt.expected_pax : 0} / {evt.expected_pax || 0} Submitted
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-vms-gray-400 uppercase tracking-widest text-[10px]">Invoice:</span>
                      <span className="font-bold text-vms-primary-dark">
                        {activeIndex >= 6 && activeIndex < 7 ? 'Pending' : activeIndex >= 7 ? 'Audit' : 'Not Started'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-vms-gray-400 uppercase tracking-widest text-[10px]">SAP:</span>
                      <span className="font-bold text-vms-primary-dark">
                        {activeIndex >= 8 && activeIndex < 9 ? 'Pending' : activeIndex >= 9 ? 'Closed' : 'Not Started'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
