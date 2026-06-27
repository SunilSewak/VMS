import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, AlertCircle, Users, MapPin, CalendarDays, Clock, Building, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function SalesHeadReviewsView() {
  const { user } = useAuthStore();
  const isSalesHead = user?.role === 'SALES_HEAD';

  const [loading, setLoading] = useState(true);
  
  // Mock Data for Approval Dashboard
  const [reviews, setReviews] = useState([
    { id: '1', month: 'April', trainingType: 'CBM', durationDays: 3, pax: 45, city: 'Mumbai', hotel: 'Taj Lands End', hall: 'Grand Ballroom', status: 'PENDING_REVIEW', remarks: '', cluster: 'Cardiac' },
    { id: '2', month: 'August', trainingType: 'Leadership Workshop', durationDays: 2, pax: 20, city: 'Delhi', hotel: 'The Leela Palace', hall: 'Grand Sapphire', status: 'APPROVED', remarks: 'Focus on strategy', cluster: 'Derma' }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleAction = (id: string, newStatus: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  if (loading) return <div className="p-8">Loading Approval Dashboard...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-vms-primary-dark">{isSalesHead ? 'My Approvals' : 'Sales Head Review Status'}</h2>
        <p className="text-vms-gray-500 text-sm mt-1">
          {isSalesHead ? 'Review and approve finalized operational plans before Event Generation.' : 'Monitor the approval status of operational plans.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map(plan => (
          <Card key={plan.id} className="border border-vms-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-0 border-b border-vms-gray-100">
              <div className="p-4 bg-vms-gray-50 flex justify-between items-start rounded-t-xl">
                <div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 uppercase tracking-wider text-[10px] mb-2 border-0">
                    {plan.month} • {plan.cluster}
                  </Badge>
                  <h3 className="text-lg font-black text-vms-primary-dark leading-tight">{plan.trainingType}</h3>
                </div>
                {plan.status === 'PENDING_REVIEW' && <Badge className="bg-amber-50 text-amber-600 border border-amber-200 shadow-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                {plan.status === 'APPROVED' && <Badge className="bg-green-50 text-green-600 border border-green-200 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>}
                {plan.status === 'REJECTED' && <Badge className="bg-red-50 text-red-600 border border-red-200 shadow-none"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col h-full justify-between">
              <div>
                <div className="space-y-4 mb-6">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-vms-gray-50 p-2 rounded border border-vms-gray-100">
                      <div className="text-[10px] uppercase font-bold text-vms-gray-400 mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> PAX</div>
                      <div className="font-bold text-vms-primary-dark text-sm">{plan.pax} Attendees</div>
                    </div>
                    <div className="bg-vms-gray-50 p-2 rounded border border-vms-gray-100">
                      <div className="text-[10px] uppercase font-bold text-vms-gray-400 mb-1 flex items-center"><CalendarDays className="w-3 h-3 mr-1"/> Duration</div>
                      <div className="font-bold text-vms-primary-dark text-sm">{plan.durationDays} Days</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-[10px] uppercase font-bold text-blue-400 mb-2 flex items-center"><Building className="w-3 h-3 mr-1"/> Venue Assigned</div>
                    <div className="font-bold text-blue-900 text-sm mb-1">{plan.hotel}</div>
                    <div className="text-xs text-blue-700 flex items-center justify-between">
                      <span>{plan.hall}</span>
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {plan.city}</span>
                    </div>
                  </div>

                </div>
              </div>

              {isSalesHead && plan.status === 'PENDING_REVIEW' ? (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-vms-gray-100">
                  <Button className="bg-vms-primary hover:bg-vms-primary-dark text-white w-full h-10 text-sm font-bold shadow-sm" onClick={() => handleAction(plan.id, 'APPROVED')}>
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve Plan
                  </Button>
                  <Button variant="outline" className="w-full h-10 text-sm text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(plan.id, 'REJECTED')}>
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                </div>
              ) : plan.status === 'APPROVED' ? (
                <div className="mt-2 pt-4 border-t border-vms-gray-100">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-center text-green-700 text-xs font-bold">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approved by Sales Head. Ready for Event Generation.
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
