import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { planningRepository } from './repositories/planningRepository';
import { MonthlyPlan } from '@/types/planning';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, X, MessageSquare, CalendarDays, MapPin } from 'lucide-react';

export function SalesHeadReviewsView() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingPlanId, setReviewingPlanId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');

  const loadData = async () => {
    setLoading(true);
    // Ideally filter by division, but for demo we load all that are shared+
    const data = await planningRepository.getMonthlyPlans();
    // Sales head only sees plans that have been shared with them
    const visiblePlans = data.filter(p => ['SHARED', 'ACCEPTED', 'CHANGE_REQUESTED', 'APPROVED'].includes(p.status));
    setPlans(visiblePlans);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitReview = async (planId: string, decision: 'ACCEPTED' | 'CHANGE_REQUESTED') => {
    if (!user) return;
    try {
      await planningRepository.submitReview({
        monthly_plan_id: planId,
        reviewer_id: user.id,
        decision,
        remarks: remarks || undefined
      });
      setReviewingPlanId(null);
      setRemarks('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SHARED') return <Badge className="bg-amber-100 text-amber-800 shadow-none border-amber-200">Awaiting Review</Badge>;
    if (status === 'ACCEPTED' || status === 'APPROVED') return <Badge className="bg-green-100 text-green-800 shadow-none border-green-200">Accepted</Badge>;
    if (status === 'CHANGE_REQUESTED') return <Badge className="bg-red-100 text-red-800 shadow-none border-red-200">Changes Requested</Badge>;
    return <Badge>{status}</Badge>;
  };

  if (loading) return <div className="p-8">Loading Reviews...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-vms-primary-dark">My Monthly Plans</h2>
        <p className="text-sm text-vms-gray-500 font-medium">Review and approve operational event plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full p-8 text-center text-vms-gray-500 bg-vms-gray-50 rounded-lg border border-vms-gray-200">
            No plans require your review at this time.
          </div>
        ) : plans.map(plan => (
          <div key={plan.id} className="border border-vms-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="p-5 border-b border-vms-gray-100 flex-1">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="default" className="bg-vms-primary-light text-vms-primary border-0">
                  {plan.division?.cluster?.cluster_name ? `${plan.division.cluster.cluster_name} - ` : ''}{plan.division?.division_name}
                </Badge>
                {getStatusBadge(plan.status)}
              </div>
              
              <h3 className="text-xl font-black text-vms-primary-dark leading-tight mb-4">{plan.meeting_name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-vms-gray-400" />
                  <span className="font-bold text-vms-gray-800">{plan.city?.city_name || 'TBD'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarDays className="w-4 h-4 mr-3 text-vms-gray-400" />
                  <span className="font-bold text-vms-gray-800">
                    {plan.proposed_start_date ? new Date(plan.proposed_start_date).toLocaleDateString() : 'Dates TBD'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 mr-3 flex items-center justify-center bg-vms-gray-100 rounded text-[10px] font-black text-vms-gray-500">P</div>
                  <span className="font-bold text-vms-gray-800">{plan.expected_pax} Expected PAX</span>
                </div>
              </div>
            </div>

            {plan.status === 'SHARED' && reviewingPlanId !== plan.id && (
              <div className="p-4 bg-vms-gray-50 flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleSubmitReview(plan.id, 'ACCEPTED')}>
                  <Check className="w-4 h-4 mr-2" /> Accept
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setReviewingPlanId(plan.id)}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Request Change
                </Button>
              </div>
            )}

            {reviewingPlanId === plan.id && (
              <div className="p-4 bg-amber-50 border-t border-amber-100">
                <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Change Request Remarks</label>
                <textarea 
                  className="w-full p-3 border border-amber-200 rounded-lg text-sm mb-3 focus:ring-amber-500 focus:border-amber-500" 
                  rows={3} 
                  placeholder="e.g. Please change dates to next week, or prefer another city."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="secondary" className="bg-amber-600 hover:bg-amber-700 text-white flex-1" onClick={() => handleSubmitReview(plan.id, 'CHANGE_REQUESTED')}>
                    Submit Request
                  </Button>
                  <Button variant="outline" onClick={() => { setReviewingPlanId(null); setRemarks(''); }} className="bg-white">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {['ACCEPTED', 'APPROVED'].includes(plan.status) && (
              <div className="p-4 bg-green-50 text-green-800 text-sm font-bold text-center border-t border-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 mr-2" /> You accepted this plan
              </div>
            )}

            {plan.status === 'CHANGE_REQUESTED' && (
              <div className="p-4 bg-red-50 text-red-800 text-sm font-bold text-center border-t border-red-100 flex items-center justify-center">
                <X className="w-4 h-4 mr-2" /> You requested changes
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
