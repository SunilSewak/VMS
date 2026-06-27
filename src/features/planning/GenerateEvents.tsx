import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Play, CheckCircle, ArrowRight, Building, Users, CalendarDays, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Data
const MOCK_APPROVED_PLANS = [
  { id: '1', month: 'August', trainingType: 'Leadership Workshop', durationDays: 2, pax: 20, city: 'Delhi', hotel: 'The Leela Palace', hall: 'Grand Sapphire', status: 'READY_TO_GENERATE', cluster: 'Derma' },
  { id: '2', month: 'October', trainingType: 'Product Launch', durationDays: 1, pax: 150, city: 'Mumbai', hotel: 'Taj Lands End', hall: 'Grand Ballroom', status: 'GENERATED', eventId: 'EV-1004', cluster: 'Cardiac' }
];

export function GenerateEventsView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState(MOCK_APPROVED_PLANS);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleGenerate = (id: string) => {
    // In reality this would call an API which creates the event and workspace
    setPlans(plans.map(p => p.id === id ? { 
      ...p, 
      status: 'GENERATED', 
      eventId: `EV-${Math.floor(Math.random() * 1000) + 2000}` 
    } : p));
  };

  if (loading) return <div className="p-8">Loading Generate Events Queue...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-vms-primary-dark flex items-center">
          <Play className="w-6 h-6 mr-2 text-green-600" /> Event Generation Queue
        </h2>
        <p className="text-vms-gray-500 text-sm mt-1">
          1-click conversion of fully approved operational plans into active Event Workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className="border border-vms-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Side: Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="bg-vms-gray-100 text-vms-gray-700 uppercase tracking-wider text-[10px] border-0">
                    {plan.month} • {plan.cluster}
                  </Badge>
                  {plan.status === 'READY_TO_GENERATE' && <Badge className="bg-green-100 text-green-800 border-0 shadow-none">Ready</Badge>}
                  {plan.status === 'GENERATED' && <Badge className="bg-blue-100 text-blue-800 border-0 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Event Active</Badge>}
                </div>
                
                <h3 className="text-xl font-bold text-vms-primary-dark leading-tight mb-4">{plan.trainingType}</h3>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-2">
                  <div className="flex items-center text-sm text-vms-gray-600 font-medium">
                    <MapPin className="w-4 h-4 mr-2 text-vms-gray-400" /> {plan.city}
                  </div>
                  <div className="flex items-center text-sm text-vms-gray-600 font-medium">
                    <Building className="w-4 h-4 mr-2 text-vms-gray-400" /> {plan.hotel}
                  </div>
                  <div className="flex items-center text-sm text-vms-gray-600 font-medium">
                    <Users className="w-4 h-4 mr-2 text-vms-gray-400" /> {plan.pax} PAX
                  </div>
                  <div className="flex items-center text-sm text-vms-gray-600 font-medium">
                    <CalendarDays className="w-4 h-4 mr-2 text-vms-gray-400" /> {plan.durationDays} Days
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Action Area */}
            <div className="bg-vms-gray-50 md:w-64 border-t md:border-t-0 md:border-l border-vms-gray-100 p-5 flex flex-col justify-center items-center text-center">
              {plan.status === 'READY_TO_GENERATE' ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Approved by Sales Head</p>
                  <Button className="w-full bg-vms-primary hover:bg-vms-primary-dark text-white font-bold shadow-md" onClick={() => handleGenerate(plan.id)}>
                    <Play className="w-4 h-4 mr-2" /> Generate Event
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                    <Building className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-vms-gray-500 uppercase tracking-widest mb-1">Event Created</p>
                  <p className="text-lg font-black text-vms-primary-dark mb-4">{plan.eventId}</p>
                  <Button variant="outline" className="w-full font-bold border-vms-primary text-vms-primary hover:bg-vms-primary-light/10" onClick={() => navigate(`/events/${plan.eventId}/summary`)}>
                    Go to Workspace <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
            
          </Card>
        ))}
      </div>
    </div>
  );
}
