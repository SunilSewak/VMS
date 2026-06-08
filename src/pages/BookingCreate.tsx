import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, ClipboardList, CheckCircle2, MapPin, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMeetingRequests } from '../features/meetings/hooks';
import { useVenues, useVenueDetails } from '../features/venues/hooks';
import { createBooking } from '../features/bookings/bookingService';
import type { BookingCreateInput } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { EmptyState } from '../components/EmptyState';

const DEFAULT_VENUE_FILTERS = { searchQuery: '', cityId: 'all', categoryCode: 'all' };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function BookingCreate() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestIdParam = searchParams.get('requestId') ?? undefined;
  const hotelIdParam = searchParams.get('hotelId') ?? undefined;

  const [meetingRequestId, setMeetingRequestId] = useState<string>(requestIdParam ?? '');
  const [hotelId, setHotelId] = useState<string>(hotelIdParam ?? '');

  const { requests, loading: requestsLoading, error: requestsError } = useMeetingRequests();
  const { venues, loading: venuesLoading, error: venuesError } = useVenues(DEFAULT_VENUE_FILTERS);
  const { venue: selectedHotel, loading: selectedHotelLoading } = useVenueDetails(hotelId ?? null);
  const [hallId, setHallId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomsBooked, setRoomsBooked] = useState('0');
  const [hallsBooked, setHallsBooked] = useState('0');
  const [expectedPax, setExpectedPax] = useState('0');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (requestIdParam) {
      setMeetingRequestId(requestIdParam);
    }
  }, [requestIdParam]);

  useEffect(() => {
    if (hotelIdParam) {
      setHotelId(hotelIdParam);
    }
  }, [hotelIdParam]);

  const selectedMeetingRequest = useMemo(
    () => requests.find((request) => request.id === meetingRequestId) ?? null,
    [requests, meetingRequestId]
  );

  const hotelOptions = useMemo(
    () => [
      ...(selectedHotel ? [{ id: selectedHotel.id, name: selectedHotel.hotel_name }] : []),
      ...venues
        .filter((venue) => venue.hotelId !== (selectedHotel?.id ?? ''))
        .map((venue) => ({ id: venue.hotelId, name: venue.hotelName })),
    ],
    [venues, selectedHotel]
  );

  const validMeetingRequest = !!meetingRequestId && selectedMeetingRequest;
  const validHotel = !!hotelId && (hotelOptions.some((option) => option.id === hotelId) || !!selectedHotel);

  const selectedHotelDetails = useMemo(() => {
    if (selectedHotel && selectedHotel.id === hotelId) return selectedHotel;
    return null;
  }, [hotelId, selectedHotel]);

  const availableHalls = selectedHotelDetails?.halls ?? [];

  const handleCreate = async () => {
    if (!user) return;

    setSubmitError(null);
    if (!meetingRequestId) {
      setSubmitError('Meeting request is required.');
      return;
    }
    if (!hotelId) {
      setSubmitError('Venue selection is required.');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      setSubmitError('Check-in and check-out dates are required.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setSubmitError('Check-out must be after check-in.');
      return;
    }
    if (Number(roomsBooked) < 0) {
      setSubmitError('Rooms required must be zero or greater.');
      return;
    }
    if (Number(expectedPax) <= 0) {
      setSubmitError('Expected pax must be greater than zero.');
      return;
    }

    const payload: BookingCreateInput = {
      meeting_request_id: meetingRequestId,
      hotel_id: hotelId,
      hall_id: hallId || null,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      rooms_booked: Number(roomsBooked),
      halls_booked: Number(hallsBooked),
      expected_pax: Number(expectedPax),
      special_requirements: specialRequirements.trim() || null,
    };

    setSaving(true);
    try {
      const booking = await createBooking(payload, user);
      navigate(`${ROUTES.bookingDetails.replace(':id', booking.id)}?created=true`);
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Unable to create booking.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const loading = requestsLoading || venuesLoading || selectedHotelLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>Create Booking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Link a meeting request to a shortlisted venue and raise a booking request for review.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to={ROUTES.bookings}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Bookings
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 320px' }}>
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Meeting Request *</label>
              <select
                value={meetingRequestId}
                onChange={(event) => setMeetingRequestId(event.target.value)}
                style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
              >
                <option value="">Select a meeting request</option>
                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.request_number} — {request.meeting_name}
                  </option>
                ))}
              </select>
              {requestIdParam && !validMeetingRequest ? (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                  The meeting request could not be loaded. Choose another request.
                </div>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Venue *</label>
              <select
                value={hotelId}
                onChange={(event) => setHotelId(event.target.value)}
                style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
              >
                <option value="">Select a venue</option>
                {hotelOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Hall</label>
              <select
                value={hallId}
                onChange={(event) => setHallId(event.target.value)}
                disabled={!availableHalls.length}
                style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: availableHalls.length ? 'var(--surface)' : 'var(--background)' }}
              >
                <option value="">Select a hall (optional)</option>
                {availableHalls.map((hall) => (
                  <option key={hall.id} value={hall.id}>{hall.hall_name} — {hall.capacity} pax</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Check-in *</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(event) => setCheckInDate(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Check-out *</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(event) => setCheckOutDate(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Rooms required *</label>
                <input
                  type="number"
                  min="0"
                  value={roomsBooked}
                  onChange={(event) => setRoomsBooked(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Expected pax *</label>
                <input
                  type="number"
                  min="1"
                  value={expectedPax}
                  onChange={(event) => setExpectedPax(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Halls booked</label>
                <input
                  type="number"
                  min="0"
                  value={hallsBooked}
                  onChange={(event) => setHallsBooked(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Special requirements</label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(event) => setSpecialRequirements(event.target.value)}
                  placeholder="e.g. AV support, signage"
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            {submitError ? (
              <div style={{ color: 'var(--danger)', fontSize: '0.95rem', fontWeight: 600 }}>
                {submitError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving || loading || !validMeetingRequest || !validHotel}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: saving || loading || !validMeetingRequest || !validHotel ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Creating booking…' : 'Create booking request'}
            </button>
          </div>
        </section>

        <aside style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ClipboardList size={20} />
              <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>Booking summary</h2>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected request</span>
                <strong>{selectedMeetingRequest ? `${selectedMeetingRequest.request_number} · ${selectedMeetingRequest.meeting_name}` : 'None selected'}</strong>
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected venue</span>
                <strong>{hotelOptions.find((option) => option.id === hotelId)?.name ?? 'None selected'}</strong>
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dates</span>
                <strong>{checkInDate ? formatDate(checkInDate) : '-'} → {checkOutDate ? formatDate(checkOutDate) : '-'}</strong>
              </div>
            </div>
          </section>

          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <MapPin size={20} />
              <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>Workflow notes</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              This booking will be created in REQUESTED status and can be reviewed by Admins for confirmation.
            </p>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={16} />
                <span>Meeting request linkage enforced</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={16} />
                <span>Booking visible in your bookings list</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {(requestsError || venuesError) && !loading ? (
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Unable to load required data</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {requestsError ?? venuesError}
          </p>
        </div>
      ) : null}

      {!loading && venues.length === 0 ? (
        <EmptyState
          title="No venues available"
          description="It looks like there are no venues to book right now. Please add venues or choose another request."
          icon={<Building2 size={48} style={{ color: 'var(--primary)' }} />}
        />
      ) : null}
    </div>
  );
}
