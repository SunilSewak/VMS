import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MeetingRequest } from '../features/meetings/types';
import { updateMeetingRequest } from '../features/meetings/meetingService';
import { fetchShortlistsForRequest } from '../features/venues/api';
import { VenueShortlist } from '../features/venues/types';
import { getBookings, createBooking } from '../features/bookings/bookingService';
import { Booking, BookingCreateInput } from '../features/bookings/types';
import { Building2, Calendar, Users, MapPin, CheckCircle2, AlertCircle, ArrowRight, Loader2, Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeRegistry';

interface BookingWorkspaceTabProps {
  request: MeetingRequest;
  onProceedToInvoice: () => void;
}

export function BookingWorkspaceTab({ request, onProceedToInvoice }: BookingWorkspaceTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [shortlists, setShortlists] = useState<VenueShortlist[]>([]);
  
  // Form State
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState(request.start_date);
  const [checkOutDate, setCheckOutDate] = useState(request.end_date);
  const [roomsBooked, setRoomsBooked] = useState(request.rooms_required?.toString() || '0');
  const [hallsBooked, setHallsBooked] = useState(request.halls_required?.toString() || '1');
  const [expectedPax, setExpectedPax] = useState(request.expected_pax?.toString() || '0');
  const [specialRequirements, setSpecialRequirements] = useState('');

  useEffect(() => {
    loadData();
  }, [request.id]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Check if a booking already exists for this request
      const bookings = await getBookings(user, { meetingRequestId: request.id });
      if (bookings && bookings.length > 0) {
        setExistingBooking(bookings[0]);
      } else {
        // Fetch shortlists if no booking exists
        const shortlistsData = await fetchShortlistsForRequest(request.id!);
        setShortlists(shortlistsData);
        if (shortlistsData.length === 1) {
          setSelectedHotelId(shortlistsData[0].hotel_id);
        }
      }
    } catch (err) {
      console.error('Failed to load booking data:', err);
      setError('Failed to load booking data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!user) return;
    if (!selectedHotelId) {
      setError('Please select a venue from the shortlist.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const payload: BookingCreateInput = {
        meeting_request_id: request.id!,
        hotel_id: selectedHotelId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        rooms_booked: parseInt(roomsBooked, 10) || 0,
        halls_booked: parseInt(hallsBooked, 10) || 0,
        expected_pax: parseInt(expectedPax, 10) || 0,
        special_requirements: specialRequirements || null,
      };

      const booking = await createBooking(payload, user);
      await updateMeetingRequest(request.id!, {}, 'BOOKED');
      
      setExistingBooking(booking);
      
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      setError(err.message || 'Failed to create booking.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-8)' }}>
        <Loader2 className="spin" size={24} color="var(--primary)" />
        <span style={{ marginLeft: 'var(--space-2)' }}>Loading booking details...</span>
      </div>
    );
  }

  // View: Booking Exists
  if (existingBooking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ 
          background: 'var(--success-light, #ecfdf5)', 
          border: '1px solid var(--success, #10b981)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-4)'
        }}>
          <CheckCircle2 size={24} color="var(--success, #10b981)" style={{ marginTop: '2px' }} />
          <div>
            <h3 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--success-dark, #065f46)' }}>Booking Confirmed</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              A booking record has been successfully created for this meeting request.
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: 'var(--space-5)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ margin: '0 0 var(--space-4) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Building2 size={20} color="var(--primary)" />
            Booking Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reference</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-lg)', color: 'var(--primary)' }}>
                {existingBooking.booking_reference}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Venue</div>
              <div style={{ fontWeight: 600 }}>{existingBooking.hotels?.hotel_name || 'Selected Venue'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dates</div>
              <div style={{ fontWeight: 500 }}>
                {existingBooking.check_in_date} to {existingBooking.check_out_date}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
              <div style={{ 
                display: 'inline-block',
                padding: '2px 8px',
                background: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                borderRadius: '12px',
                fontSize: 'var(--font-xs)',
                fontWeight: 600
              }}>
                {existingBooking.status}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (existingBooking?.id) {
                navigate(`${ROUTES.invoiceUpload}?bookingId=${existingBooking.id}`);
              } else {
                onProceedToInvoice();
              }
            }} 
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            Proceed to Invoice Processing <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // View: No Booking Yet
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      
      {shortlists.length === 0 ? (
        <div style={{ 
          padding: 'var(--space-8)', 
          textAlign: 'center', 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border)' 
        }}>
          <Hotel size={48} color="var(--text-muted)" style={{ margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ margin: '0 0 var(--space-2) 0' }}>No Venues Shortlisted</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Please evaluate and shortlist at least one venue in the Venue Evaluation tab before creating a booking.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-5)' }}>
          
          {/* Main Form */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-lg)' }}>Create Booking Record</h3>
            
            {error && (
              <div style={{ 
                padding: 'var(--space-3)', 
                background: '#fef2f2', 
                border: '1px solid #fca5a5', 
                color: '#ef4444', 
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div className="form-group">
                <label>Select Venue from Shortlist</label>
                <select 
                  className="input" 
                  value={selectedHotelId} 
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                >
                  <option value="">-- Select Venue --</option>
                  {shortlists.map(sl => (
                    <option key={sl.hotel_id} value={sl.hotel_id}>
                      {sl.hotels?.hotel_name} ({sl.hotels?.city?.city_name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input type="date" className="input" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Check-out Date</label>
                  <input type="date" className="input" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label>Expected Pax</label>
                  <input type="number" className="input" value={expectedPax} onChange={(e) => setExpectedPax(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Rooms Booked</label>
                  <input type="number" className="input" value={roomsBooked} onChange={(e) => setRoomsBooked(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Halls Booked</label>
                  <input type="number" className="input" value={hallsBooked} onChange={(e) => setHallsBooked(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Special Requirements</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  value={specialRequirements} 
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Any special arrangements or requests..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCreateBooking} 
                  disabled={saving || !selectedHotelId}
                >
                  {saving ? <><Loader2 className="spin" size={16} /> Creating...</> : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
             <div style={{
              background: 'var(--background)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 'var(--space-4)'
            }}>
              <h4 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-md)' }}>Meeting Reference</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  <strong>Request ID:</strong> {request.request_number}
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  <strong>Meeting:</strong> {request.meeting_name}
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  <strong>Original Pax:</strong> {request.expected_pax}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
