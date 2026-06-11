import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, ClipboardList, CheckCircle2, MapPin, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMeetingRequests } from '../features/meetings/hooks';
import { updateMeetingRequest } from '../features/meetings/meetingService';
import { useVenueDetails, useMyShortlists } from '../features/venues/hooks';
import { createBooking } from '../features/bookings/bookingService';
import type { BookingCreateInput } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { EmptyState } from '../components/EmptyState';

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

  useEffect(() => {
    if (!requestIdParam) {
      navigate(ROUTES.bookingNew.includes(':') ? ROUTES.meetingRequests : ROUTES.bookings);
    }
  }, [requestIdParam, navigate]);

  const [meetingRequestId, setMeetingRequestId] = useState<string>(requestIdParam ?? '');
  const [hotelId, setHotelId] = useState<string>(hotelIdParam ?? '');
  const [hallId, setHallId] = useState<string>('');
  const [singleOccupancyPax, setSingleOccupancyPax] = useState('0');
  const [doubleOccupancyPax, setDoubleOccupancyPax] = useState('0');
  const [tripleOccupancyPax, setTripleOccupancyPax] = useState('0');
  const [hallsBooked, setHallsBooked] = useState('0');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { requests, loading: requestsLoading, error: requestsError } = useMeetingRequests();
  const { venue: selectedHotel, loading: selectedHotelLoading } = useVenueDetails(hotelId ?? null);
  const { shortlists, loading: shortlistsLoading } = useMyShortlists(user?.id ?? null);

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

  const requestShortlists = useMemo(
    () => (meetingRequestId ? shortlists.filter((item) => item.request_id === meetingRequestId) : []),
    [shortlists, meetingRequestId]
  );

  useEffect(() => {
    if (meetingRequestId && requestShortlists.length === 1 && !hotelId) {
      setHotelId(requestShortlists[0].hotel_id);
    }
  }, [meetingRequestId, requestShortlists, hotelId]);

  useEffect(() => {
    if (!selectedMeetingRequest) return;
    if (!selectedHotel && requestShortlists.length === 1) {
      setHotelId(requestShortlists[0].hotel_id);
    }
  }, [requestShortlists, selectedHotel, selectedMeetingRequest]);

  const selectedHotelDetails = useMemo(() => {
    if (selectedHotel && selectedHotel.id === hotelId) return selectedHotel;
    return null;
  }, [hotelId, selectedHotel]);

  const validMeetingRequest = !!selectedMeetingRequest;
  const validHotel = !!hotelId && !!selectedHotelDetails;

  const availableHalls = selectedHotelDetails?.halls ?? [];
  const totalPax = selectedMeetingRequest?.expected_pax ?? 0;
  const allocatedPax = Number(singleOccupancyPax) + Number(doubleOccupancyPax) + Number(tripleOccupancyPax);
  const roomsBookedCount = useMemo(() => {
    const singleRooms = Math.max(0, Math.ceil(Number(singleOccupancyPax) / 1));
    const doubleRooms = Math.max(0, Math.ceil(Number(doubleOccupancyPax) / 2));
    const tripleRooms = Math.max(0, Math.ceil(Number(tripleOccupancyPax) / 3));
    return singleRooms + doubleRooms + tripleRooms;
  }, [singleOccupancyPax, doubleOccupancyPax, tripleOccupancyPax]);

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
    if (!selectedMeetingRequest) {
      setSubmitError('Unable to find the requested meeting.');
      return;
    }
    if (allocatedPax <= 0) {
      setSubmitError('Allocated pax must be greater than zero.');
      return;
    }
    if (totalPax > 0 && allocatedPax > totalPax) {
      setSubmitError('Allocated pax cannot exceed total expected pax.');
      return;
    }
    if (Number(hallsBooked) < 0) {
      setSubmitError('Halls booked must be zero or greater.');
      return;
    }

    const payload: BookingCreateInput = {
      meeting_request_id: meetingRequestId,
      hotel_id: hotelId,
      hall_id: hallId || null,
      check_in_date: selectedMeetingRequest.start_date,
      check_out_date: selectedMeetingRequest.end_date,
      rooms_booked: roomsBookedCount,
      halls_booked: Number(hallsBooked),
      expected_pax: totalPax || allocatedPax,
      special_requirements: specialRequirements.trim() || null,
    };

    setSaving(true);
    try {
      const booking = await createBooking(payload, user);
      await updateMeetingRequest(meetingRequestId, {}, 'BOOKED');
      if (booking?.id) {
        navigate(`${ROUTES.bookingDetails.replace(':id', booking.id)}?created=true`);
      } else {
        setSubmitError('Booking created successfully, but the ID was not returned. Please check the Bookings list.');
      }
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Unable to create booking.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const loading = requestsLoading || selectedHotelLoading || shortlistsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>Create Booking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Create a booking from a processed meeting request. Known values are shown as a summary, and only operational decisions are required.
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
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Meeting Request</span>
                <strong>{selectedMeetingRequest ? `${selectedMeetingRequest.request_number} — ${selectedMeetingRequest.meeting_name}` : 'None selected'}</strong>
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Venue</span>
                <strong>{selectedHotelDetails?.hotel_name ?? 'None selected'}</strong>
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Dates</span>
                <strong>{selectedMeetingRequest ? `${formatDate(selectedMeetingRequest.start_date)} ? ${formatDate(selectedMeetingRequest.end_date)}` : '-'}</strong>
              </div>
              {meetingRequestId && (
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ color: requestShortlists.length > 0 ? 'var(--text-success)' : 'var(--text-muted)' }}>
                    {requestShortlists.length > 0
                      ? `${requestShortlists.length} recommended venue${requestShortlists.length !== 1 ? 's' : ''} available for this request.`
                      : 'No venues recommended yet for this meeting request. Visit the venue explorer to recommend options.'}
                  </div>
                  {!hotelId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate(`${ROUTES.venueExplorer}?requestId=${meetingRequestId}`)}
                      style={{ width: 'fit-content', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                    >
                      Choose a recommended venue
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Single Occupancy Pax</label>
                <input
                  type="number"
                  min="0"
                  value={singleOccupancyPax}
                  onChange={(event) => setSingleOccupancyPax(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Double Occupancy Pax</label>
                <input
                  type="number"
                  min="0"
                  value={doubleOccupancyPax}
                  onChange={(event) => setDoubleOccupancyPax(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Triple Occupancy Pax</label>
                <input
                  type="number"
                  min="0"
                  value={tripleOccupancyPax}
                  onChange={(event) => setTripleOccupancyPax(event.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Allocated Pax / Total Pax</span>
                <strong>{allocatedPax} / {totalPax || allocatedPax}</strong>
              </div>
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
                <strong>{selectedHotelDetails?.hotel_name ?? 'None selected'}</strong>
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dates</span>
                <strong>{selectedMeetingRequest ? `${formatDate(selectedMeetingRequest.start_date)} ? ${formatDate(selectedMeetingRequest.end_date)}` : '-'}</strong>
              </div>
            </div>
          </section>

          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <MapPin size={20} />
              <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>Workflow notes</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              This booking is being created against a meeting request and should be linked to a recommended venue for this event.
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

      {requestsError && !loading ? (
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Unable to load required data</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {requestsError}
          </p>
        </div>
      ) : null}

      {!loading && !selectedHotelDetails ? (
        <EmptyState
          title="No venue selected"
          description="This booking needs a recommended venue linked to the meeting request. Please choose a venue from the request workflow."
          icon={<Building2 size={48} style={{ color: 'var(--primary)' }} />}
        />
      ) : null}
    </div>
  );
}
