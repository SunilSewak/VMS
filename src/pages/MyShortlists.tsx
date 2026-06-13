import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Bookmark,
  Building2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useMyShortlists } from '../features/venues/hooks';
import { removeFromShortlist } from '../features/venues/api';
import { useAuth } from '../contexts/AuthContext';
import type { VenueShortlist, Hotel } from '../features/venues/types';
import { ROUTES } from '../routes/routeRegistry';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80';

function getVenuePhoto(hotel: Hotel | null | undefined): string | null {
  const hotelWithPhotos = hotel as any;
  if (!hotelWithPhotos?.photos?.length) return null;
  const sorted = [...hotelWithPhotos.photos].sort(
    (a: any, b: any) => (a.display_order ?? 99) - (b.display_order ?? 99)
  );
  return sorted[0]?.storage_path ?? null;
}

export function MyShortlists() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const { user } = useAuth();
  const { shortlists, loading, error } = useMyShortlists(user?.id ?? null);
  const [displayShortlists, setDisplayShortlists] = useState<VenueShortlist[]>([]);

  useEffect(() => {
    setDisplayShortlists(shortlists);
  }, [shortlists]);

  const filteredShortlists = requestId
    ? displayShortlists.filter((item) => item.request_id === requestId)
    : displayShortlists;

  const handleRemoveRecommendation = async (requestId: string, hotelId: string) => {
    if (!window.confirm('Remove this venue recommendation?')) return;
    const before = displayShortlists;
    setDisplayShortlists((prev) => prev.filter((item) => item.request_id !== requestId || item.hotel_id !== hotelId));

    try {
      await removeFromShortlist(requestId, hotelId);
    } catch (e: any) {
      setDisplayShortlists(before);
      alert('Failed to remove recommendation: ' + (e?.message ?? 'Unknown error'));
    }
  };

  // Group shortlists by request_id
  const grouped = filteredShortlists.reduce<Record<string, VenueShortlist[]>>((acc, s) => {
    const key = s.request_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{
              width: '44px', height: '44px',
              borderRadius: 'var(--radius-lg)',
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Bookmark size={22} />
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--text-main)' }}>
              Recommended Venues
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', maxWidth: '480px' }}>
            {requestId
              ? 'Venue recommendations for the selected meeting request. Review recommendations and keep the request aligned to event needs.'
              : 'Venue recommendations you have made across all your meeting requests. Review and update recommendations.'}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.venueExplorer)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Building2 size={16} /> Explore Venues
        </button>
      </div>

      {/* ─── LOADING ─── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse" style={{ height: '200px', background: 'var(--surface-2)' }} />
          ))}
        </div>
      )}

      {/* ─── ERROR ─── */}
      {error && !loading && (
        <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: 'var(--status-error)', marginBottom: 'var(--space-3)' }} />
          <h3 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>Failed to load shortlists</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>{error}</p>
        </div>
      )}

      {/* ─── EMPTY STATE ─── */}
      {!loading && !error && displayShortlists.length === 0 && (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Bookmark size={56} style={{ color: 'var(--text-light)', marginBottom: 'var(--space-5)', opacity: 0.5 }} />
          <h3 style={{ fontWeight: '800', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
            No Recommendations Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', maxWidth: '420px', margin: '0 auto var(--space-6)' }}>
            When you recommend venues for a Meeting Request, they will appear here for review and next steps.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.venueExplorer)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Building2 size={16} /> Start Exploring Venues
          </button>
        </div>
      )}

      {/* ─── GROUPED SHORTLISTS ─── */}
      {!loading && !error && displayShortlists.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {Object.entries(grouped).map(([requestId, items]) => (
            <section key={requestId}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  padding: '4px 12px',
                  background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: '700',
                  color: 'var(--primary)',
                }}>
                  Request #{requestId.slice(0, 8).toUpperCase()}
                </div>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
{items.length} venue recommendation{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {items.map((item) => (
                  <ShortlistCard
                    key={item.id}
                    shortlist={item}
                    onView={() => navigate(`/venue-explorer/${item.hotel_id}?requestId=${requestId}`)}
                    onRemove={() => handleRemoveRecommendation(item.request_id, item.hotel_id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SHORTLIST CARD ───
function ShortlistCard({ shortlist, onView, onRemove }: { shortlist: VenueShortlist; onView: () => void; onRemove: () => void }) {
  const hotel = shortlist.hotels as any;
  const photoUrl = getVenuePhoto(hotel);
  const city = hotel?.city?.city_name ?? '—';
  const category = hotel?.hotel_category ?? '—';

  const shortlistedAt = shortlist.shortlisted_at
    ? new Date(shortlist.shortlisted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
      onClick={onView}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Image */}
      <div style={{ height: '140px', position: 'relative', background: 'var(--surface-2)' }}>
        <img
          src={photoUrl ?? PLACEHOLDER_IMAGE}
          alt={hotel?.hotel_name ?? 'Venue'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          color: '#fff', padding: '3px 10px', borderRadius: 'var(--radius-full)',
          fontSize: '11px', fontWeight: '700',
        }}>
          {category}
        </div>
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'var(--status-success)', color: '#fff',
          borderRadius: '50%', width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bookmark size={13} fill="#fff" />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: 'var(--space-4)' }}>
        <h4 style={{ fontWeight: '800', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-1)' }}>
          {hotel?.hotel_name ?? 'Unknown Hotel'}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)' }}>
          <MapPin size={13} /> {city}
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {shortlistedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '11px', color: 'var(--text-light)' }}>
              <Clock size={11} /> {shortlistedAt}
            </div>
          )}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onView();
              }}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--primary)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              View venue
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--danger)',
                background: 'var(--surface)',
                color: 'var(--danger)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Remove recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
