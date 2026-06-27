import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { CalendarDays, AlertCircle, CheckCircle, ChevronRight, FileText, Bell, MapPin, Users, CheckSquare, FileCheck, Building, Play, DollarSign } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSalesHead = user?.role === 'SALES_HEAD';

  const [loading, setLoading] = useState(true);
  
  // Mock workflow stats for now as per architecture plan
  const [workflowStats, setWorkflowStats] = useState({
    annualPlanned: 12,
    clusterPending: 3,
    monthlyPending: 8,
    venuePending: 5,
    salesHeadPending: 4,
    readyToGenerate: 2,
    bookingsPending: 6,
    invoicesPending: 15,
    sapPending: 4
  });

  useEffect(() => {
    // In Phase 1, we use mock stats to demonstrate the workflow architecture.
    // Eventually, this will read from the respective tables.
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [isSalesHead]);

  if (loading) return <div className="p-8 text-vms-primary font-medium">Loading Workflow Dashboard...</div>;

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      
      {/* Executive Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-vms-primary-dark tracking-tight">
          {isSalesHead ? 'My Approvals Dashboard' : 'Workflow Dashboard'}
        </h1>
        <p className="text-vms-gray-600 mt-2 text-lg">
          {isSalesHead 
            ? 'Monitor your pending approvals and active plans.'
            : 'Track progress across all planning stages and operations to see what work is waiting.'}
        </p>
      </div>

      {/* Zone 1: Workflow KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {isSalesHead ? (
          <>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300 bg-amber-50">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4">Pending Approvals</p>
                <p className="text-6xl font-black text-amber-600">{workflowStats.salesHeadPending}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300 bg-green-50">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4">Plans Approved</p>
                <p className="text-6xl font-black text-green-600">45</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-primary-dark uppercase tracking-widest mb-4">Upcoming Meetings</p>
                <p className="text-6xl font-black text-vms-primary-dark">8</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Planning Phase KPIs */}
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Cluster Approval</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-vms-primary-dark">{workflowStats.clusterPending}</p>
                  <span className="text-sm font-bold text-vms-gray-400 mb-2">Pending</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Monthly Planning</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-vms-primary-dark">{workflowStats.monthlyPending}</p>
                  <span className="text-sm font-bold text-vms-gray-400 mb-2">Pending</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Venue Allocation</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-vms-primary-dark">{workflowStats.venuePending}</p>
                  <span className="text-sm font-bold text-vms-gray-400 mb-2">Pending</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300 bg-amber-50">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4">Sales Head Review</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-amber-600">{workflowStats.salesHeadPending}</p>
                  <span className="text-sm font-bold text-amber-600 mb-2">Pending</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Execution Phase KPIs */}
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300 bg-green-50">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4">Ready to Generate</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-green-600">{workflowStats.readyToGenerate}</p>
                  <span className="text-sm font-bold text-green-600 mb-2">Approved</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Rooming & Booking</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-vms-primary-dark">{workflowStats.bookingsPending}</p>
                  <span className="text-sm font-bold text-vms-gray-400 mb-2">Pending</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Invoice Audit</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-vms-primary-dark">{workflowStats.invoicesPending}</p>
                  <span className="text-sm font-bold text-vms-gray-400 mb-2">Pending</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">SAP Closure</p>
                <div className="flex items-end justify-between">
                  <p className="text-6xl font-black text-vms-primary-dark">{workflowStats.sapPending}</p>
                  <span className="text-sm font-bold text-vms-gray-400 mb-2">Pending</span>
                </div>
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
            <Card className="border-0 shadow-md ring-1 ring-vms-gray-200">
              <CardHeader className="bg-white border-b border-vms-gray-100 flex justify-between items-center py-5">
                <h3 className="font-bold text-vms-primary-dark text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-amber-500" /> Pending Approvals Queue
                </h3>
              </CardHeader>
              <div className="p-8 text-center text-vms-gray-500">
                You currently have {workflowStats.salesHeadPending} plans awaiting your review.
                <div className="mt-4">
                  <Button onClick={() => navigate('/planning/reviews')} className="bg-vms-primary">Go to Approval Dashboard</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-0 shadow-md ring-1 ring-vms-warning/20">
              <CardHeader className="bg-vms-warning-bg/50 border-b border-vms-warning/10 flex justify-between items-center py-5">
                <h3 className="font-bold text-vms-warning text-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" /> What work is waiting?
                </h3>
              </CardHeader>
              <div className="divide-y divide-vms-gray-100 p-2">
                <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/planning/cluster-approvals')}>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600"><CheckSquare className="w-4 h-4" /></div>
                    <span className="font-bold text-vms-primary-dark">Cluster Approvals Pending</span>
                  </div>
                  <Button variant="ghost" size="sm">Review Queue <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/planning/monthly')}>
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-full mr-4 text-indigo-600"><FileText className="w-4 h-4" /></div>
                    <span className="font-bold text-vms-primary-dark">Monthly Planning Pending</span>
                  </div>
                  <Button variant="ghost" size="sm">Continue Planning <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/planning/venue-allocation')}>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-4 text-amber-600"><MapPin className="w-4 h-4" /></div>
                    <span className="font-bold text-vms-primary-dark">Venue Allocation Pending</span>
                  </div>
                  <Button variant="ghost" size="sm">Allocate Venues <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-vms-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/planning/generate')}>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-4 text-green-600"><Play className="w-4 h-4" /></div>
                    <span className="font-bold text-vms-primary-dark">Events Ready for Generation</span>
                  </div>
                  <Button variant="ghost" size="sm">Generate Events <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {isSalesHead ? (
            <Card className="border-0 shadow-md bg-white border-t-4 border-t-vms-secondary">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-bold text-vms-primary-dark">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/planning/reviews')}>
                  <div className="flex items-center w-full">
                    <div className="bg-amber-100 p-2 rounded mr-3 text-amber-600">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Review Monthly Plans</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Approve or reject admin plans</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md bg-white border-t-4 border-t-vms-primary">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-bold text-vms-primary-dark">Workflow Shortcuts</h3>
                <p className="text-vms-gray-500 text-sm">Jump into the planning pipeline</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/planning/annual')}>
                  <div className="flex items-center w-full">
                    <div className="bg-blue-100 p-2 rounded mr-3 text-blue-600">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Annual Calendar</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Create training requirements</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/planning/monthly')}>
                  <div className="flex items-center w-full">
                    <div className="bg-indigo-100 p-2 rounded mr-3 text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Continue Monthly Planning</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Draft operational details</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/planning/venue-allocation')}>
                  <div className="flex items-center w-full">
                    <div className="bg-amber-100 p-2 rounded mr-3 text-amber-600">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Continue Venue Allocation</div>
                      <div className="text-xs text-vms-gray-500 font-normal">Assign hotels and halls</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => navigate('/planning/generate')}>
                  <div className="flex items-center w-full">
                    <div className="bg-green-100 p-2 rounded mr-3 text-green-600">
                      <Play className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-vms-primary-dark">Generate Approved Events</div>
                      <div className="text-xs text-vms-gray-500 font-normal">1-click conversion</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
