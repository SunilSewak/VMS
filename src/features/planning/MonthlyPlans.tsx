import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { planningRepository } from './repositories/planningRepository';
import { MonthlyPlan } from '@/types/planning';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Share, Play, AlertCircle, CheckCircle, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MonthlyPlansView() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await planningRepository.getMonthlyPlans();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleShare = async (id: string) => {
    try {
      await planningRepository.updateMonthlyPlanStatus(id, 'SHARED');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateEvent = async (plan: MonthlyPlan) => {
    if (!user) return;
    try {
      await planningRepository.generateEventFromPlan(plan, user.id);
      alert('Event successfully generated and pushed to Event Registry!');
      navigate('/events/registry');
    } catch (e) {
      console.error(e);
      alert('Failed to generate event.');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'DRAFT') return <Badge className="bg-gray-100 text-gray-800 shadow-none border-gray-200">Draft</Badge>;
    if (status === 'SHARED') return <Badge className="bg-blue-100 text-blue-800 shadow-none border-blue-200">Awaiting Review</Badge>;
    if (status === 'ACCEPTED') return <Badge className="bg-indigo-100 text-indigo-800 shadow-none border-indigo-200">Accepted by SH</Badge>;
    if (status === 'CHANGE_REQUESTED') return <Badge className="bg-red-100 text-red-800 shadow-none border-red-200">Change Requested</Badge>;
    if (status === 'APPROVED') return <Badge className="bg-green-100 text-green-800 shadow-none border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Ready for Event</Badge>;
    return <Badge>{status}</Badge>;
  };

  if (loading) return <div className="p-8">Loading Monthly Plans...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-vms-primary-dark">Monthly Execution Plans</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plans.length === 0 ? (
          <div className="p-8 text-center text-vms-gray-500 bg-vms-gray-50 rounded-lg border border-vms-gray-200">
            No monthly plans found. Generate them from the Annual Calendar.
          </div>
        ) : plans.map(plan => (
          <div key={plan.id} className="border border-vms-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-black text-vms-primary-dark">{plan.meeting_name}</h3>
                  {getStatusBadge(plan.status)}
                </div>
                <div className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest">
                  {plan.division?.cluster?.cluster_name ? `${plan.division.cluster.cluster_name} • ` : ''}
                  {plan.division?.division_name} • {plan.city?.city_name || 'TBD'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {plan.status === 'DRAFT' && (
                  <Button variant="outline" onClick={() => handleShare(plan.id)} className="bg-white">
                    <Share className="w-4 h-4 mr-2" /> Share with Sales Head
                  </Button>
                )}
                {plan.status === 'ACCEPTED' && (
                  <Button variant="outline" onClick={() => planningRepository.updateMonthlyPlanStatus(plan.id, 'APPROVED').then(loadData)} className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-2" /> Finalize Approval
                  </Button>
                )}
                {plan.status === 'APPROVED' && (
                  <Button onClick={() => handleGenerateEvent(plan)} className="bg-vms-primary shadow-md text-white font-bold">
                    <Play className="w-4 h-4 mr-2 fill-current" /> Generate Event
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-vms-gray-100">
              <div>
                <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Type</span>
                <span className="text-sm font-bold text-vms-gray-800">{plan.meeting_type?.meeting_type_name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Proposed Dates</span>
                <span className="text-sm font-bold text-vms-gray-800 flex items-center">
                  <CalendarDays className="w-3 h-3 mr-1 text-vms-gray-400" />
                  {plan.proposed_start_date ? new Date(plan.proposed_start_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Expected PAX</span>
                <span className="text-sm font-bold text-vms-gray-800">{plan.expected_pax}</span>
              </div>
              <div>
                <span className="block text-[10px] text-vms-gray-400 uppercase tracking-wider mb-1">Shared At</span>
                <span className="text-sm font-bold text-vms-gray-800">{plan.shared_at ? new Date(plan.shared_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
            
            {plan.status === 'CHANGE_REQUESTED' && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 border border-red-100 rounded text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block mb-1">Sales Head requested changes</span>
                  Please review the Sales Head Review records and update the plan before re-sharing.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
