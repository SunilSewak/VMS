import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Users,
  Bookmark,
  Scale,
  Eye,
  X,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useVenues, useVenueFilters, useShortlist } from '../features/venues/hooks';
import { useMeetingRequest } from '../features/meetings/hooks';
import { useAuth } from '../contexts/AuthContext';
import type { VenueCardData, VenueSearchFilters } from '../features/venues/types';

const CAPACITY_OPTIONS = [
  { label: 'Any Capacity', min: undefined, max: undefined },
  { label: 'Up to 100 pax', min: undefined, max: 100 },
  { label: '101 – 250 pax', min: 101, max: 250 },
  { label: '251 – 500 pax', min: 251, max: 500 },
  { label: '500+ pax', min: 501, max: undefined },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80';

export function VenueExplorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const { user } = useAuth();

  // Search and filter state. The page loads venue cards immediately while the hero search remains prominent.
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('all');
  const [selectedCapacityIdx, setSelectedCapacityIdx] = useState(0);

  const [compareList, setCompareList] = useState<VenueCardData[]>([]);
  const [showCompareMatrix, setShowCompareMatrix] = useState(false);

  const getCapacityIndex = (pax: number) => {
    if (pax <= 100) return 1;
    if (pax <= 250) return 2;
    if (pax <= 500) return 3;
    if (pax > 500) return 4;
    return 0;
  };

  // Meeting request context for the planning panel
  const { request } = useMeetingRequest(requestId ?? undefined);

  const selectedCapacity = CAPACITY_OPTIONS[selectedCapacityIdx];

  const filters: VenueSearchFilters = {
    searchQuery,
    cityId: selectedCityId,
    categoryCode: selectedCategoryCode,
    capacityMin: selectedCapacity.min,
    capacityMax: selectedCapacity.max,
    requestId: requestId ?? undefined,
  };

  const { venues, loading: venuesLoading, error: venuesError } = useVenues(filters);
  const { cities, categories, loading: filtersLoading } = useVenueFilters();
  const { shortlistedIds, toggleShortlist } = useShortlist(requestId, user?.id ?? null);

  useEffect(() => {
    if (!requestId || !request || hasSearched) return;

    if (request.city_id) {
      setSelectedCityId(request.city_id);
    }

    setSelectedCapacityIdx(getCapacityIndex(request.expected_pax));
    setSearchInput(request.cities?.city_name ?? request.target_city_name ?? '');
    setSearchQuery(request.cities?.city_name ?? request.target_city_name ?? '');
    setHasSearched(true);
  }, [requestId, request, hasSearched]);

  const recommendedVenues = [...venues]
    .sort((a, b) => b.largestHallCapacity - a.largestHallCapacity)
    .slice(0, 3);

  // Toggle compare
  const toggleCompare = (venue: VenueCardData) => {
    setCompareList((prev) => {
      const exists = prev.find((v) => v.id === venue.id);
      if (exists) return prev.filter((v) => v.id !== venue.id);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, venue];
    });
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>

      {/* ─── HERO SEARCH SECTION ─── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, #1a1a2e) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-10) var(--space-8)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '20%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {requestId && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              fontSize: 'var(--font-xs)',
              fontWeight: '600',
              marginBottom: 'var(--space-4)',
              backdropFilter: 'blur(8px)',
            }}>
              <CheckCircle2 size={14} />
              Linked to Meeting Request #{requestId.slice(0, 8).toUpperCase()}
            </div>
          )}

          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
            Find Your Perfect Venue
          </h1>
          <p style={{ fontSize: 'var(--font-size-md)', opacity: 0.85, marginBottom: 'var(--space-8)', maxWidth: '520px' }}>
            Discover corporate-approved hotels across India. Search by city, category, or capacity to find the best fit.
          </p>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={18} style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                id="venue-search-input"
                placeholder="Search hotel name, city or address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  border: '2px solid transparent',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-md)',
                  background: '#fff',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-family)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-light)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
              />
            </div>

            {/* City quick-select */}
            {!filtersLoading && (
              <select
                id="venue-city-select"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                style={{
                  flex: '0 1 180px',
                  padding: '14px 16px',
                  border: '2px solid transparent',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-md)',
                  background: '#fff',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-family)',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none',
                }}
              >
                <option value="all">All Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.city_name}</option>
                ))}
              </select>
            )}

            <button
              id="venue-search-btn"
              onClick={handleSearch}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: '14px 28px',
                background: '#fff',
                color: 'var(--primary)',
                fontWeight: '700',
                fontSize: 'var(--font-size-md)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-family)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              Find Venues <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                {hasSearched && venues.length > 0
                  ? `${venues.length} venue${venues.length !== 1 ? 's' : ''} available`
                  : 'Search across Ajanta-approved venues'}
              </span>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', marginTop: 'var(--space-2)', color: 'var(--text-main)' }}>
                {!hasSearched
                  ? 'Ready to discover corporate venues'
                  : venues.length > 0
                    ? 'Search results'
                    : 'No venues match the current search criteria'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface)', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Capacity band</p>
              <strong style={{ fontSize: 'var(--font-size-lg)' }}>{selectedCapacity.label}</strong>
            </div>
            <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface)', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Destination</p>
              <strong style={{ fontSize: 'var(--font-size-lg)' }}>{searchQuery || (selectedCityId === 'all' ? 'Any city' : cities.find((c) => c.id === selectedCityId)?.city_name ?? 'Selected')}</strong>
            </div>
            <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface)', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Category</p>
              <strong style={{ fontSize: 'var(--font-size-lg)' }}>{selectedCategoryCode === 'all' ? 'All venues' : categories.find((c) => c.category_code === selectedCategoryCode)?.category_name ?? 'Selected'}</strong>
            </div>
          </div>

          {recommendedVenues.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Recommended Venues
                  </p>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800' }}>Top venues by capacity</h3>
                </div>
                <span style={{ padding: '10px 14px', borderRadius: '999px', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', fontWeight: '700' }}>
                  Best fit for {selectedCapacity.label}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                {recommendedVenues.map((venue) => (
                  <div key={venue.id} className="card" style={{ padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div>
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{venue.cityName}</p>
                        <strong style={{ fontSize: 'var(--font-size-md)', display: 'block' }}>{venue.hotelName}</strong>
                      </div>
                      <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{venue.largestHallCapacity} pax</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)' }}>{venue.categoryName}</p>
                    <button
                      onClick={() => navigate(`/venue-explorer/${venue.id}${requestId ? `?requestId=${requestId}` : ''}`)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--primary)',
                        background: 'transparent',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: '700',
                      }}
                    >
                      View details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {venuesLoading ? (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {[1, 2, 3].map((index) => (
                <div key={index} className="card animate-pulse" style={{ height: '360px', background: 'var(--surface-2)' }} />
              ))}
            </div>
          ) : venuesError ? (
            <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: 'var(--status-error)', marginBottom: 'var(--space-3)' }} />
              <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Could not load venues</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>{venuesError}</p>
            </div>
          ) : !hasSearched && venues.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
              <Building2 size={48} style={{ color: 'var(--text-light)', marginBottom: 'var(--space-4)' }} />
              <h4 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>No venue master data available yet.</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
                Please import or seed venue data to begin discovery.
              </p>
            </div>
          ) : venues.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
              <Building2 size={48} style={{ color: 'var(--text-light)', marginBottom: 'var(--space-4)' }} />
              <h4 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>No venues match the current search criteria.</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                Try one of these options to broaden your search.
              </p>
              <ul style={{ textAlign: 'left', display: 'inline-block', marginBottom: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', lineHeight: '1.8' }}>
                <li>Change the destination</li>
                <li>Adjust the capacity range</li>
                <li>Pick a different category</li>
                <li>Reset filters and start fresh</li>
              </ul>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setSelectedCityId('all');
                  setSelectedCategoryCode('all');
                  setSelectedCapacityIdx(0);
                  setHasSearched(false);
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {venues.map((venue) => {
                const isShortlisted = shortlistedIds.includes(venue.id);
                const isInCompare = compareList.some((v) => v.id === venue.id);

                return (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    isShortlisted={isShortlisted}
                    isInCompare={isInCompare}
                    hasRequestContext={!!requestId}
                    onShortlist={() => toggleShortlist(venue.id)}
                    onCompare={() => toggleCompare(venue)}
                    onView={() => navigate(`/venue-explorer/${venue.id}${requestId ? `?requestId=${requestId}` : ''}`)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <aside className="card" style={{ padding: 'var(--space-5)', position: 'sticky', top: '80px', minHeight: '320px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Building2 size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Planning Context
                </p>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800' }}>
                  {request?.meeting_name ?? 'Meeting request not linked'}
                </h3>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>City</span>
                <strong>{request?.cities?.city_name ?? request?.target_city_name ?? 'Any'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected PAX</span>
                <strong>{request?.expected_pax ?? '—'}</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Matching Venues</span>
                <strong>{venues.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Compared Venues</span>
                <strong>{compareList.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shortlisted Venues</span>
                <strong>{shortlistedIds.length}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setShowCompareMatrix(true)}
                disabled={compareList.length < 2}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-xl)',
                    border: 'none',
                    background: compareList.length < 2 ? 'var(--border)' : 'var(--primary)',
                    color: compareList.length < 2 ? 'var(--text-muted)' : '#fff',
                    cursor: compareList.length < 2 ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                  }}
                >
                  Open Comparison
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCityId('all');
                    setSelectedCategoryCode('all');
                    setSelectedCapacityIdx(0);
                    setHasSearched(false);
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Start a new search
                </button>
              </div>
            </div>
          </aside>
        </div>

      {compareList.length > 0 && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: 950,
          background: 'rgba(255,255,255,0.98)',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.08)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Comparing ({compareList.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {compareList.map((venue) => (
                <span key={venue.id} style={{ padding: '10px 14px', borderRadius: '999px', background: 'var(--surface)', color: 'var(--text-main)', fontWeight: '700', fontSize: 'var(--font-sm)' }}>
                  {venue.hotelName}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowCompareMatrix(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '14px 24px',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            <Scale size={16} /> Open Comparison
          </button>
        </div>
      )}

      {/* ─── COMPARE MATRIX MODAL ─── */}
      {showCompareMatrix && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCompareMatrix(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1001,
            width: 'min(90vw, 860px)',
            maxHeight: '85vh',
            overflow: 'auto',
            animation: 'fadeIn 0.2s',
          }}>
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <div>
                <h3 style={{ fontWeight: '800', fontSize: 'var(--font-size-xl)' }}>Venue Comparison</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Side-by-side comparison of {compareList.length} venues</p>
              </div>
              <button onClick={() => setShowCompareMatrix(false)} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 'var(--space-6)', overflowX: 'auto' }}>
              {/* Header row: images */}
              <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)`, gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div />
                {compareList.map((v) => (
                  <div key={v.id} style={{ textAlign: 'center' }}>
                    <div style={{ height: '100px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
                      <img
                        src={v.primaryImage ?? PLACEHOLDER_IMAGE}
                        alt={v.hotelName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                      />
                    </div>
                    <p style={{ fontWeight: '700', fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>{v.hotelName}</p>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              {[
                { label: 'City', getValue: (v: VenueCardData) => v.cityName },
                { label: 'Category', getValue: (v: VenueCardData) => v.categoryName },
                { label: 'Address', getValue: (v: VenueCardData) => v.address },
                { label: 'Max Hall Capacity', getValue: (v: VenueCardData) => v.largestHallCapacity > 0 ? `${v.largestHallCapacity} pax` : '—' },
                { label: 'No. of Halls', getValue: (v: VenueCardData) => `${v.hallCount} hall${v.hallCount !== 1 ? 's' : ''}` },
              ].map(({ label, getValue }, rowIdx) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)`,
                    gap: 'var(--space-4)',
                    padding: 'var(--space-3) 0',
                    borderTop: '1px solid var(--border)',
                    background: rowIdx % 2 === 0 ? 'transparent' : 'var(--surface-2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: 'var(--font-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingLeft: 'var(--space-2)' }}>
                    {label}
                  </div>
                  {compareList.map((v) => {
                    const val = getValue(v);
                    // Highlight best capacity
                    const isBestCapacity = label === 'Max Hall Capacity' &&
                      v.largestHallCapacity === Math.max(...compareList.map((x) => x.largestHallCapacity));
                    return (
                      <div key={v.id} style={{
                        textAlign: 'center',
                        fontSize: 'var(--font-sm)',
                        color: isBestCapacity ? 'var(--status-success)' : 'var(--text-main)',
                        fontWeight: isBestCapacity ? '700' : '500',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 'var(--space-1)',
                      }}>
                        {isBestCapacity && <CheckCircle2 size={14} />}
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

// ─── VENUE CARD COMPONENT ───
interface VenueCardProps {
  venue: VenueCardData;
  isShortlisted: boolean;
  isInCompare: boolean;
  hasRequestContext: boolean;
  onShortlist: () => void;
  onCompare: () => void;
  onView: () => void;
}

function VenueCard({ venue, isShortlisted, isInCompare, hasRequestContext, onShortlist, onCompare, onView }: VenueCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="card"
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: 0,
        padding: 0,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        minHeight: '200px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* ─── IMAGE SECTION (40%) ─── */}
      <div style={{ position: 'relative', minHeight: '200px', background: 'var(--surface-2)' }}>
        <img
          src={imgError ? PLACEHOLDER_IMAGE : (venue.primaryImage ?? PLACEHOLDER_IMAGE)}
          alt={venue.hotelName}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 60%)',
        }} />

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.04em',
        }}>
          {venue.categoryName}
        </div>

        {/* Shortlist button */}
        {hasRequestContext && (
          <button
            id={`shortlist-btn-${venue.id}`}
            onClick={onShortlist}
            title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: isShortlisted ? 'var(--status-warning)' : 'rgba(255,255,255,0.9)',
              color: isShortlisted ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Bookmark size={16} fill={isShortlisted ? '#fff' : 'none'} />
          </button>
        )}
      </div>

      {/* ─── INFO SECTION (60%) ─── */}
      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        <div>
          {/* Name + City */}
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800', color: 'var(--text-main)', marginBottom: 'var(--space-1)', lineHeight: 1.3 }}>
            {venue.hotelName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
            <MapPin size={14} />
            <span>{venue.cityName}{venue.address && venue.address !== '—' ? ` · ${venue.address}` : ''}</span>
          </div>

          {/* Key Stats */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <StatBadge
              icon={<Users size={14} />}
              label="Max Capacity"
              value={venue.largestHallCapacity > 0 ? `${venue.largestHallCapacity} pax` : '—'}
              highlight
            />
            <StatBadge
              icon={<Building2 size={14} />}
              label="Halls"
              value={`${venue.hallCount} hall${venue.hallCount !== 1 ? 's' : ''}`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            id={`view-btn-${venue.id}`}
            onClick={onView}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              fontWeight: '700',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Eye size={15} /> View Details
          </button>

          <button
            id={`compare-btn-${venue.id}`}
            onClick={onCompare}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              background: isInCompare ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--surface-2)',
              color: isInCompare ? 'var(--primary)' : 'var(--text-muted)',
              border: `1.5px solid ${isInCompare ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              fontWeight: '700',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Scale size={15} /> {isInCompare ? 'In Compare' : 'Compare'}
          </button>

          {isShortlisted && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-3)',
              color: 'var(--status-success)',
              fontSize: 'var(--font-sm)',
              fontWeight: '700',
            }}>
              <CheckCircle2 size={16} /> Shortlisted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small stat badge component
function StatBadge({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '2px',
      background: highlight ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface-2)',
      padding: 'var(--space-2) var(--space-3)',
      borderRadius: 'var(--radius-md)',
      minWidth: '100px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: highlight ? 'var(--primary)' : 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {icon} {label}
      </div>
      <span style={{ fontWeight: '800', color: highlight ? 'var(--primary)' : 'var(--text-main)', fontSize: 'var(--font-size-md)' }}>{value}</span>
    </div>
  );
}
