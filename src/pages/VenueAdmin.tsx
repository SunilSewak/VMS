import { useState, useEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Mail, Phone, BedDouble, CalendarDays, Plus, Database, Upload } from 'lucide-react';
import type { Hotel } from '../features/venues/types';
import { getHotels, deleteHotel } from '../features/venues/venueService';
import { HotelFormModal } from '../components/HotelFormModal';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: 'color-mix(in srgb, var(--status-success) 14%, transparent)', color: 'var(--status-success)' },
  INACTIVE: { bg: 'color-mix(in srgb, var(--status-error) 14%, transparent)', color: 'var(--status-error)' },
  PENDING_APPROVAL: { bg: 'color-mix(in srgb, var(--status-warning) 16%, transparent)', color: 'var(--status-warning)' },
};

export function VenueAdmin() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      setLoading(true);
      const data = await getHotels();
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
      alert('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(hotelId: string) {
    if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteHotel(hotelId);
      await loadHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  }

  function handleCreateHotel() {
    setEditingHotel(null);
    setShowFormModal(true);
  }

  function handleEditHotel(hotel: Hotel) {
    setEditingHotel(hotel);
    setShowFormModal(true);
  }

  async function handleFormComplete() {
    setShowFormModal(false);
    setEditingHotel(null);
    await loadHotels();
  }

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.city?.city_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || hotel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <Building2 size={22} />
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)' }}>
              Venue Repository
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', maxWidth: '480px' }}>
            Manage all hotels, halls, and accommodations across the venue inventory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/administration/masters/venues/data-center')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Database size={16} /> Data Center
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/administration/masters/venues/bulk-upload')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Upload size={16} /> Bulk Upload
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateHotel}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Plus size={16} /> Create Hotel
          </button>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
              Search by Hotel or City
            </label>
            <input
              type="text"
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
              Filter by Status
            </label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>

          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
            Showing <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{filteredHotels.length}</span> of{' '}
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{hotels.length}</span> hotels
          </div>
        </div>
      </div>

      {/* ─── LOADING ─── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse" style={{ height: '220px', background: 'var(--surface-2)' }} />
          ))}
        </div>
      )}

      {/* ─── EMPTY STATE ─── */}
      {!loading && filteredHotels.length === 0 && (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Building2 size={56} style={{ color: 'var(--text-light)', marginBottom: 'var(--space-5)', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-3)' }}>
            {hotels.length === 0 ? 'No hotels created yet' : 'No hotels match your search'}
          </h3>
          {hotels.length === 0 && (
            <button
              className="btn btn-primary"
              onClick={handleCreateHotel}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Plus size={16} /> Create the first hotel
            </button>
          )}
        </div>
      )}

      {/* ─── HOTEL CARDS ─── */}
      {!loading && filteredHotels.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredHotels.map((hotel) => {
            const statusStyle = STATUS_STYLES[hotel.status] ?? STATUS_STYLES.PENDING_APPROVAL;
            return (
              <div key={hotel.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Card Header */}
                <div style={{
                  padding: 'var(--space-5)',
                  background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--text-main)' }}>
                      {hotel.hotel_name}
                    </h3>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}>
                      {hotel.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-2)' }}>
                    <MapPin size={13} /> {hotel.city?.city_name || 'N/A'}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
                  {hotel.contact_email && (
                    <DetailRow icon={<Mail size={13} />} label="Email" value={hotel.contact_email} />
                  )}
                  {hotel.contact_phone && (
                    <DetailRow icon={<Phone size={13} />} label="Phone" value={hotel.contact_phone} />
                  )}
                  {hotel.total_rooms != null && (
                    <DetailRow icon={<BedDouble size={13} />} label="Total Rooms" value={String(hotel.total_rooms)} />
                  )}
                  <DetailRow icon={<CalendarDays size={13} />} label="Ajanta Events" value={String(hotel.total_ajanta_events ?? 0)} />
                  <DetailRow
                    icon={<CalendarDays size={13} />}
                    label="Last Used"
                    value={hotel.last_used_date ? new Date(hotel.last_used_date).toLocaleDateString('en-IN') : 'Never used'}
                  />
                </div>

                {/* Card Footer */}
                <div style={{
                  padding: 'var(--space-3) var(--space-5)',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  display: 'flex', gap: 'var(--space-2)',
                }}>
                  <button
                    onClick={() => navigate(`/administration/masters/venues/${hotel.id}`)}
                    style={footerBtnStyle('var(--primary)')}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditHotel(hotel)}
                    style={footerBtnStyle('var(--text-main)')}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.id)}
                    style={footerBtnStyle('var(--status-error)')}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── HOTEL FORM MODAL ─── */}
      {showFormModal && (
        <HotelFormModal
          hotel={editingHotel}
          onClose={() => {
            setShowFormModal(false);
            setEditingHotel(null);
          }}
          onComplete={handleFormComplete}
        />
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-light)', fontSize: 'var(--font-xs)' }}>
        {icon} {label}
      </span>
      <span style={{ color: 'var(--text-main)', fontSize: 'var(--font-sm)', fontWeight: 600, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
        {value}
      </span>
    </div>
  );
}

function footerBtnStyle(color: string): CSSProperties {
  return {
    flex: 1,
    padding: '0.55rem 0.5rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color,
    fontWeight: 700,
    fontSize: 'var(--font-sm)',
    cursor: 'pointer',
  };
}
