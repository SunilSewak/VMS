import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
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

const TABS: { name: TabName; label: string; icon: string }[] = [
  { name: 'overview', label: 'Overview', icon: '📋' },
  { name: 'halls', label: 'Halls', icon: '🏛️' },
  { name: 'accommodation', label: 'Accommodation', icon: '🛏️' },
  { name: 'occupancy', label: 'Occupancy Rules', icon: '📊' },
  { name: 'photos', label: 'Photos', icon: '📸' },
];

export function HotelDetailsWorkspace() {
  const location = useLocation();
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  // Fallback: parse ID from URL path if useParams doesn't resolve it
  const pathMatch = location.pathname.match(/\/administration\/masters\/venues\/([^/]+)/);
  const idFromPath = pathMatch ? pathMatch[1] : null;

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

  useEffect(() => {
    const hotelId = id || idFromPath;
    if (hotelId) {
      loadHotel(hotelId);
    } else {
      console.error('HotelDetailsWorkspace: no hotel ID in params or path');
      setLoading(false);
    }
  }, [id, idFromPath]);

  useEffect(() => {
    if (hotel) {
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
      setLoading(true);
      if (!hotelId) throw new Error('No hotel ID provided');
      const data = await getHotelById(hotelId);
      if (!data) throw new Error('Hotel query returned no data');
      setHotel(data);
    } catch (error) {
      console.error('LOAD HOTEL ERROR:', error);
      alert(`Failed to load hotel details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      navigate('/administration/masters/venues');
    } finally {
      setLoading(false);
    }
  }

  function refresh() {
    const hotelId = id || idFromPath;
    if (hotelId) loadHotel(hotelId);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse" style={{
            width: '48px', height: '48px', margin: '0 auto var(--space-4)',
            borderRadius: '50%', background: 'var(--surface-2)',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)' }}>
          Hotel not found
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/administration/masters/venues')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <ArrowLeft size={16} /> Back to Hotels
        </button>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            onClick={() => navigate('/administration/masters/venues')}
            title="Back to hotels"
            style={{
              width: '40px', height: '40px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)' }}>
              {hotel.hotel_name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>
              {hotel.city?.city_name || 'N/A'} • {hotel.status}
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowFormModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Pencil size={16} /> Edit Hotel
        </button>
      </div>

      {/* ─── READINESS SCORE ─── */}
      <div className="card" style={{ borderLeft: `4px solid ${readinessScore.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>
              Venue Readiness Score
            </p>
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 800, color: 'var(--text-main)' }}>
                {readinessScore.score}%
              </span>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: readinessScore.color }}>
                {readinessScore.label}
              </span>
            </div>
          </div>

          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={readinessScore.color}
              strokeWidth="8"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - readinessScore.score / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s' }}
            />
            <text x="60" y="70" textAnchor="middle" fontSize="20" fontWeight="bold" fill="var(--text-main)" transform="rotate(90 60 60)">
              {readinessScore.score}%
            </text>
          </svg>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--space-2)', overflowX: 'auto' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                fontWeight: 700,
                fontSize: 'var(--font-sm)',
                whiteSpace: 'nowrap',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                transition: 'color var(--transition-fast) ease, border-color var(--transition-fast) ease',
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'overview' && <OverviewTab hotel={hotel} />}
        {activeTab === 'halls' && <HallsTab hotel={hotel} onRefresh={refresh} />}
        {activeTab === 'accommodation' && <AccommodationInventoryTab hotel={hotel} onRefresh={refresh} />}
        {activeTab === 'occupancy' && <OccupancyMatrixTab hotel={hotel} onRefresh={refresh} />}
        {activeTab === 'photos' && <PhotosTab hotel={hotel} onRefresh={refresh} />}
      </div>

      {/* ─── EDIT MODAL ─── */}
      {showFormModal && (
        <HotelFormModal
          hotel={hotel}
          onClose={() => setShowFormModal(false)}
          onComplete={() => {
            setShowFormModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
