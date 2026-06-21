import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CalendarDays, AlertCircle, CheckCircle, Clock, ChevronRight, Plus, ArrowRight, FileText } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, drafts: 0, active: 0, completed: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: allEvents } = await supabase
        .from('events')
        .select('id, lifecycle_status, event_name, start_date, created_at')
        .order('created_at', { ascending: false });

      if (allEvents) {
        const total = allEvents.length;
        const drafts = allEvents.filter(e => e.lifecycle_status === 'DRAFT' || e.lifecycle_status === 'PLANNED').length;
        const completed = allEvents.filter(e => e.lifecycle_status === 'CLOSED' || e.lifecycle_status === 'CANCELLED').length;
        const active = total - drafts - completed;

        setStats({ total, drafts, active, completed });
        setRecentEvents(allEvents.slice(0, 5));
        
        const pending = allEvents.filter(e => ['INVOICE_PENDING', 'ROOMING_PENDING', 'PAYMENT_PENDING', 'INVOICE_AUDIT'].includes(e.lifecycle_status));
        setPendingActions(pending.slice(0, 4));

        const upcoming = allEvents
          .filter(e => e.start_date && new Date(e.start_date) >= new Date())
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        setUpcomingEvents(upcoming.slice(0, 3));
      }
      setLoading(false);
    }
    
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8 text-vms-primary font-medium">Loading operations dashboard...</div>;

  const getStatusBadge = (status: string) => {
    if (['DRAFT', 'PLANNED'].includes(status)) return <Badge variant="default">{status}</Badge>;
    if (['CLOSED', 'EXECUTED', 'ROOMING_FINALIZED'].includes(status)) return <Badge variant="success">{status}</Badge>;
    if (['CANCELLED'].includes(status)) return <Badge variant="danger">{status}</Badge>;
    if (['INVOICE_PENDING', 'PAYMENT_PENDING', 'ROOMING_PENDING'].includes(status)) return <Badge variant="warning">{status}</Badge>;
    return <Badge variant="info">{status}</Badge>;
  };

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      
      {/* Executive Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-vms-primary-dark tracking-tight">Executive Dashboard</h1>
        <p className="text-vms-gray-600 mt-2 text-lg">Your global overview of active venue operations and financial audits.</p>
      </div>

      {/* Zone 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
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
      </div>

      {/* Operations Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Actions */}
          <Card className="border-0 shadow-md ring-1 ring-vms-warning/20">
            <CardHeader className="bg-vms-warning-bg/50 border-b border-vms-warning/10 flex justify-between items-center py-5">
              <h3 className="font-bold text-vms-warning text-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" /> Pending Actions
              </h3>
            </CardHeader>
            <div className="divide-y divide-vms-gray-100">
              {pendingActions.length === 0 ? (
                <div className="p-8 text-center text-vms-gray-500">You're all caught up!</div>
              ) : (
                pendingActions.map(event => (
                  <div key={event.id} className="p-5 hover:bg-vms-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-vms-primary-dark">{event.event_name}</h4>
                      <div className="mt-1">{getStatusBadge(event.lifecycle_status)}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/summary`)}>Review</Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Activity */}
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

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Quick Create Widget */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-vms-primary-dark to-vms-primary text-white">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-vms-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">New Event Request</h3>
              <p className="text-white/80 text-sm mb-6">Initialize a new venue booking and operational lifecycle.</p>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/events/create')}>
                Create Event <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-white border-b border-vms-gray-100 py-5">
              <h3 className="font-bold text-vms-primary-dark text-lg">Upcoming Bookings</h3>
            </CardHeader>
            <div className="p-5 space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center text-vms-gray-500 text-sm py-4">No upcoming scheduled events.</div>
              ) : (
                upcomingEvents.map(event => (
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

        </div>
      </div>
    </div>
  );
}
