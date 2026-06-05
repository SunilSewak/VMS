import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Bed, 
  History, 
  Star, 
  SlidersHorizontal,
  Bookmark,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface HotelVenue {
  id: string;
  name: string;
  rating: number;
  city: string;
  capacity: number;
  rooms: number;
  ajantaMeetings: number;
  lastUsed: string;
  typicalSpendMin: string;
  typicalSpendMax: string;
  image: string;
}

const mockHotels: HotelVenue[] = [
  {
    id: 'h1',
    name: 'Taj Lands End',
    rating: 5,
    city: 'Mumbai',
    capacity: 300,
    rooms: 150,
    ajantaMeetings: 24,
    lastUsed: 'Mar 2026',
    typicalSpendMin: '8L',
    typicalSpendMax: '12L',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'h2',
    name: 'Grand Hyatt',
    rating: 5,
    city: 'Goa',
    capacity: 500,
    rooms: 250,
    ajantaMeetings: 16,
    lastUsed: 'Jan 2026',
    typicalSpendMin: '15L',
    typicalSpendMax: '22L',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'h3',
    name: 'JW Marriott',
    rating: 5,
    city: 'Pune',
    capacity: 250,
    rooms: 120,
    ajantaMeetings: 18,
    lastUsed: 'Apr 2026',
    typicalSpendMin: '6L',
    typicalSpendMax: '10L',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'h4',
    name: 'Novotel Juhu',
    rating: 4,
    city: 'Mumbai',
    capacity: 200,
    rooms: 180,
    ajantaMeetings: 32,
    lastUsed: 'May 2026',
    typicalSpendMin: '5L',
    typicalSpendMax: '8L',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'h5',
    name: 'The Leela Palace',
    rating: 5,
    city: 'Bengaluru',
    capacity: 450,
    rooms: 300,
    ajantaMeetings: 11,
    lastUsed: 'Nov 2025',
    typicalSpendMin: '18L',
    typicalSpendMax: '25L',
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'h6',
    name: 'Hyatt Regency',
    rating: 4,
    city: 'Delhi',
    capacity: 350,
    rooms: 220,
    ajantaMeetings: 9,
    lastUsed: 'Feb 2026',
    typicalSpendMin: '10L',
    typicalSpendMax: '15L',
    image: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80'
  }
];

export function VenueExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState('All');
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [compared, setCompared] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Toggle Shortlist
  const toggleShortlist = (id: string) => {
    setShortlisted(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle Compare
  const toggleCompare = (id: string) => {
    setCompared(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 hotels at once.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Filter logic
  const filteredHotels = mockHotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hotel.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = cityFilter === 'All' || hotel.city === cityFilter;
    
    let matchesCapacity = true;
    if (capacityFilter === '200-') {
      matchesCapacity = hotel.capacity <= 200;
    } else if (capacityFilter === '201-400') {
      matchesCapacity = hotel.capacity > 200 && hotel.capacity <= 400;
    } else if (capacityFilter === '400+') {
      matchesCapacity = hotel.capacity > 400;
    }

    return matchesSearch && matchesCity && matchesCapacity;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-main)' }}>
            Venue Explorer
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Search corporate-approved properties, review historical spend, and compare capacities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {compared.length > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={() => setShowCompareModal(true)}
              style={{ position: 'relative' }}
            >
              Compare ({compared.length})
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '18px',
                height: '18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{compared.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)'
      }} className="content-grid">
        {/* Filter Panel (Span 1 Column on Desktop layout, stacks on mobile) */}
        <div className="card" style={{ height: 'fit-content', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} />
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Search Hotel or City</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Taj, Mumbai..." 
                  style={{ paddingLeft: '32px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>City Location</label>
              <select 
                className="input" 
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="All">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Goa">Goa</option>
                <option value="Pune">Pune</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            {/* Hall Capacity */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Hall Capacity</label>
              <select 
                className="input" 
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
              >
                <option value="All">Any Capacity</option>
                <option value="200-">Up to 200 pax</option>
                <option value="201-400">201 - 400 pax</option>
                <option value="400+">400+ pax</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hotel Cards Section (Span 2 Columns on Desktop) */}
        <div style={{ 
          gridColumn: 'span 2', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-4)'
        }} className="show-desktop">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredHotels.length}</strong> matching venues
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredHotels.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <HelpCircle size={48} style={{ color: 'var(--text-light)', marginBottom: 'var(--space-4)' }} />
                <h4 style={{ fontWeight: '600' }}>No Venues Found</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredHotels.map((hotel) => {
                const isShortlisted = shortlisted.includes(hotel.id);
                const isCompared = compared.includes(hotel.id);
                return (
                  <div 
                    key={hotel.id} 
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 'var(--space-6)',
                      padding: 'var(--space-4)',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Image Area */}
                    <div style={{
                      width: '180px',
                      height: '140px',
                      borderRadius: 'var(--radius-md)',
                      backgroundImage: `url(${hotel.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      <button 
                        onClick={() => toggleShortlist(hotel.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#ffffff',
                          color: isShortlisted ? 'var(--status-warning)' : 'var(--text-muted)',
                          padding: 'var(--space-1)',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <Bookmark size={16} fill={isShortlisted ? 'var(--status-warning)' : 'none'} />
                      </button>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>{hotel.name}</h4>
                        <div style={{ display: 'flex', color: 'var(--status-warning)' }}>
                          {Array.from({ length: hotel.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="var(--status-warning)" />
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 var(--space-3)' }}>
                        <MapPin size={14} />
                        <span>{hotel.city}</span>
                      </div>

                      {/* Spec Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)' }}>
                          <Users size={14} style={{ color: 'var(--text-light)' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Hall Capacity: <strong>{hotel.capacity}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)' }}>
                          <Bed size={14} style={{ color: 'var(--text-light)' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Rooms: <strong>{hotel.rooms}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)' }}>
                          <History size={14} style={{ color: 'var(--text-light)' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Ajanta Meetings: <strong>{hotel.ajantaMeetings}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)' }}>
                          <CheckCircle size={14} style={{ color: 'var(--status-success)' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Last Used: <strong>{hotel.lastUsed}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Spend & Action Panel */}
                    <div style={{
                      paddingLeft: 'var(--space-4)',
                      borderLeft: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 'var(--space-2)',
                      minWidth: '150px'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: '600' }}>Typical Spend</span>
                        <div style={{ fontSize: 'var(--font-lg)', fontWeight: '700', color: 'var(--primary)' }}>
                          ₹{hotel.typicalSpendMin} – ₹{hotel.typicalSpendMax}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', width: '100%', marginTop: 'var(--space-2)' }}>
                        <button 
                          className={`btn ${isCompared ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: 'var(--space-2)' }}
                          onClick={() => toggleCompare(hotel.id)}
                        >
                          {isCompared ? 'Compared' : 'Compare'}
                        </button>
                        <button 
                          className="btn btn-primary"
                          style={{ flex: 1, padding: 'var(--space-2)' }}
                          onClick={() => alert(`Details for ${hotel.name}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="command-backdrop" onClick={() => setShowCompareModal(false)}>
          <div className="command-modal" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="command-search-wrapper" style={{ justifyContent: 'space-between' }}>
              <h4 style={{ fontWeight: '700', margin: 0 }}>Venue Comparison Matrix</h4>
              <button className="btn btn-secondary" onClick={() => setShowCompareModal(false)}>Close</button>
            </div>
            <div style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Features</th>
                    {mockHotels.filter(h => compared.includes(h.id)).map(h => (
                      <th key={h.id} style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '700', color: 'var(--primary)' }}>{h.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>City Location</td>
                    {mockHotels.filter(h => compared.includes(h.id)).map(h => (
                      <td key={h.id} style={{ padding: 'var(--space-3)' }}>{h.city}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>Hall Capacity</td>
                    {mockHotels.filter(h => compared.includes(h.id)).map(h => (
                      <td key={h.id} style={{ padding: 'var(--space-3)' }}>{h.capacity} Pax</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>Rooms Available</td>
                    {mockHotels.filter(h => compared.includes(h.id)).map(h => (
                      <td key={h.id} style={{ padding: 'var(--space-3)' }}>{h.rooms} Rooms</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>Ajanta Meetings</td>
                    {mockHotels.filter(h => compared.includes(h.id)).map(h => (
                      <td key={h.id} style={{ padding: 'var(--space-3)' }}>{h.ajantaMeetings} events</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>Typical Spend</td>
                    {mockHotels.filter(h => compared.includes(h.id)).map(h => (
                      <td key={h.id} style={{ padding: 'var(--space-3)', fontWeight: '700' }}>₹{h.typicalSpendMin} – ₹{h.typicalSpendMax}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
