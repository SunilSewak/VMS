import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Clock, CheckCircle, AlertCircle, Users, Building, FileCheck, Search } from 'lucide-react';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { roomBlockingEngine, RoomRequirement } from '@/lib/roomBlockingEngine';

// Mock Data
const MOCK_APPROVED_ANNUAL_PLANS = [
  { id: '1', month: 'August', trainingType: 'Leadership Workshop', durationDays: 2, teams: ['CH', 'ZSM'], status: 'PENDING_MONTHLY_PLAN', cluster: 'Derma' },
  { id: '2', month: 'September', trainingType: 'CBM', durationDays: 3, teams: ['DM', 'DSM', 'RSM'], status: 'PENDING_MONTHLY_PLAN', cluster: 'Cardiac' }
];

const MOCK_CITIES = [
  { id: 'C1', name: 'Mumbai' },
  { id: 'C2', name: 'Delhi' },
  { id: 'C3', name: 'Goa' },
  { id: 'C4', name: 'Bangalore' }
];

export function MonthlyPlansView() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Operational Plan State
  const [operationalPlan, setOperationalPlan] = useState({
    division: '',
    zone: '',
    preferredCityId: '',
    checkInDate: '',
    checkOutDate: '',
    conferenceStartDate: '',
    conferenceEndDate: '',
    specialRequirements: '',
    designationCounts: {} as Record<string, number>
  });

  useEffect(() => {
    // Initialize designation counts with 0 based on engine rules
    const initCounts: Record<string, number> = {};
    roomBlockingEngine.getAvailableDesignations().forEach(d => initCounts[d] = 0);
    
    setOperationalPlan(prev => ({ ...prev, designationCounts: initCounts }));
    setTimeout(() => setLoading(false), 300);
  }, []);

  const selectedPlan = useMemo(() => 
    MOCK_APPROVED_ANNUAL_PLANS.find(p => p.id === selectedPlanId),
  [selectedPlanId]);

  const roomRequirements = useMemo(() => {
    return roomBlockingEngine.calculateRequirements(operationalPlan.designationCounts);
  }, [operationalPlan.designationCounts]);

  const totalPax = useMemo(() => {
    return Object.values(operationalPlan.designationCounts).reduce((a, b) => a + (b || 0), 0);
  }, [operationalPlan.designationCounts]);

  const handleDesignationCountChange = (designation: string, value: string) => {
    const count = parseInt(value) || 0;
    setOperationalPlan(prev => ({
      ...prev,
      designationCounts: {
        ...prev.designationCounts,
        [designation]: count
      }
    }));
  };

  if (loading) return <div className="p-8">Loading Monthly Planning Workspace...</div>;

  return (
    <div className="flex h-full bg-[#F8F7FB] overflow-hidden -m-6 rounded-b-xl border-t border-vms-gray-200">
      
      {/* Left Pane: Approved Annual Plans Queue */}
      <div className="w-80 bg-white border-r border-vms-gray-200 flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-vms-gray-100 bg-vms-gray-50/50">
          <h3 className="font-bold text-vms-primary-dark mb-3">Approved Annual Plans</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-vms-gray-400" />
            <input type="text" placeholder="Search plans..." className="w-full pl-9 pr-3 py-2 text-sm border border-vms-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {MOCK_APPROVED_ANNUAL_PLANS.map(plan => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPlanId === plan.id 
                  ? 'border-vms-primary bg-vms-primary-light/10 shadow-md ring-1 ring-vms-primary' 
                  : 'border-vms-gray-200 hover:border-vms-primary/50 hover:bg-vms-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-[9px] uppercase">{plan.month}</Badge>
                <Badge variant="outline" className="text-[9px] uppercase border-vms-gray-300">{plan.cluster}</Badge>
              </div>
              <h4 className="font-bold text-sm text-vms-primary-dark mb-1 leading-tight">{plan.trainingType}</h4>
              <p className="text-xs text-vms-gray-500 mb-2">{plan.durationDays} Days</p>
              <div className="flex flex-wrap gap-1">
                {plan.teams.map(t => <span key={t} className="bg-vms-gray-100 px-1.5 py-0.5 rounded text-[9px]">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Pane: Operational Planning Form */}
      <div className="flex-1 flex flex-col bg-[#F8F7FB] overflow-y-auto h-[calc(100vh-200px)] relative">
        {!selectedPlan ? (
          <div className="flex-1 flex flex-col items-center justify-center text-vms-gray-400 p-8 text-center">
            <FileCheck className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-vms-primary-dark mb-2">Monthly Operational Planning</h2>
            <p className="max-w-md">Select an approved annual plan from the queue to begin defining operational requirements.</p>
          </div>
        ) : (
          <div className="p-8 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
            <div className="mb-6">
              <Badge className="bg-blue-100 text-blue-800 border-0 mb-3 shadow-none">Editing Plan</Badge>
              <h2 className="text-2xl font-black text-vms-primary-dark">{selectedPlan.trainingType} - {selectedPlan.month}</h2>
              <p className="text-vms-gray-500 text-sm mt-1">Convert this annual requirement into an executable operational plan.</p>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200 mb-6">
              <CardHeader className="bg-white border-b border-vms-gray-100 py-4">
                <h3 className="font-bold text-vms-primary-dark text-sm uppercase tracking-wider">Logistics & Location</h3>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Division</label>
                  <input type="text" className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" placeholder="e.g. Cardio" value={operationalPlan.division} onChange={e => setOperationalPlan({...operationalPlan, division: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Zone</label>
                  <input type="text" className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" placeholder="e.g. West" value={operationalPlan.zone} onChange={e => setOperationalPlan({...operationalPlan, zone: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Preferred City</label>
                  <select className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" value={operationalPlan.preferredCityId} onChange={e => setOperationalPlan({...operationalPlan, preferredCityId: e.target.value})}>
                    <option value="">Select City...</option>
                    {MOCK_CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Conference Start Date</label>
                  <input type="date" className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" value={operationalPlan.conferenceStartDate} onChange={e => setOperationalPlan({...operationalPlan, conferenceStartDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Conference End Date</label>
                  <input type="date" className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" value={operationalPlan.conferenceEndDate} onChange={e => setOperationalPlan({...operationalPlan, conferenceEndDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Hotel Check-In</label>
                  <input type="date" className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" value={operationalPlan.checkInDate} onChange={e => setOperationalPlan({...operationalPlan, checkInDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Hotel Check-Out</label>
                  <input type="date" className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white" value={operationalPlan.checkOutDate} onChange={e => setOperationalPlan({...operationalPlan, checkOutDate: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200 mb-6">
              <CardHeader className="bg-white border-b border-vms-gray-100 py-4 flex flex-row justify-between items-center">
                <h3 className="font-bold text-vms-primary-dark text-sm uppercase tracking-wider">Designation Counts</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Auto-calculates Room Blocks</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-vms-gray-500 mb-4 border-l-2 border-vms-primary pl-3">
                  Enter the expected number of attendees per designation. The Room Blocking Engine will automatically determine required inventory based on Master Data rules.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {roomBlockingEngine.getAvailableDesignations().map(designation => (
                    <div key={designation} className="bg-vms-gray-50 p-3 rounded-lg border border-vms-gray-200 flex flex-col">
                      <label className="text-xs font-bold text-vms-gray-600 mb-2">{designation}</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full p-2 border border-vms-gray-300 rounded text-center text-lg font-bold" 
                        value={operationalPlan.designationCounts[designation] || 0}
                        onChange={e => handleDesignationCountChange(designation, e.target.value)}
                        onFocus={e => e.target.select()}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200 mb-12">
              <CardHeader className="bg-white border-b border-vms-gray-100 py-4">
                <h3 className="font-bold text-vms-primary-dark text-sm uppercase tracking-wider">Special Requirements</h3>
              </CardHeader>
              <CardContent className="p-6">
                <textarea 
                  className="w-full p-3 border border-vms-gray-200 rounded-lg text-sm bg-white min-h-[100px]" 
                  placeholder="Any VIP requirements, dietary restrictions, or specific venue needs..."
                  value={operationalPlan.specialRequirements}
                  onChange={e => setOperationalPlan({...operationalPlan, specialRequirements: e.target.value})}
                />
              </CardContent>
            </Card>

          </div>
        )}
      </div>

      {/* Right Pane: Validation & Summary */}
      <div className="w-80 bg-white border-l border-vms-gray-200 flex flex-col h-[calc(100vh-200px)]">
        <div className="p-5 border-b border-vms-gray-100 bg-vms-gray-50/50">
          <h3 className="font-bold text-vms-primary-dark">Plan Validation</h3>
        </div>
        
        {!selectedPlan ? (
          <div className="p-6 text-center text-vms-gray-400 text-sm italic">
            Select a plan to view validation metrics.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Status Panel */}
            <div className="bg-white border border-vms-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-3">Workflow Status</h4>
              <div className="flex items-center text-amber-600 font-bold text-sm">
                <Clock className="w-4 h-4 mr-2" /> Planning in Progress
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white border border-vms-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-3">Attendance</h4>
              <div className="flex items-end justify-between">
                <div className="text-4xl font-black text-vms-primary-dark">{totalPax}</div>
                <div className="text-sm font-bold text-vms-gray-500 mb-1">Total PAX</div>
              </div>
            </div>

            {/* Room Engine Output */}
            <div className="bg-white border border-blue-200 rounded-xl p-0 shadow-sm overflow-hidden">
              <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1.5" /> Rooming Engine
                </h4>
              </div>
              <div className="p-4 space-y-3">
                {roomRequirements.length === 0 ? (
                  <div className="text-sm text-vms-gray-500 italic text-center py-2">Add designations to calculate</div>
                ) : (
                  roomRequirements.map(req => (
                    <div key={req.roomType} className="flex justify-between items-center bg-white p-2 border border-vms-gray-100 rounded">
                      <span className="font-bold text-sm text-vms-gray-700">{req.roomType} Room</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-black">{req.count}</Badge>
                    </div>
                  ))
                )}
                
                {roomRequirements.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-blue-100 flex justify-between items-center font-bold text-blue-900">
                    <span>Total Rooms</span>
                    <span>{roomRequirements.reduce((a, b) => a + b.count, 0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <Button className="w-full bg-vms-primary text-white font-bold h-10 shadow-md">
                <CheckCircle className="w-4 h-4 mr-2" /> Complete Planning
              </Button>
              <Button variant="outline" className="w-full h-10 border-vms-gray-300">
                Save Draft
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
