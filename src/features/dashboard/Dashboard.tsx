import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { CalendarDays, AlertCircle, CheckCircle, Clock, ChevronRight, Plus, ArrowRight, FileText, Bell, MapPin, Users, CheckSquare } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSalesHead = user?.role?.role_name === 'SALES_HEAD';

  const [stats, setStats] = useState({ total: 0, drafts: 0, active: 0, completed: 0 });
  const [salesStats, setSalesStats] = useState({ myEvents: 0, venuePending: 0, roomingPending: 0, finalizationPending: 0 });
  const [adminStats, setAdminStats] = useState({ venueReviews: 0, roomingDue: 0, invoiceAudit: 0, sapPending: 0 });
  
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // Note: In a real app we'd filter by user_id for My Events if isSalesHead, but for now we'll use all events
      const { data: allEvents } = await supabase
        .from('events')
        .select('id, lifecycle_status, event_name, start_date, created_at')
        .order('created_at', { ascending: false });

      if (allEvents) {
        // VMS Admin Stats
        const total = allEvents.length;
        const drafts = allEvents.filter(e => e.lifecycle_status === 'DRAFT' || e.lifecycle_status === 'PLANNED').length;
        const completed = allEvents.filter(e => e.lifecycle_status === 'CLOSED' || e.lifecycle_status === 'CANCELLED').length;
        const active = total - drafts - completed;
        setStats({ total, drafts, active, completed });

        // Admin Action Stats
        const venueReviews = allEvents.filter(e => e.lifecycle_status === 'VENUE_PROPOSED').length;
        const roomingDue = allEvents.filter(e => e.lifecycle_status === 'ROOMING_PENDING').length;
        const invoiceAudit = allEvents.filter(e => e.lifecycle_status === 'INVOICE_AUDIT').length;
        const sapPending = allEvents.filter(e => e.lifecycle_status === 'PAYMENT_PENDING').length;
        setAdminStats({ venueReviews, roomingDue, invoiceAudit, sapPending });

        // Sales Head Stats
        const myEvents = allEvents.length;
        const venuePending = allEvents.filter(e => e.lifecycle_status === 'VENUE_PROPOSED').length;
        const roomingPending = allEvents.filter(e => e.lifecycle_status === 'ROOMING_PENDING').length;
        const finalizationPending = allEvents.filter(e => e.lifecycle_status === 'ROOMING_FINALIZED').length;
        setSalesStats({ myEvents, venuePending, roomingPending, finalizationPending });

        setRecentEvents(allEvents.slice(0, 5));
        
        const pendingFilter = isSalesHead 
          ? ['VENUE_PROPOSED', 'ROOMING_PENDING', 'ROOMING_FINALIZED'] 
          : ['INVOICE_PENDING', 'ROOMING_PENDING', 'PAYMENT_PENDING', 'INVOICE_AUDIT'];
        
        const pending = allEvents.filter(e => pendingFilter.includes(e.lifecycle_status));
        setPendingActions(pending.slice(0, 4));

        const upcoming = allEvents
          .filter(e => e.start_date && new Date(e.start_date) >= new Date())
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        setUpcomingEvents(upcoming.slice(0, 5));
      }
      setLoading(false);
    }
    
    loadDashboard();
  }, [isSalesHead]);

  if (loading) return <div className="p-8 text-vms-primary font-medium">Loading operations dashboard...</div>;

  const getStatusBadge = (status: string) => {
    if (['DRAFT', 'PLANNED'].includes(status)) return <Badge variant="default">{status}</Badge>;
    if (['CLOSED', 'EXECUTED', 'ROOMING_FINALIZED'].includes(status)) return <Badge variant="success">{status}</Badge>;
    if (['CANCELLED'].includes(status)) return <Badge variant="danger">{status}</Badge>;
    if (['INVOICE_PENDING', 'PAYMENT_PENDING', 'ROOMING_PENDING', 'VENUE_PROPOSED'].includes(status)) return <Badge variant="warning">{status}</Badge>;
    return <Badge variant="info">{status}</Badge>;
  };

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      
      {/* Executive Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-vms-primary-dark tracking-tight">
          {isSalesHead ? 'My Dashboard' : 'Executive Dashboard'}
        </h1>
        <p className="text-vms-gray-600 mt-2 text-lg">
          {isSalesHead 
            ? 'Your overview of upcoming events and pending actions.'
            : 'Your global overview of active venue operations and financial audits.'}
        </p>
      </div>

      {/* Zone 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {isSalesHead ? (
          <>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">My Events</p>
                <p className="text-6xl font-black text-vms-primary-dark">{salesStats.myEvents}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Upcoming Events</p>
                <p className="text-6xl font-black text-vms-primary-dark">{upcomingEvents.length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300 bg-amber-50">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4">Venue Reviews Pending</p>
                <p className="text-6xl font-black text-amber-600">{salesStats.venuePending}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300 bg-purple-50">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">Rooming Pending</p>
                <p className="text-6xl font-black text-purple-600">{salesStats.roomingPending}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Total Events</p>
                <p className="text-6xl font-black text-vms-primary-dark">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Planning</p>
                <p className="text-6xl font-black text-vms-primary-dark">{stats.drafts}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Active Operations</p>
                <p className="text-6xl font-black text-vms-primary-dark">{stats.active}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Closed</p>
                <p className="text-6xl font-black text-vms-primary-dark">{stats.completed}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Operations Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {isSalesHead ? (
            <>
              {/* My Upcoming Events for Sales Head */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-white border-b border-vms-gray-100 flex justify-between items-center py-5">
                  <h3 className="font-bold text-vms-primary-dark text-lg">My Upcoming Events</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/events/registry')} className="text-vms-primary">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <div className="divide-y divide-vms-gray-100">
                  {upcomingEvents.length === 0 ? (
                    <div className="p-8 text-center text-vms-gray-500">No upcoming scheduled events.</div>
                  ) : (
                    upcomingEvents.map(event => (
                      <div key={event.id} className="p-5 hover:bg-vms-gray-50 transition-colors flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="flex flex-col items-center min-w-[50px] mr-4 bg-vms-primary-light/30 rounded p-2">
                            <span className="text-xs font-bold text-vms-secondary uppercase">
                              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-xl font-black text-vms-primary-dark">
                              {new Date(event.start_date).getDate()}
                            </span>
                          </div>
                          <div>
                            <Link to={`/events/${event.id}/summary`} className="font-bold text-vms-primary hover:text-vms-secondary transition-colors text-lg">
                              {event.event_name}
                            </Link>
                            <div className="mt-1 flex items-center gap-2">
                              {getStatusBadge(event.lifecycle_status)}
                              <span className="text-xs text-vms-gray-500">
                                Starts {new Date(event.start_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/summary`)}>View Event</Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Notifications for Sales Head */}
              <Card className="border-0 shadow-md ring-1 ring-vms-gray-200">
                <CardHeader className="bg-white border-b border-vms-gray-100 flex justify-between items-center py-5">
                  <h3 className="font-bold text-vms-primary-dark text-lg flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-vms-secondary" /> Notifications & Alerts
                  </h3>
                </CardHeader>
                <div className="divide-y divide-vms-gray-100 p-2">
                  {pendingActions.length === 0 ? (
                    <div className="p-8 text-center text-vms-gray-500">No pending notifications.</div>
                  ) : (
                    pendingActions.map(event => (
                      <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-vms-gray-50 rounded-lg m-2 transition-colors">
                        <div className={`p-2 rounded-full mt-1 ${event.lifecycle_status === 'VENUE_PROPOSED' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                          {event.lifecycle_status === 'VENUE_PROPOSED' ? <MapPin className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-vms-primary-dark">
                            {event.lifecycle_status === 'VENUE_PROPOSED' ? 'Venue Awaiting Review' : 'Rooming Action Required'}
                          </p>
                          <p className="text-sm text-vms-gray-600 mt-1">{event.event_name} requires your attention.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/summary`)}>Review</Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Operational Summary Pending Actions for Admin */}
              <Card className="border-0 shadow-md ring-1 ring-vms-warning/20">
                <CardHeader className="bg-vms-warning-bg/50 border-b border-vms-warning/10 flex justify-between items-center py-5">
                  <h3 className="font-bold text-vms-warning text-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" /> Pending Actions
                  </h3>
                </CardHeader>
                <div className="divide-y divide-vms-gray-100 p-2">
                  <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full mr-4 text-amber-600"><MapPin className="w-4 h-4" /></div>
                      <span className="font-bold text-vms-primary-dark">Pending Venue Reviews</span>
                    </div>
                    <Badge variant="warning" className="text-lg px-3">{adminStats.venueReviews}</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-4 text-purple-600"><Users className="w-4 h-4" /></div>
                      <span className="font-bold text-vms-primary-dark">Rooming Due This Week</span>
                    </div>
                    <Badge variant="warning" className="text-lg px-3">{adminStats.roomingDue}</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-4 text-red-600"><FileText className="w-4 h-4" /></div>
                      <span className="font-bold text-vms-primary-dark">Invoices Awaiting Audit</span>
                    </div>
                    <Badge variant="warning" className="text-lg px-3">{adminStats.invoiceAudit}</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="bg-teal-100 p-2 rounded-full mr-4 text-teal-600"><CheckCircle className="w-4 h-4" /></div>
                      <span className="font-bold text-vms-primary-dark">SAP Upload Pending</span>
                    </div>
                    <Badge variant="warning" className="text-lg px-3">{adminStats.sapPending}</Badge>
                  </div>
                </div>
              </Card>

              {/* Recent Activity for Admin */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-white border-b border-vms-gray-100 flex justify-between items-center py-5">
                  <h3 className="font-bold text-vms-primary-dark text-lg">Recent Activity</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/events/registry')} className="text-vms-primary">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <div className="divide-y divide-vms-gray-100">
                  {recentEvents.length === 0 ? (
                    <div className="p-8 text-center text-vms-gray-500">No active events.</div>
                  ) : (
                    recentEvents.map(event => (
                      <div key={event.id} className="p-5 hover:bg-vms-gray-50 transition-colors flex justify-between items-center">
                        <div>
                          <Link to={`/events/${event.id}/summary`} className="font-bold text-vms-primary hover:text-vms-secondary transition-colors">
                            {event.event_name}
                          </Link>
                          <p className="text-sm text-vms-gray-500 mt-1 flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            Created: {new Date(event.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(event.lifecycle_status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {isSalesHead ? (
            /* Action Center Widget for Sales Head */
            <Card className="border-0 shadow-md bg-white border-t-4 border-t-vms-secondary">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-bold text-vms-primary-dark">Action Center</h3>
                <p className="text-vms-gray-500 text-sm">Quick access to your pending tasks</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/events/registry')}>
                  <div className="flex items-center w-full">
                    <div className="bg-amber-100 p-2 rounded mr-3 text-amber-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Review Venue</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Approve or request alternatives</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/events/registry')}>
                  <div className="flex items-center w-full">
                    <div className="bg-purple-100 p-2 rounded mr-3 text-purple-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Submit Rooming</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Add participant details</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/events/registry')}>
                  <div className="flex items-center w-full">
                    <div className="bg-green-100 p-2 rounded mr-3 text-green-600">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Finalize Rooming</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Confirm final list</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Quick Create Widget for Admin */
            <Card className="border-0 shadow-md bg-gradient-to-br from-vms-primary-dark to-vms-primary text-white">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-vms-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Create Event</h3>
                <p className="text-white/80 text-sm mb-6">Initialize a new venue booking and operational lifecycle.</p>
                <Button variant="secondary" className="w-full" onClick={() => navigate('/events/create')}>
                  Create Event <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events (Only show for Admin here since Sales Head has it in main column) */}
          {!isSalesHead && (
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-white border-b border-vms-gray-100 py-5">
                <h3 className="font-bold text-vms-primary-dark text-lg">Upcoming Events</h3>
              </CardHeader>
              <div className="p-5 space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center text-vms-gray-500 text-sm py-4">No upcoming scheduled events.</div>
                ) : (
                  upcomingEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="flex space-x-3">
                      <div className="flex flex-col items-center min-w-[40px]">
                        <span className="text-xs font-bold text-vms-secondary uppercase">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xl font-black text-vms-primary-dark">
                          {new Date(event.start_date).getDate()}
                        </span>
                      </div>
                      <div className="border-l-2 border-vms-gray-100 pl-3">
                        <Link to={`/events/${event.id}/summary`} className="font-bold text-sm text-vms-primary-dark hover:underline block truncate max-w-[180px]">
                          {event.event_name}
                        </Link>
                        <div className="mt-1">{getStatusBadge(event.lifecycle_status)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
