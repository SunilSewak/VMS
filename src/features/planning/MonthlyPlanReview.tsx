import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { planningRepository } from './repositories/planningRepository';
import { MonthlyPlan } from '@/types/planning';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, X, ArrowLeft, CalendarDays, MapPin, Users, Building2, Briefcase, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export function MonthlyPlanReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      if (!id) return;
      setLoading(true);
      const data = await planningRepository.getMonthlyPlans();
      const found = data.find(p => p.id === id);
      setPlan(found || null);
      setLoading(false);
    }
    loadPlan();
  }, [id]);

  const handleSubmitReview = async (decision: 'ACCEPTED' | 'CHANGE_REQUESTED' | 'REJECTED') => {
    if (!user || !plan) return;
    
    // For now map REJECTED to CHANGE_REQUESTED since schema only has ACCEPTED/CHANGE_REQUESTED
    const mappedDecision = decision === 'REJECTED' ? 'CHANGE_REQUESTED' : decision;
    
    try {
      await planningRepository.submitReview({
        monthly_plan_id: plan.id,
        reviewer_id: user.id,
        decision: mappedDecision,
        remarks: remarks || undefined
      });
      // Use toast instead of alert ideally
      alert(`Plan ${decision.toLowerCase()} successfully.`);
      navigate('/planning/monthly');
    } catch (e) {
      console.error(e);
      alert('Error submitting review');
    }
  };

  if (loading) return <div className="p-8">Loading Plan Details...</div>;
  if (!plan) return <div className="p-8 text-vms-gray-500">Plan not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/planning/monthly')} className="mr-4 px-2">
            <ArrowLeft className="w-5 h-5 text-vms-gray-500" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-vms-primary-dark">{plan.meeting_name}</h1>
              <Badge className="bg-blue-100 text-blue-800 border-0">{plan.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-vms-gray-500 mt-1">Review operational execution details before approving</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-200 py-4">
              <h3 className="font-bold text-vms-primary-dark text-lg">Meeting Details</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-bold text-vms-gray-500 uppercase flex items-center mb-1">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Meeting Type
                  </label>
                  <p className="font-medium text-lg">{plan.meeting_type?.meeting_type_name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-vms-gray-500 uppercase flex items-center mb-1">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" /> Target City
                  </label>
                  <p className="font-medium text-lg">{plan.city?.city_name || 'TBD'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-vms-gray-500 uppercase flex items-center mb-1">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Proposed Dates
                  </label>
                  <p className="font-medium text-lg">
                    {plan.proposed_start_date ? new Date(plan.proposed_start_date).toLocaleDateString() : 'TBD'}
                    {plan.proposed_end_date && ` to ${new Date(plan.proposed_end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-vms-gray-500 uppercase flex items-center mb-1">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Expected PAX
                  </label>
                  <p className="font-medium text-lg">{plan.expected_pax} attendees</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-vms-gray-500 uppercase flex items-center mb-1">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" /> Division & Cluster
                  </label>
                  <p className="font-medium text-lg">
                    {plan.division?.cluster?.cluster_name ? `${plan.division.cluster.cluster_name} / ` : ''}
                    {plan.division?.division_name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-200 py-4">
              <h3 className="font-bold text-vms-primary-dark text-lg">Financial Estimates</h3>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-center text-vms-gray-400 min-h-[150px]">
              Financial estimates will be generated after venue selection.
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg ring-1 ring-vms-gray-200 bg-white">
            <CardHeader className="border-b border-vms-gray-100 bg-gradient-to-r from-vms-primary-dark to-vms-primary text-white rounded-t-xl py-4">
              <h3 className="font-bold text-lg">Review Decision</h3>
            </CardHeader>
            <CardContent className="p-5 space-y-4 pt-6">
              
              {!showRejectForm ? (
                <>
                  <Button 
                    className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white flex justify-between items-center px-4"
                    onClick={() => handleSubmitReview('ACCEPTED')}
                  >
                    <span className="flex items-center"><Check className="w-5 h-5 mr-2" /> Approve Plan</span>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full h-12 text-base font-bold border-red-200 text-red-600 hover:bg-red-50 flex justify-between items-center px-4"
                    onClick={() => setShowRejectForm(true)}
                  >
                    <span className="flex items-center"><X className="w-5 h-5 mr-2" /> Send Back</span>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </Button>
                </>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <label className="block text-sm font-bold text-vms-primary-dark mb-2">Reason for sending back</label>
                  <textarea 
                    className="w-full p-3 border border-vms-gray-300 rounded-lg text-sm mb-4 focus:ring-vms-primary focus:border-vms-primary min-h-[120px]"
                    placeholder="Provide detailed feedback for the admin..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleSubmitReview('CHANGE_REQUESTED')}
                      disabled={!remarks.trim()}
                    >
                      Submit Feedback
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRejectForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-blue-50 border border-blue-100">
            <CardContent className="p-5">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> What happens next?
              </h4>
              <p className="text-sm text-blue-800 opacity-90 leading-relaxed">
                If approved, the admin will proceed with generating an event and beginning the venue sourcing process. 
                If sent back, the admin must revise dates, PAX, or location before it can be converted to an active event.
              </p>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
