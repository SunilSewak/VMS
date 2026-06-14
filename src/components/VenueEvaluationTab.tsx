import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MeetingRequest } from '../features/meetings/types';
import { 
  searchVenues, 
  fetchShortlistsForRequest, 
  addToShortlist, 
  removeFromShortlist,
  fetchCities 
} from '../features/venues/api';
import { VenueCardViewModel, VenueSearchFilters, VenueShortlist, City } from '../features/venues/types';
import { MapPin, Users, Building2, Layout, Plus, Check, Trash2, ArrowRight, Loader2, Star, Hotel } from 'lucide-react';

interface VenueEvaluationTabProps {
  request: MeetingRequest;
  onProceedToBooking: () => void;
}

export function VenueEvaluationTab({ request, onProceedToBooking }: VenueEvaluationTabProps) {
  const { user } = useAuth();
  
  // Data states
  const [venues, setVenues] = useState<VenueCardViewModel[]>([]);
  const [shortlists, setShortlists] = useState<VenueShortlist[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<VenueSearchFilters>({
    zone: 'all',
    cityId: request.city_id || 'all',
    categoryCode: 'all',
    searchQuery: '',
    capacityMin: request.expected_pax || 0
  });

  // Derived state
  const shortlistedHotelIds = shortlists.map(s => s.hotel_id);
  const requestCity = cities.find(c => c.id === request.city_id)?.city_name || 'Loading...';

  useEffect(() => {
    loadInitialData();
  }, [request.id]);

  useEffect(() => {
    handleSearch();
  }, [filters.cityId, filters.capacityMin, filters.categoryCode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [citiesData, shortlistsData] = await Promise.all([
        fetchCities(),
        fetchShortlistsForRequest(request.id!)
      ]);
      
      setCities(citiesData);
      setShortlists(shortlistsData);
      
      // The search will be triggered by the effect on filters
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load necessary data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      const results = await searchVenues(filters);
      setVenues(results);
    } catch (err) {
      console.error('Failed to search venues:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddShortlist = async (hotelId: string) => {
    if (!user) return;
    try {
      await addToShortlist(request.id!, hotelId, user.id);
      // Refresh shortlists
      const updatedShortlists = await fetchShortlistsForRequest(request.id!);
      setShortlists(updatedShortlists);
    } catch (err) {
      console.error('Failed to add to shortlist:', err);
      alert('Failed to add venue to shortlist.');
    }
  };

  const handleRemoveShortlist = async (hotelId: string) => {
    try {
      await removeFromShortlist(request.id!, hotelId);
      // Refresh shortlists
      const updatedShortlists = await fetchShortlistsForRequest(request.id!);
      setShortlists(updatedShortlists);
    } catch (err) {
      console.error('Failed to remove from shortlist:', err);
      alert('Failed to remove venue from shortlist.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-8)' }}>
        <Loader2 className="spin" size={24} color="var(--primary)" />
        <span style={{ marginLeft: 'var(--space-2)' }}>Loading workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      
      {/* 1. Requirements Summary */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MapPin size={20} color="var(--primary)" />
          Meeting Requirements
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</span>
            <span style={{ fontWeight: 600 }}>{requestCity}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expected Pax</span>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Users size={14} /> {request.expected_pax}
            </span>
          </div>
          {request.residential_flag && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rooms Required</span>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Building2 size={14} /> {request.rooms_required || 'TBD'}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Halls</span>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Layout size={14} /> {request.halls_required || 1}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-5)', alignItems: 'start' }}>
        
        {/* Left Side: Venue Search & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-lg)' }}>Available Venues</h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select 
                className="input" 
                value={filters.cityId || 'all'} 
                onChange={(e) => setFilters({...filters, cityId: e.target.value})}
                style={{ padding: 'var(--space-2)' }}
              >
                <option value="all">All Cities</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
              </select>
              <select 
                className="input" 
                value={filters.categoryCode || 'all'} 
                onChange={(e) => setFilters({...filters, categoryCode: e.target.value})}
                style={{ padding: 'var(--space-2)' }}
              >
                <option value="all">All Categories</option>
                <option value="5_STAR">5 Star</option>
                <option value="4_STAR">4 Star</option>
                <option value="3_STAR">3 Star</option>
              </select>
            </div>
          </div>

          {searchLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
              <Loader2 className="spin" size={24} color="var(--primary)" />
            </div>
          ) : venues.length === 0 ? (
            <div style={{ 
              padding: 'var(--space-6)', 
              textAlign: 'center', 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border)' 
            }}>
              <Hotel size={32} color="var(--text-muted)" style={{ margin: '0 auto var(--space-2) auto' }} />
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No venues found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {venues.map(venue => {
                const isShortlisted = shortlistedHotelIds.includes(venue.id);
                return (
                  <div key={venue.id} style={{
                    display: 'flex',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    padding: 'var(--space-4)',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h4 style={{ margin: 0, fontSize: 'var(--font-md)' }}>{venue.hotelName}</h4>
                        {venue.categoryName !== '—' && (
                          <span style={{ 
                            fontSize: 'var(--font-xs)', 
                            background: '#fef3c7', 
                            color: '#d97706', 
                            padding: '2px 6px', 
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            <Star size={10} fill="currentColor" /> {venue.categoryName.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {venue.cityName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Layout size={14} /> Max Capacity: {venue.largestHallCapacity}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={14} /> {venue.hallCount} Halls
                        </span>
                      </div>
                    </div>

                    <button
                      className={`btn ${isShortlisted ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={isShortlisted}
                      onClick={() => handleAddShortlist(venue.id)}
                      style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-sm)' }}
                    >
                      {isShortlisted ? (
                        <><Check size={16} /> Shortlisted</>
                      ) : (
                        <><Plus size={16} /> Add to Shortlist</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Side: Current Shortlist */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-lg)' }}>Current Shortlist</h3>
            <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              {shortlists.length} venue{shortlists.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          
          <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '400px', overflowY: 'auto' }}>
            {shortlists.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                No venues added to shortlist yet.
              </div>
            ) : (
              shortlists.map(sl => (
                <div key={sl.id} style={{
                  background: 'var(--background)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{sl.hotels?.hotel_name}</span>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{sl.hotels?.city?.city_name}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveShortlist(sl.hotel_id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 'var(--space-1)' }}
                    title="Remove from shortlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--background)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onProceedToBooking}
              disabled={shortlists.length === 0}
            >
              Proceed to Booking <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
