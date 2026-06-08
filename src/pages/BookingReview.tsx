import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cancelBooking, confirmBooking, getBookingById } from '../features/bookings/bookingService';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { EmptyState } from '../components/EmptyState';

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

export function BookingReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Booking ID is missing.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadBooking = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getBookingById(id);
        if (mounted) {
          setBooking(data);
        }
      } catch (caught) {
        if (mounted) {
          setError((caught as Error).message ?? 'Unable to load booking.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    if (!id || !user) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (action === 'confirm') {
        await confirmBooking(id, user);
        setSuccessMessage('Booking confirmed successfully.');
      } else {
        await cancelBooking(id, user);
        setSuccessMessage('Booking cancelled successfully.');
      }

      const updated = await getBookingById(id);
      setBooking(updated);
    } catch (caught) {
      setError((caught as Error).message ?? 'Unable to complete action.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading booking review...</div>;
  }

  if (error || !booking) {
    return (
      <EmptyState
        title={error ? 'Unable to load booking' : 'Booking not found'}
        description={error ?? 'Please return to the bookings list and try again.'}
        icon={<ShieldCheck size={48} style={{ color: 'var(--danger)' }} />}
      />
    );
  }

  const canConfirm = booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
  const canCancel = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Review booking</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Confirm or cancel this booking and review the current venue reservation details.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Link
              to={ROUTES.bookingDetails.replace(':id', booking.id)}
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
              <ArrowLeft size={16} /> Booking details
            </Link>
          </div>
        </div>

        <section style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Booking reference</div>
              <div style={{ fontWeight: 600 }}>{booking.booking_reference}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Meeting</div>
              <div style={{ fontWeight: 600 }}>{booking.meeting_requests?.meeting_name ?? booking.meeting_request_id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Venue</div>
              <div style={{ fontWeight: 600 }}>{booking.hotels?.hotel_name ?? booking.hotel_id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</div>
              <div style={{ fontWeight: 600 }}>{booking.status.replace('_', ' ')}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Stay dates</div>
              <div style={{ fontWeight: 600 }}>{formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)}</div>
            </div>
          </div>
        </section>
      </div>

      {successMessage ? (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: 'var(--space-4)' }}>
          {successMessage}
        </div>
      ) : null}
      {error ? (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <button
          type="button"
          disabled={!canConfirm || actionLoading}
          onClick={() => handleAction('confirm')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.95rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: canConfirm ? 'var(--success)' : 'var(--text-muted)',
            color: 'white',
            cursor: canConfirm && !actionLoading ? 'pointer' : 'not-allowed',
            minWidth: '180px',
          }}
        >
          <CheckCircle2 size={16} /> Confirm booking
        </button>

        <button
          type="button"
          disabled={!canCancel || actionLoading}
          onClick={() => handleAction('cancel')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.95rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: canCancel ? 'var(--surface)' : 'var(--text-muted)',
            color: canCancel ? 'var(--danger)' : 'var(--text-muted)',
            cursor: canCancel && !actionLoading ? 'pointer' : 'not-allowed',
            minWidth: '180px',
          }}
        >
          <XCircle size={16} /> Cancel booking
        </button>
      </div>

      <section style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Created</div>
            <div style={{ fontWeight: 600 }}>{formatDate(booking.created_at)}{booking.created_by ? ` · ${booking.created_by}` : ''}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Confirmed at</div>
            <div style={{ fontWeight: 600 }}>{formatDate(booking.confirmed_at)}{booking.confirmed_by ? ` · ${booking.confirmed_by}` : ''}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Review guidance</div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              Use confirm when the venue is finalized. Cancel if the booking should be released.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
