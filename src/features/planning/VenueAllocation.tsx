import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Building, MapPin, Users, CheckCircle, Search, Hotel } from 'lucide-react';

// Mock Data
const MOCK_PLANS_PENDING_VENUE = [
  { id: '1', month: 'April', trainingType: 'CBM', pax: 45, city: 'Mumbai', status: 'VENUE_PENDING', cluster: 'Cardiac' },
  { id: '2', month: 'August', trainingType: 'Leadership Workshop', pax: 20, city: 'Delhi', status: 'VENUE_PENDING', cluster: 'Derma' }
];

const MOCK_HOTELS = {
  'Mumbai': [
    { id: 'H1', name: 'Taj Lands End', category: '5 Star', rating: 4.8 },
    { id: 'H2', name: 'Trident BKC', category: '5 Star', rating: 4.6 }
  ],
  'Delhi': [
    { id: 'H3', name: 'The Leela Palace', category: '5 Star', rating: 4.9 },
    { id: 'H4', name: 'ITC Maurya', category: '5 Star', rating: 4.7 }
  ]
};

const MOCK_HALLS = {
  'H1': [
    { id: 'HL1', name: 'Grand Ballroom', capacity: 500 },
    { id: 'HL2', name: 'Salcette', capacity: 50 }
  ],
  'H2': [
    { id: 'HL3', name: 'Cullinan', capacity: 300 },
    { id: 'HL4', name: 'Orloff', capacity: 40 }
  ],
  'H3': [
    { id: 'HL5', name: 'Grand Sapphire', capacity: 400 }
  ],
  'H4': [
    { id: 'HL6', name: 'Kamal Mahal', capacity: 600 }
  ]
};

export function VenueAllocationView() {
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [selectedHallId, setSelectedHallId] = useState<string>('');

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const selectedPlan = MOCK_PLANS_PENDING_VENUE.find(p => p.id === selectedPlanId);
  const availableHotels = selectedPlan ? MOCK_HOTELS[selectedPlan.city as keyof typeof MOCK_HOTELS] || [] : [];
  const availableHalls = selectedHotelId ? MOCK_HALLS[selectedHotelId as keyof typeof MOCK_HALLS] || [] : [];
  
  const selectedHall = availableHalls.find(h => h.id === selectedHallId);
  const isCapacitySufficient = selectedPlan && selectedHall ? selectedHall.capacity >= selectedPlan.pax : null;

  const handleAllocate = () => {
    if (!selectedPlan || !selectedHotelId || !selectedHallId) return;
    alert(`Allocated Venue for ${selectedPlan.trainingType}`);
    // In a real app, this would update the DB and remove it from the list
  };

  if (loading) return <div className="p-8">Loading Venue Allocation...</div>;

  return (
    <div className="flex h-full bg-[#F8F7FB] overflow-hidden -m-6 rounded-b-xl border-t border-vms-gray-200">
      
      {/* Left Pane: Plans Awaiting Venue */}
      <div className="w-80 bg-white border-r border-vms-gray-200 flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-vms-gray-100 bg-vms-gray-50/50">
          <h3 className="font-bold text-vms-primary-dark mb-3">Pending Allocation</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-vms-gray-400" />
            <input type="text" placeholder="Search plans..." className="w-full pl-9 pr-3 py-2 text-sm border border-vms-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {MOCK_PLANS_PENDING_VENUE.map(plan => (
            <div 
              key={plan.id}
              onClick={() => {
                setSelectedPlanId(plan.id);
                setSelectedHotelId('');
                setSelectedHallId('');
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPlanId === plan.id 
                  ? 'border-vms-primary bg-vms-primary-light/10 shadow-md ring-1 ring-vms-primary' 
                  : 'border-vms-gray-200 hover:border-vms-primary/50 hover:bg-vms-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-[9px] uppercase bg-amber-50 text-amber-700">{plan.month}</Badge>
                <div className="flex items-center text-xs font-bold text-vms-gray-600">
                  <Users className="w-3 h-3 mr-1" /> {plan.pax}
                </div>
              </div>
              <h4 className="font-bold text-sm text-vms-primary-dark mb-1 leading-tight">{plan.trainingType}</h4>
              <div className="flex items-center text-xs text-vms-gray-500 font-medium">
                <MapPin className="w-3 h-3 mr-1 text-vms-gray-400" /> {plan.city}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Pane: Venue Selection */}
      <div className="flex-1 flex flex-col bg-[#F8F7FB] overflow-y-auto h-[calc(100vh-200px)]">
        {!selectedPlan ? (
          <div className="flex-1 flex flex-col items-center justify-center text-vms-gray-400 p-8 text-center">
            <Building className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-vms-primary-dark mb-2">Venue Allocation</h2>
            <p className="max-w-md">Select a drafted plan from the queue to assign a Hotel and Hall from Master Data.</p>
          </div>
        ) : (
          <div className="p-8 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
            <div className="mb-6">
              <Badge className="bg-amber-100 text-amber-800 border-0 mb-3 shadow-none">Allocating Venue</Badge>
              <h2 className="text-2xl font-black text-vms-primary-dark">{selectedPlan.trainingType} in {selectedPlan.city}</h2>
              <div className="flex items-center mt-2 text-sm font-medium text-vms-gray-600 gap-4">
                <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> Required Capacity: {selectedPlan.pax} PAX</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> Target City: {selectedPlan.city}</span>
              </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200 mb-6 bg-white overflow-hidden">
              <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4">
                <h3 className="font-bold text-vms-primary-dark text-sm uppercase tracking-wider flex items-center">
                  <Hotel className="w-4 h-4 mr-2 text-vms-primary" /> Step 1: Select Hotel
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-vms-gray-100">
                  {availableHotels.map(hotel => (
                    <div 
                      key={hotel.id}
                      onClick={() => {
                        setSelectedHotelId(hotel.id);
                        setSelectedHallId('');
                      }}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        selectedHotelId === hotel.id ? 'bg-blue-50' : 'hover:bg-vms-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-vms-primary-dark">{hotel.name}</div>
                        <div className="text-xs text-vms-gray-500 mt-1">{hotel.category} • {hotel.rating} ⭐</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedHotelId === hotel.id ? 'border-vms-primary bg-vms-primary' : 'border-vms-gray-300'
                      }`}>
                        {selectedHotelId === hotel.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                  {availableHotels.length === 0 && (
                    <div className="p-8 text-center text-vms-gray-500 text-sm">No empaneled hotels found in Master Data for {selectedPlan.city}.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedHotelId && (
              <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200 mb-8 bg-white overflow-hidden animate-in fade-in slide-in-from-top-4">
                <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4">
                  <h3 className="font-bold text-vms-primary-dark text-sm uppercase tracking-wider flex items-center">
                    <Building className="w-4 h-4 mr-2 text-vms-primary" /> Step 2: Select Hall
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-vms-gray-100">
                    {availableHalls.map(hall => {
                      const isSufficient = hall.capacity >= selectedPlan.pax;
                      return (
                        <div 
                          key={hall.id}
                          onClick={() => setSelectedHallId(hall.id)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            selectedHallId === hall.id ? 'bg-blue-50' : 'hover:bg-vms-gray-50'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-vms-primary-dark">{hall.name}</div>
                            <div className={`text-xs mt-1 font-bold ${isSufficient ? 'text-green-600' : 'text-red-500'}`}>
                              Capacity: {hall.capacity} PAX
                              {!isSufficient && ' (Insufficient)'}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedHallId === hall.id ? 'border-vms-primary bg-vms-primary' : 'border-vms-gray-300'
                          }`}>
                            {selectedHallId === hall.id && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedHotelId && selectedHallId && (
              <div className="flex gap-4 animate-in fade-in">
                <Button 
                  className="flex-1 bg-vms-primary font-bold h-12 text-md shadow-md"
                  disabled={isCapacitySufficient === false}
                  onClick={handleAllocate}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isCapacitySufficient ? 'Confirm Venue Allocation' : 'Cannot Allocate: Hall too small'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
