import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, AlertCircle, Clock, Users, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function ClusterApprovalsView() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [loading, setLoading] = useState(true);
  
  // Mock Data
  const [approvals, setApprovals] = useState([
    { id: '1', month: 'April', trainingType: 'CBM', durationDays: 3, teams: ['DM', 'DSM', 'RSM'], status: 'PENDING', remarks: 'Q1 Kickoff', cluster: 'Cardiac' },
    { id: '2', month: 'August', trainingType: 'Leadership Workshop', durationDays: 2, teams: ['CH', 'ZSM'], status: 'APPROVED', remarks: 'Focus on strategy', cluster: 'Derma' },
    { id: '3', month: 'January', trainingType: 'G2G', durationDays: 1, teams: ['SO'], status: 'PENDING', remarks: '', cluster: 'Cardiac' },
    { id: '4', month: 'May', trainingType: 'Product Launch', durationDays: 1, teams: ['SO', 'DM'], status: 'CHANGES_REQUESTED', remarks: 'New product line', cluster: 'Derma' }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleAction = (id: string, newStatus: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  if (loading) return <div className="p-8">Loading Cluster Approvals...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-vms-primary-dark">Cluster Approvals</h2>
        <p className="text-vms-gray-500 text-sm mt-1">
          {isAdmin ? 'Monitor Annual Training Plan approvals from Cluster Heads.' : 'Review and approve proposed Annual Training Plans.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvals.map(plan => (
          <Card key={plan.id} className="border border-vms-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="bg-vms-primary-light text-vms-primary uppercase tracking-wider text-[10px]">
                    {plan.month} • {plan.cluster}
                  </Badge>
                  
                  {plan.status === 'PENDING' && <Badge className="bg-amber-100 text-amber-800 border-0 shadow-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                  {plan.status === 'APPROVED' && <Badge className="bg-green-100 text-green-800 border-0 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>}
                  {plan.status === 'CHANGES_REQUESTED' && <Badge className="bg-red-100 text-red-800 border-0 shadow-none"><AlertCircle className="w-3 h-3 mr-1"/> Changes Req</Badge>}
                </div>
                
                <h3 className="text-xl font-bold text-vms-primary-dark mb-4">{plan.trainingType}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-vms-gray-600 font-medium">
                    <Clock className="w-4 h-4 mr-2 text-vms-gray-400" /> {plan.durationDays} Day{plan.durationDays > 1 ? 's' : ''} Duration
                  </div>
                  <div className="flex items-start text-sm text-vms-gray-600 font-medium">
                    <Users className="w-4 h-4 mr-2 text-vms-gray-400 mt-0.5" /> 
                    <div className="flex flex-wrap gap-1">
                      {plan.teams.map(t => <span key={t} className="bg-vms-gray-100 px-2 py-0.5 rounded text-[11px]">{t}</span>)}
                    </div>
                  </div>
                  {plan.remarks && (
                    <div className="mt-3 bg-vms-gray-50 p-3 rounded text-xs text-vms-gray-600 italic border-l-2 border-vms-gray-300">
                      "{plan.remarks}"
                    </div>
                  )}
                </div>
              </div>

              {!isAdmin && plan.status === 'PENDING' ? (
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-vms-gray-100">
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full h-9 text-xs" onClick={() => handleAction(plan.id, 'APPROVED')}>
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button variant="outline" className="w-full h-9 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(plan.id, 'CHANGES_REQUESTED')}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              ) : plan.status === 'APPROVED' ? (
                <div className="mt-4 pt-4 border-t border-vms-gray-100 text-center">
                  <span className="text-xs font-bold text-green-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Ready for Monthly Planning
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
