import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { HotelWithRelations } from '../features/venues/types';
import { getHotelById } from '../features/venues/venueService';
import { calculateVenueReadinessScore, getStatusColor, getStatusLabel } from '../features/venues/readinessScore';
import { OverviewTab } from './HotelTabs/OverviewTab';
import { HallsTab } from './HotelTabs/HallsTab';
import { AccommodationInventoryTab } from './HotelTabs/AccommodationInventoryTab';
import { OccupancyMatrixTab } from './HotelTabs/OccupancyMatrixTab';
import { PhotosTab } from './HotelTabs/PhotosTab';
import { HotelFormModal } from './HotelFormModal';

type TabName = 'overview' | 'halls' | 'accommodation' | 'occupancy' | 'photos';

interface VenueReadinessIndicator {
  score: number;
  status: string;
  color: string;
  label: string;
}

export function HotelDetailsWorkspace() {
  // DIAGNOSTIC: Check if useParams is receiving anything
  const location = useLocation();
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  console.log('=== HotelDetailsWorkspace RENDER ===');
  console.log('Location:', location);
  console.log('Location pathname:', location.pathname);
  console.log('Raw useParams result:', params);
  console.log('Destructured id:', id);
  console.log('id type:', typeof id);
  console.log('id truthy?:', !!id);
  
  // Parse ID from URL path as fallback
  const pathMatch = location.pathname.match(/\/administration\/masters\/venues\/([^/]+)/);
  const idFromPath = pathMatch ? pathMatch[1] : null;
  console.log('ID extracted from pathname:', idFromPath);

  const [hotel, setHotel] = useState<HotelWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [showFormModal, setShowFormModal] = useState(false);
  const [readinessScore, setReadinessScore] = useState<VenueReadinessIndicator>({
    score: 0,
    status: 'NOT_READY',
    color: '#ef4444',
    label: 'Not Ready',
  });

  // Load hotel data
  useEffect(() => {
    console.log('=== HotelDetailsWorkspace useEffect START ===');
    console.log('URL param id:', id);
    console.log('Path param id:', idFromPath);
    const hotelId = id || idFromPath;
    if (hotelId) {
      loadHotel(hotelId);
    } else {
      console.error('ERROR: Neither useParams nor URL parse worked');
      setLoading(false);
    }
  }, [id, idFromPath]);

  // Update readiness score when hotel changes
  useEffect(() => {
    if (hotel) {
      console.log('Calculating readiness score for hotel:', hotel.hotel_name);
      const score = calculateVenueReadinessScore(hotel);
      setReadinessScore({
        score: score.overallScore,
        status: score.status,
        color: getStatusColor(score.status),
        label: getStatusLabel(score.status),
      });
    }
  }, [hotel]);

  async function loadHotel(hotelId: string | null | undefined) {
    try {
      console.log('loadHotel() called with hotelId:', hotelId);
      
      setLoading(true);
      if (!hotelId) {
        console.error('ERROR: No hotel ID in URL params or path');
        throw new Error('No hotel ID provided');
      }
      
      console.log('Calling getHotelById with id:', hotelId);
      const data = await getHotelById(hotelId);
      console.log('HOTEL QUERY RESULT:', data);
      
      if (!data) {
        console.error('ERROR: getHotelById returned null/undefined');
        throw new Error('Hotel query returned no data');
      }
      
      console.log('SETTING HOTEL STATE:', { 
        id: data.id, 
        name: data.hotel_name,
        hasHalls: data.halls?.length,
        hasAccommodation: data.accommodation_inventory?.length
      });
      setHotel(data);
    } catch (error) {
      console.error('LOAD HOTEL ERROR:', error);
      alert(`Failed to load hotel details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      navigate('/administration/masters/venues');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }

  if (loading) {
    console.log('Rendering LOADING state');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  console.log('HOTEL NOT FOUND STATE CHECK:', { hotel: !!hotel, loading, hotelId: id });
  if (!hotel) {
    console.log('Rendering HOTEL NOT FOUND state');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Hotel not found</p>
        <button
          onClick={() => navigate('/administration/masters/venues')}
          className="mt-4 px-4 py-2 text-blue-600 hover:underline"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/administration/masters/venues')}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                title="Back to hotels"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{hotel.hotel_name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {hotel.city?.city_name || 'N/A'} • {hotel.status}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setShowFormModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Edit Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Readiness Score Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="bg-white rounded-lg shadow-sm p-6 border-l-4"
          style={{ borderColor: readinessScore.color }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Venue Readiness Score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {readinessScore.score}%
                </span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: readinessScore.color }}
                >
                  {readinessScore.label}
                </span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex items-center justify-center">
              <svg width="120" height="120" className="transform -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={readinessScore.color}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - readinessScore.score / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s' }}
                />
                <text
                  x="60"
                  y="70"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#1f2937"
                >
                  {readinessScore.score}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-b border-gray-200">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { name: 'overview' as TabName, label: 'Overview', icon: '📋', disabled: false },
              { name: 'halls' as TabName, label: 'Halls', icon: '🏛️', disabled: false },
              { name: 'accommodation' as TabName, label: 'Accommodation', icon: '🛏️', disabled: false },
              { name: 'occupancy' as TabName, label: 'Occupancy Rules', icon: '📊', disabled: false },
              { name: 'photos' as TabName, label: 'Photos', icon: '📸', disabled: false },
            ].map(tab => (
              <button
                key={tab.name}
                onClick={() => !tab.disabled && setActiveTab(tab.name)}
                disabled={tab.disabled}
                className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.name
                    ? 'border-blue-600 text-blue-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed opacity-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-sm mt-6">
          {activeTab === 'overview' && <OverviewTab hotel={hotel} />}
          {activeTab === 'halls' && (
            <HallsTab hotel={hotel} onRefresh={() => {
              const hotelId = id || idFromPath;
              if (hotelId) loadHotel(hotelId);
            }} />
          )}
          {activeTab === 'accommodation' && (
            <AccommodationInventoryTab hotel={hotel} onRefresh={() => {
              const hotelId = id || idFromPath;
              if (hotelId) loadHotel(hotelId);
            }} />
          )}
          {activeTab === 'occupancy' && (
            <OccupancyMatrixTab hotel={hotel} onRefresh={() => {
              const hotelId = id || idFromPath;
              if (hotelId) loadHotel(hotelId);
            }} />
          )}
          {activeTab === 'photos' && (
            <PhotosTab hotel={hotel} onRefresh={() => {
              const hotelId = id || idFromPath;
              if (hotelId) loadHotel(hotelId);
            }} />
          )}
        </div>
      </div>

      {/* Hotel Form Modal */}
      {showFormModal && (
        <HotelFormModal
          hotel={hotel}
          onClose={() => setShowFormModal(false)}
          onComplete={() => {
            setShowFormModal(false);
            const hotelId = id || idFromPath;
            if (hotelId) loadHotel(hotelId);
          }}
        />
      )}
    </div>
  );
}
