import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  User,
  Users,
  Building2,
  Layers,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ImageOff,
} from 'lucide-react';
import { useVenueDetails } from '../features/venues/hooks';
import { useShortlist } from '../features/venues/hooks';
import { useMeetingRequest } from '../features/meetings/hooks';
import { MEETING_STATUSES } from '../features/meetings/constants';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../auth/permissions';
import { ROUTES } from '../routes/routeRegistry';
import type { Hall } from '../features/venues/types';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80';

export function VenueDetails() {
  const { id } = useParams() as { id: string };
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { venue, loading, error } = useVenueDetails(id ?? null);
  const { request } = useMeetingRequest(requestId ?? undefined);
  const requestStatus = request ? MEETING_STATUSES[request.status] : null;
  const canCreateBooking = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
  const { shortlistedIds, toggleShortlist } = useShortlist(requestId, user?.id ?? null);

  const isShortlisted = !!id && shortlistedIds.includes(id);

  // Sort photos by display_order
  const photos = [...(venue?.venue_photos ?? [])].sort(
    (a, b) => (a.display_order ?? 99) - (b.display_order ?? 99)
  );
  const primaryPhoto = photos[0]?.storage_path ?? null;
  const galleryPhotos = photos.slice(0, 6);

  const halls = venue?.halls ?? [];
  const maxCapacity = halls.length > 0 ? Math.max(...halls.map((h) => h.capacity)) : 0;
  const totalArea = halls.reduce((sum, hall) => sum + (hall.area ?? 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="animate-pulse" style={{ height: '360px', borderRadius: 'var(--radius-xl)', background: 'var(--surface-2)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)' }}>
          <div className="animate-pulse card" style={{ height: '200px' }} />
          <div className="animate-pulse card" style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--status-error)', marginBottom: 'var(--space-4)' }} />
        <h3 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>Venue Not Found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
          {error ?? 'The venue you are looking for could not be loaded.'}
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(-1 as any)}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>

      {/* ─── BACK NAV ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(-1 as any)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            color: 'var(--text-muted)', fontSize: 'var(--font-sm)', fontWeight: '600',
            fontFamily: 'var(--font-family)', cursor: 'pointer',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={16} /> Back to Results
        </button>

        {requestId && canCreateBooking && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`${ROUTES.bookingNew}?requestId=${requestId}&hotelId=${id}`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <CheckCircle2 size={16} /> Create Booking
          </button>
        )}
        {requestId && (
          <button
            id="venue-shortlist-btn"
            onClick={(e) => {
              e.preventDefault();
              toggleShortlist(id).catch(console.error);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              background: isShortlisted ? 'var(--status-warning)' : 'var(--surface-2)',
              color: isShortlisted ? '#fff' : 'var(--text-muted)',
              border: `1.5px solid ${isShortlisted ? 'var(--status-warning)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              fontWeight: '700',
              fontSize: 'var(--font-sm)',
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isShortlisted
              ? <><CheckCircle2 size={16} /> Recommended</>
              : <><Bookmark size={16} /> Recommend venue</>
            }
          </button>
        )}
      </div>

      {requestId && (
        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Linked meeting request</span>
                <strong style={{ fontSize: '0.95rem' }}>{request?.request_number ?? requestId}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{request?.meeting_name ?? 'Request not found'}</span>
                {request ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '6px 10px', borderRadius: '999px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {requestStatus?.label ?? request.status}
                  </span>
                ) : null}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(ROUTES.meetingRequests)}
              >
                Back to Requests
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`${ROUTES.venueExplorer}?requestId=${requestId}`)}
              >
                Review recommendations
              </button>
            </div>
          </div>
          {request ? (
            <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date range</span>
                <strong>{new Date(request.start_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} – {new Date(request.end_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected / Guaranteed</span>
                <strong>{request.expected_pax} / {request.guaranteed_pax}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>City</span>
                <strong>{request.cities?.city_name ?? request.target_city_name ?? 'Any'}</strong>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              The venue is being viewed with a request context, but the linked meeting request could not be loaded.
            </div>
          )}
        </div>
      )}

      {/* ─── HERO IMAGE ─── */}
      <div style={{
        height: '360px',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--surface-2)',
      }}>
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={venue.hotel_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-light)' }}>
            <ImageOff size={48} />
            <span style={{ fontSize: 'var(--font-sm)' }}>No photos available</span>
          </div>
        )}
        {/* Gradient overlay with name */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'var(--space-8)',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(6px)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: '700',
            color: '#fff',
            marginBottom: 'var(--space-2)',
            width: 'fit-content',
          }}>
            {venue.hotel_categories?.category_name ?? 'Hotel'}
          </div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', color: '#fff', marginBottom: 'var(--space-1)', letterSpacing: '-0.02em' }}>
            {venue.hotel_name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-sm)' }}>
            <MapPin size={14} />
            <span>{venue.cities?.city_name}{venue.address ? ` · ${venue.address}` : ''}</span>
          </div>
        </div>
      </div>

      {galleryPhotos.length > 1 && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800', marginBottom: 'var(--space-4)' }}>Gallery</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-3)'
          }}>
            {galleryPhotos.map((photo: any, index: number) => (
              <div key={photo.id ?? index} style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                minHeight: '140px',
                background: 'var(--surface-2)'
              }}>
                <img
                  src={photo.storage_path}
                  alt={`${venue.hotel_name} gallery ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT GRID ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Building2 size={18} style={{ color: 'var(--primary)' }} />
              Venue Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Category</p>
                <strong style={{ fontSize: 'var(--font-size-md)', display: 'block', marginTop: '6px' }}>{venue.hotel_categories?.category_name ?? '—'}</strong>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>City</p>
                <strong style={{ fontSize: 'var(--font-size-md)', display: 'block', marginTop: '6px' }}>{venue.cities?.city_name ?? '—'}</strong>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Address</p>
                <span style={{ display: 'block', marginTop: '6px', color: 'var(--text-main)', fontSize: 'var(--font-sm)', lineHeight: 1.6 }}>{venue.address ?? '—'}</span>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Status</p>
                <strong style={{ fontSize: 'var(--font-size-md)', display: 'block', marginTop: '6px' }}>{venue.status}</strong>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Total Halls</p>
                <strong style={{ fontSize: 'var(--font-size-md)', display: 'block', marginTop: '6px' }}>{halls.length}</strong>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Largest Capacity</p>
                <strong style={{ fontSize: 'var(--font-size-md)', display: 'block', marginTop: '6px' }}>{maxCapacity > 0 ? `${maxCapacity} pax` : '—'}</strong>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Total Hall Area</p>
                <strong style={{ fontSize: 'var(--font-size-md)', display: 'block', marginTop: '6px' }}>{totalArea > 0 ? `${totalArea} sq ft` : '—'}</strong>
              </div>
            </div>
          </div>

          {/* ─── HALL INVENTORY ─── */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Layers size={18} style={{ color: 'var(--primary)' }} />
              Hall Inventory
            </h2>

            {halls.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                <Building2 size={40} style={{ marginBottom: 'var(--space-3)', opacity: 0.4 }} />
                <p style={{ fontSize: 'var(--font-sm)' }}>No hall data available yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {halls.map((hall: Hall) => (
                  <HallCard key={hall.id} hall={hall} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDEBAR: Contact & Key Stats ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Key Stats */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Key Metrics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <MetricRow icon={<Users size={16} />} label="Max Hall Capacity" value={maxCapacity > 0 ? `${maxCapacity} pax` : '—'} highlight />
              <MetricRow icon={<Building2 size={16} />} label="Number of Halls" value={`${halls.length}`} />
            </div>
          </div>

          {/* Contact Details */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Contact Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {venue.contact_person && (
                <ContactRow icon={<User size={15} />} label="Contact Person" value={venue.contact_person} />
              )}
              {venue.contact_number && (
                <ContactRow icon={<Phone size={15} />} label="Phone" value={venue.contact_number} />
              )}
              {venue.email && (
                <ContactRow icon={<Mail size={15} />} label="Email" value={venue.email} />
              )}
              {venue.address && (
                <ContactRow icon={<MapPin size={15} />} label="Address" value={venue.address} />
              )}
              {!venue.contact_person && !venue.contact_number && !venue.email && (
                <p style={{ color: 'var(--text-light)', fontSize: 'var(--font-sm)' }}>No contact information recorded.</p>
              )}
            </div>
          </div>

          {/* Remarks */}
          {venue.remarks && (
            <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '3px solid var(--primary)' }}>
              <h3 style={{ fontSize: 'var(--font-xs)', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Notes</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-main)', lineHeight: '1.6' }}>{venue.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HALL CARD ───
function HallCard({ hall }: { hall: Hall }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-lg)',
      alignItems: 'center',
      transition: 'all 0.2s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 6%, var(--surface-2))'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
    >
      <div>
        <div style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>{hall.hall_name}</div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {hall.floor_name && (
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>📍 {hall.floor_name}</span>
          )}
          {hall.area && (
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>📐 {hall.area} sq ft</span>
          )}
          {hall.seating_types && (
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>🪑 {hall.seating_types}</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: '800', fontSize: 'var(--font-size-xl)', color: 'var(--primary)' }}>{hall.capacity}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>pax</div>
      </div>
    </div>
  );
}

// ─── METRIC ROW ───
function MetricRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: 'var(--space-3)',
      background: highlight ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface-2)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
        {icon} {label}
      </div>
      <span style={{ fontWeight: '800', color: highlight ? 'var(--primary)' : 'var(--text-main)', fontSize: 'var(--font-size-md)' }}>
        {value}
      </span>
    </div>
  );
}

// ─── CONTACT ROW ───
function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-main)', fontWeight: '600' }}>{value}</div>
      </div>
    </div>
  );
}
