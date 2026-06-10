import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, MapPin, CalendarDays, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingById } from '../features/bookings/bookingService';
import { getAccommodationPlanByBookingId, createAccommodationPlan } from '../features/rooming/roomingService';
import type { Booking } from '../features/bookings/types';
import type { AccommodationPlan, AccommodationPlanCreateInput } from '../features/rooming/types';
import { ROUTES } from '../routes/routeRegistry';
import { EmptyState } from '../components/EmptyState';
import { ROLES } from '../auth/permissions';

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BookingDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [accommodationPlan, setAccommodationPlan] = useState<AccommodationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const successMessage = searchParams.get('created') ? 'Booking created successfully.' : null;

  useEffect(() => {
    if (!id || id === 'undefined' || id === ':id') {
      setError(`Booking ID is missing. (Received: ${String(id)})`);
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getBookingById(id);
        if (mounted) {
          setBooking(data);
        }
        
        // Load existing accommodation plan for this booking
        if (data.id) {
          const plan = await getAccommodationPlanByBookingId(data.id);
          if (mounted) {
            setAccommodationPlan(plan);
          }
        }
      } catch (caught) {
        if (mounted) {
          setError((caught as Error).message ?? 'Unable to load booking details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const canReview = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  const handlePlanAccommodation = async () => {
    if (!user || !booking) return;
    
    setPlanLoading(true);
    try {
      // Check if accommodation plan already exists
      if (accommodationPlan && accommodationPlan.id) {
        // Navigate to existing plan
        const path = ROUTES.roomingDetails.replace(':id', accommodationPlan.id);
        navigate(path);
        return;
      }
      
      // Create new draft accommodation plan
      const createInput: AccommodationPlanCreateInput = {
        booking_id: booking.id,
        status: 'DRAFT',
        expected_pax: booking.expected_pax || 0,
        single_rooms_planned: booking.rooms_booked || 0,
        double_rooms_planned: 0,
        triple_rooms_planned: 0,
        remarks: null,
      };
      
      const newPlan = await createAccommodationPlan(createInput, user);
      // Navigate to new plan details
      if (newPlan.id) {
        const path = ROUTES.roomingDetails.replace(':id', newPlan.id);
        navigate(path);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unable to create accommodation plan.');
    } finally {
      setPlanLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <EmptyState
        title={error ? 'Unable to load booking' : 'Booking not found'}
        description={error ?? 'Please go back to the bookings list and try again.'}
        icon={<ClipboardList size={48} style={{ color: 'var(--danger)' }} />}
      />
    );
  }

  return (
    <div>
      {successMessage ? (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: 'var(--space-4)' }}>
          {successMessage}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Booking details</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Review booking status, venue details, and audit history.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Link
              to={ROUTES.bookings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                textDecoration: 'none',
                border: '1px solid var(--border)',
              }}
            >
              <ArrowLeft size={16} /> Back to bookings
            </Link>
            {canReview ? (
              <Link
                to={ROUTES.bookingReview.replace(':id', booking.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                <ShieldCheck size={16} /> Review booking
              </Link>
            ) : null}
            <button
              onClick={handlePlanAccommodation}
              disabled={planLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: accommodationPlan ? 'var(--success)' : 'var(--primary)',
                color: 'white',
                textDecoration: 'none',
                border: 'none',
                cursor: planLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {planLoading ? (
                <span>Loading...</span>
              ) : accommodationPlan ? (
                <>
                  <CalendarDays size={16} /> Manage Accommodation
                </>
              ) : (
                <>
                  <CalendarDays size={16} /> Plan Accommodation
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-3)' }}>
              <MapPin size={18} />
              <h4 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>Venue information</h4>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Hotel</div>
                <div style={{ fontWeight: 600 }}>{booking.hotels?.hotel_name ?? booking.hotel_id}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Hall</div>
                <div style={{ fontWeight: 600 }}>{booking.halls?.hall_name ?? booking.hall_id ?? '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>City</div>
                <div style={{ fontWeight: 600 }}>{booking.hotels?.city_name ?? '-'}</div>
              </div>
            </div>
          </section>

          <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-3)' }}>
              <CalendarDays size={18} />
              <h4 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>Booking timeline</h4>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Check in</div>
                <div style={{ fontWeight: 600 }}>{formatDate(booking.check_in_date)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Check out</div>
                <div style={{ fontWeight: 600 }}>{formatDate(booking.check_out_date)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</div>
                <div style={{ fontWeight: 600 }}>{booking.status.replace('_', ' ')}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-md)', fontWeight: 600 }}>Meeting information</h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Request number</div>
              <div style={{ fontWeight: 600 }}>{booking.meeting_requests?.request_number ?? booking.meeting_request_id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Meeting name</div>
              <div style={{ fontWeight: 600 }}>{booking.meeting_requests?.meeting_name ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Meeting status</div>
              <div style={{ fontWeight: 600 }}>{booking.meeting_requests?.status.replace('_', ' ') ?? '-'}</div>
            </div>
          </div>
        </section>

        <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-md)', fontWeight: 600 }}>Booking details</h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Booking reference</div>
              <div style={{ fontWeight: 600 }}>{booking.booking_reference}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Rooms booked</div>
              <div style={{ fontWeight: 600 }}>{booking.rooms_booked ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Expected pax</div>
              <div style={{ fontWeight: 600 }}>{booking.expected_pax ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Special requirements</div>
              <div style={{ fontWeight: 600 }}>{booking.special_requirements ?? 'None'}</div>
            </div>
          </div>
        </section>
      </div>

      <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-md)', fontWeight: 600 }}>Audit trail</h4>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Created</div>
            <div style={{ fontWeight: 600 }}>{formatDate(booking.created_at)}{booking.created_by ? ` · ${booking.created_by}` : ''}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Last updated</div>
            <div style={{ fontWeight: 600 }}>{formatDate(booking.updated_at)}{booking.updated_by ? ` · ${booking.updated_by}` : ''}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Confirmed</div>
            <div style={{ fontWeight: 600 }}>{formatDate(booking.confirmed_at)}{booking.confirmed_by ? ` · ${booking.confirmed_by}` : ''}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
