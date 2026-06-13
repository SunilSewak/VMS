import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { getHotelById } from '../features/venues/venueService';
import { calculateVenueReadinessScore, getStatusColor, getStatusLabel } from '../features/venues/readinessScore';
import { OverviewTab } from './HotelTabs/OverviewTab';
import { HallsTab } from './HotelTabs/HallsTab';
import { AccommodationInventoryTab } from './HotelTabs/AccommodationInventoryTab';
import { OccupancyMatrixTab } from './HotelTabs/OccupancyMatrixTab';
import type { HotelWithRelations } from '../features/venues/types';

interface HotelDetailsWorkspaceProps {
  hotelId: string;
  onBack: () => void;
}

type TabType = 'overview' | 'halls' | 'accommodation' | 'occupancy';

export function HotelDetailsWorkspace({ hotelId, onBack }: HotelDetailsWorkspaceProps) {
  const [hotel, setHotel] = useState<HotelWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readinessScore, setReadinessScore] = useState<number>(0);

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  useEffect(() => {
    if (hotel) {
      const score = calculateVenueReadinessScore(hotel);
      setReadinessScore(score.overallScore);
    }
  }, [hotel]);

  const loadHotel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHotelById(hotelId);
      setHotel(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load hotel');
      console.error('Error loading hotel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Back to Hotels
        </button>
        <div style={{
          padding: 'var(--space-4)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}>
          <AlertCircle size={20} />
          <span>{error || 'Hotel not found'}</span>
        </div>
      </div>
    );
  }

  const readiness = calculateVenueReadinessScore(hotel);
  const statusColor = getStatusColor(readiness.status);
  const statusLabel = getStatusLabel(readiness.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: '700', margin: 0 }}>
              {hotel.hotel_name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', margin: 0 }}>
              {hotel.city?.city_name || 'Unknown City'}
            </p>
          </div>
        </div>

        {/* Venue Readiness Score Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          minWidth: '180px',
        }}>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>
            Readiness Score
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 'var(--font-lg)',
              fontWeight: '700',
            }}>
              {readiness.overallScore}%
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, margin: 0 }}>
                {statusLabel}
              </p>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                {readiness.completeness}% complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'halls', label: 'Halls' },
          { id: 'accommodation', label: 'Accommodation Inventory' },
          { id: 'occupancy', label: 'Occupancy Matrix' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-main)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-sm)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              borderBottom: activeTab === tab.id ? 'none' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ paddingTop: 'var(--space-4)' }}>
        {activeTab === 'overview' && <OverviewTab hotel={hotel} readiness={readiness} />}
        {activeTab === 'halls' && <HallsTab hotel={hotel} onDataChange={loadHotel} />}
        {activeTab === 'accommodation' && <AccommodationInventoryTab hotel={hotel} onDataChange={loadHotel} />}
        {activeTab === 'occupancy' && <OccupancyMatrixTab hotel={hotel} onDataChange={loadHotel} />}
      </div>
    </div>
  );
}
