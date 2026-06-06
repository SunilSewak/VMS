import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Users,
  SlidersHorizontal,
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

  // Search-first state: results only shown after user searches
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('all');
  const [selectedCapacityIdx, setSelectedCapacityIdx] = useState(0);

  // Comparison drawer state
  const [compareList, setCompareList] = useState<VenueCardData[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  const [showCompareMatrix, setShowCompareMatrix] = useState(false);

  // Filter panel toggle (mobile) - reserved for future responsive use
  const [_showFilters, _setShowFilters] = useState(false);

  const selectedCapacity = CAPACITY_OPTIONS[selectedCapacityIdx];

  const filters: VenueSearchFilters = {
    searchQuery: hasSearched ? searchQuery : '',
    cityId: selectedCityId,
    categoryCode: selectedCategoryCode,
    capacityMin: selectedCapacity.min,
    capacityMax: selectedCapacity.max,
    requestId: requestId ?? undefined,
  };

  const { venues, loading: venuesLoading, error: venuesError } = useVenues(
    hasSearched ? filters : { searchQuery: '', cityId: 'all', categoryCode: 'all' }
  );
  const { cities, categories, loading: filtersLoading } = useVenueFilters();
  const { shortlistedIds, toggleShortlist } = useShortlist(requestId, user?.id ?? null);

  // Toggle compare
  const toggleCompare = (venue: VenueCardData) => {
    setCompareList((prev) => {
      const exists = prev.find((v) => v.id === venue.id);
      if (exists) return prev.filter((v) => v.id !== venue.id);
      if (prev.length >= 4) return prev; // max 4
      const next = [...prev, venue];
      if (next.length >= 2) setShowCompareDrawer(true);
      return next;
    });
  };

  const handleSearch = () => {
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* ─── MAIN CONTENT ─── */}
      {!hasSearched ? (
        /* Pre-search: Discovery cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--text-main)' }}>
            Popular Destinations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
            {[
              { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80', count: '2 hotels' },
              { city: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80', count: '1 hotel' },
              { city: 'Pune', img: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80', count: '1 hotel' },
              { city: 'Bengaluru', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80', count: '1 hotel' },
              { city: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', count: '1 hotel' },
            ].map(({ city, img, count }) => (
              <button
                key={city}
                onClick={() => {
                  setSearchQuery(city);
                  setHasSearched(true);
                }}
                style={{
                  position: 'relative',
                  height: '120px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={img} alt={city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  padding: 'var(--space-3)',
                  textAlign: 'left',
                }}>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-md)' }}>{city}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>{count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Post-search: Filters + Results */
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

          {/* ─── FILTERS SIDEBAR ─── */}
          <div className="card" style={{ padding: 'var(--space-5)', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
              <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Filters
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {[{ code: 'all', name: 'All Categories' }, ...categories.map((c) => ({ code: c.category_code, name: c.category_name }))].map(({ code, name }) => (
                    <button
                      key={code}
                      onClick={() => setSelectedCategoryCode(code)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${selectedCategoryCode === code ? 'var(--primary)' : 'transparent'}`,
                        background: selectedCategoryCode === code ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-2)',
                        color: selectedCategoryCode === code ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedCategoryCode === code ? '700' : '500',
                        fontSize: 'var(--font-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        width: '100%',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  City
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {[{ id: 'all', city_name: 'All Cities' }, ...cities].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCityId(c.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${selectedCityId === c.id ? 'var(--primary)' : 'transparent'}`,
                        background: selectedCityId === c.id ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-2)',
                        color: selectedCityId === c.id ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedCityId === c.id ? '700' : '500',
                        fontSize: 'var(--font-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        width: '100%',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      <MapPin size={13} /> {c.city_name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hall Capacity */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Hall Capacity
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {CAPACITY_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCapacityIdx(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${selectedCapacityIdx === i ? 'var(--primary)' : 'transparent'}`,
                        background: selectedCapacityIdx === i ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-2)',
                        color: selectedCapacityIdx === i ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedCapacityIdx === i ? '700' : '500',
                        fontSize: 'var(--font-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        width: '100%',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      <Users size={13} /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ─── RESULTS AREA ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Results header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                {venuesLoading
                  ? 'Searching venues…'
                  : `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`}
              </span>
              {compareList.length > 0 && (
                <button
                  onClick={() => setShowCompareDrawer(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    fontSize: 'var(--font-sm)',
                    fontFamily: 'var(--font-family)',
                    cursor: 'pointer',
                    animation: 'fadeIn 0.2s',
                  }}
                >
                  <Scale size={16} />
                  Compare ({compareList.length})
                </button>
              )}
            </div>

            {/* Loading state */}
            {venuesLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse" style={{ height: '200px', background: 'var(--surface-2)' }} />
                ))}
              </div>
            )}

            {/* Error state */}
            {venuesError && !venuesLoading && (
              <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <AlertCircle size={40} style={{ color: 'var(--status-error)', marginBottom: 'var(--space-3)' }} />
                <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Could not load venues</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>{venuesError}</p>
              </div>
            )}

            {/* Empty state */}
            {!venuesLoading && !venuesError && venues.length === 0 && (
              <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <Building2 size={48} style={{ color: 'var(--text-light)', marginBottom: 'var(--space-4)' }} />
                <h4 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>No Venues Found</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
                  Try adjusting your search or filters above.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCityId('all');
                    setSelectedCategoryCode('all');
                    setSelectedCapacityIdx(0);
                    setHasSearched(true);
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Venue Cards */}
            {!venuesLoading && !venuesError && venues.map((venue) => {
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
        </div>
      )}

      {/* ─── COMPARE DRAWER ─── */}
      {showCompareDrawer && compareList.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 900,
              backdropFilter: 'blur(2px)',
              animation: 'fadeIn 0.2s',
            }}
            onClick={() => setShowCompareDrawer(false)}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            zIndex: 901,
            padding: 'var(--space-6)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>Compare Venues</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Select 2–4 venues to compare side by side</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {compareList.length >= 2 && (
                  <button
                    onClick={() => { setShowCompareDrawer(false); setShowCompareMatrix(true); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      padding: 'var(--space-3) var(--space-5)',
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: '700',
                      fontFamily: 'var(--font-family)',
                      cursor: 'pointer',
                    }}
                  >
                    <Scale size={16} /> Open Comparison
                  </button>
                )}
                <button onClick={() => setShowCompareDrawer(false)} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {compareList.map((v) => (
                <div key={v.id} style={{
                  position: 'relative',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  width: '200px',
                  border: '1.5px solid var(--primary)',
                }}>
                  <button
                    onClick={() => toggleCompare(v)}
                    style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                  <div style={{
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    marginBottom: 'var(--space-3)',
                    background: 'var(--border)',
                  }}>
                    <img
                      src={v.primaryPhotoUrl ?? PLACEHOLDER_IMAGE}
                      alt={v.hotel_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <p style={{ fontWeight: '700', fontSize: 'var(--font-sm)', marginBottom: '4px' }}>{v.hotel_name}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{v.city_name}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--primary)', fontWeight: '600', marginTop: '4px' }}>
                    {v.maxCapacity > 0 ? `Up to ${v.maxCapacity} pax` : 'Capacity TBD'}
                  </p>
                </div>
              ))}
              {compareList.length < 4 && (
                <div style={{
                  width: '200px',
                  height: '158px',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-light)',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-sm)',
                }}>
                  <Building2 size={24} />
                  Add venue
                </div>
              )}
            </div>
          </div>
        </>
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
                        src={v.primaryPhotoUrl ?? PLACEHOLDER_IMAGE}
                        alt={v.hotel_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                      />
                    </div>
                    <p style={{ fontWeight: '700', fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>{v.hotel_name}</p>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              {[
                { label: 'City', getValue: (v: VenueCardData) => v.city_name },
                { label: 'Category', getValue: (v: VenueCardData) => v.category_name },
                { label: 'Address', getValue: (v: VenueCardData) => v.address },
                { label: 'Max Hall Capacity', getValue: (v: VenueCardData) => v.maxCapacity > 0 ? `${v.maxCapacity} pax` : '—' },
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
                      v.maxCapacity === Math.max(...compareList.map((x) => x.maxCapacity));
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
          src={imgError ? PLACEHOLDER_IMAGE : (venue.primaryPhotoUrl ?? PLACEHOLDER_IMAGE)}
          alt={venue.hotel_name}
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
          {venue.category_name}
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
            {venue.hotel_name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
            <MapPin size={14} />
            <span>{venue.city_name}{venue.address && venue.address !== '—' ? ` · ${venue.address}` : ''}</span>
          </div>

          {/* Key Stats */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <StatBadge
              icon={<Users size={14} />}
              label="Max Capacity"
              value={venue.maxCapacity > 0 ? `${venue.maxCapacity} pax` : '—'}
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
