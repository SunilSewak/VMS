import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, CheckCircle, Clock, Users } from 'lucide-react';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

// Mock Data for UI Architecture Phase
const MOCK_TEAMS = [
  { id: 'T1', label: 'Sales Officer (SO)' },
  { id: 'T2', label: 'District Manager (DM)' },
  { id: 'T3', label: 'Regional Sales Manager (RSM)' },
  { id: 'T4', label: 'Zonal Sales Manager (ZSM)' },
  { id: 'T5', label: 'Cluster Head (CH)' }
];

const MOCK_TRAINING_TYPES = [
  { id: 'TR1', label: 'CBM' },
  { id: 'TR2', label: 'G2G' },
  { id: 'TR3', label: 'Leadership Workshop' },
  { id: 'TR4', label: 'Product Launch' }
];

const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September', 
  'October', 'November', 'December', 'January', 'February', 'March'
];

export function AnnualCalendarView() {
  const { user } = useAuthStore();
  const isSalesHead = user?.role === 'SALES_HEAD';
  
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('April');
  
  // Form State
  const [formData, setFormData] = useState({
    financialYear: '2026-27',
    month: 'April',
    trainingTypeId: '',
    applicableTeamIds: [] as string[],
    durationDays: 1,
    remarks: ''
  });

  // Mock State for Plans
  const [plans, setPlans] = useState([
    { id: '1', month: 'April', trainingType: 'CBM', durationDays: 3, teams: ['DM', 'DSM', 'RSM'], status: 'DRAFT', remarks: 'Q1 Kickoff' },
    { id: '2', month: 'August', trainingType: 'Leadership Workshop', durationDays: 2, teams: ['CH', 'ZSM'], status: 'PUBLISHED', remarks: 'Focus on strategy' },
    { id: '3', month: 'January', trainingType: 'G2G', durationDays: 1, teams: ['SO'], status: 'DRAFT', remarks: '' }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleCreate = () => {
    if (!formData.trainingTypeId || formData.applicableTeamIds.length === 0) return;
    
    const trainingName = MOCK_TRAINING_TYPES.find(t => t.id === formData.trainingTypeId)?.label || 'Unknown';
    const teamNames = formData.applicableTeamIds.map(id => MOCK_TEAMS.find(t => t.id === id)?.label.split(' ')[0] || '');
    
    setPlans([...plans, {
      id: Date.now().toString(),
      month: formData.month,
      trainingType: trainingName,
      durationDays: formData.durationDays,
      teams: teamNames,
      status: 'DRAFT',
      remarks: formData.remarks
    }]);
    
    setIsCreating(false);
  };

  const handlePublish = (id: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, status: 'PUBLISHED' } : p));
  };

  if (loading) return <div className="p-8">Loading Annual Calendar...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-vms-primary-dark">Training Requirement Blueprint</h2>
          <p className="text-vms-gray-500 text-sm mt-1">Plan required trainings for Financial Year 2026-27</p>
        </div>
        <div className="flex items-center gap-4">
          <select className="border border-vms-gray-200 rounded-lg p-2 text-sm font-bold bg-white text-vms-primary-dark shadow-sm">
            <option>FY 2026-27</option>
            <option>FY 2027-28</option>
          </select>
        </div>
      </div>

      {/* Creation Form */}
      {isCreating && (
        <Card className="mb-8 border-0 shadow-lg ring-1 ring-vms-gray-200 bg-white animate-in slide-in-from-top-4">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4">
            <h3 className="font-bold text-vms-primary-dark text-lg">Add Training to {selectedMonth}</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Training Type</label>
                <select 
                  className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm bg-white"
                  value={formData.trainingTypeId}
                  onChange={e => setFormData({...formData, trainingTypeId: e.target.value})}
                >
                  <option value="">Select Training...</option>
                  {MOCK_TRAINING_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              
              <div className="lg:col-span-2">
                <MultiSelect 
                  label="Applicable Teams"
                  options={MOCK_TEAMS}
                  selectedIds={formData.applicableTeamIds}
                  onChange={ids => setFormData({ ...formData, applicableTeamIds: ids as string[] })}
                  placeholder="Select all teams required to attend..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Duration (Days)</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm" 
                  value={formData.durationDays} 
                  onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value)})} 
                />
              </div>
              
              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-2">Remarks / Special Notes</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-vms-gray-200 rounded-lg text-sm" 
                  placeholder="Optional context for this training requirement..."
                  value={formData.remarks} 
                  onChange={e => setFormData({...formData, remarks: e.target.value})} 
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} className="bg-vms-primary">Save Training Plan</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month Planner Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {MONTHS.map(month => {
            const monthPlans = plans.filter(p => p.month === month);
            
            return (
              <div key={month} className="w-80 flex flex-col bg-vms-gray-50/50 rounded-xl border border-vms-gray-200 overflow-hidden flex-shrink-0">
                <div className="p-4 bg-white border-b border-vms-gray-200 flex justify-between items-center sticky top-0">
                  <h3 className="font-black text-vms-primary-dark tracking-wide uppercase">{month}</h3>
                  <Badge variant="secondary" className="bg-vms-gray-100">{monthPlans.length}</Badge>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {monthPlans.map(plan => (
                    <div key={plan.id} className="bg-white p-4 rounded-lg shadow-sm border border-vms-gray-200 hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-vms-primary-dark leading-tight">{plan.trainingType}</h4>
                        {plan.status === 'PUBLISHED' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-vms-gray-600 font-medium">
                          <Clock className="w-3.5 h-3.5 mr-1.5" /> {plan.durationDays} Day{plan.durationDays > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-start text-xs text-vms-gray-600 font-medium">
                          <Users className="w-3.5 h-3.5 mr-1.5 mt-0.5" /> 
                          <div className="flex flex-wrap gap-1">
                            {plan.teams.map(t => <span key={t} className="bg-vms-gray-100 px-1.5 py-0.5 rounded text-[10px]">{t}</span>)}
                          </div>
                        </div>
                        {plan.remarks && (
                          <div className="text-[10px] text-vms-gray-400 italic border-l-2 border-vms-gray-200 pl-2 mt-2">
                            "{plan.remarks}"
                          </div>
                        )}
                      </div>
                      
                      {!isSalesHead && plan.status === 'DRAFT' && (
                        <div className="pt-3 border-t border-vms-gray-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => handlePublish(plan.id)}>
                            Submit
                          </Button>
                        </div>
                      )}
                      
                      {plan.status === 'PUBLISHED' && (
                        <div className="pt-3 border-t border-vms-gray-100">
                          <Badge className="bg-green-50 text-green-700 border-0 w-full justify-center shadow-none text-[10px]">
                            Sent to Cluster Approval
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!isSalesHead && (
                    <button 
                      onClick={() => {
                        setSelectedMonth(month);
                        setFormData({ ...formData, month });
                        setIsCreating(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-vms-gray-200 rounded-lg text-vms-gray-400 font-bold text-sm hover:border-vms-primary hover:text-vms-primary transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Training
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
