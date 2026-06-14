import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Eye,
  FileText, DollarSign, Home,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingById } from '../features/bookings/bookingService';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadge(status: string | null | undefined) {
  if (!status) return { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' };
  
  switch (status) {
    case 'COMPLETED':
      return { label: 'Complete', color: '#10b981', bgColor: '#d1fae5' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', color: '#3b82f6', bgColor: '#dbeafe' };
    case 'APPROVED':
      return { label: 'Approved', color: '#10b981', bgColor: '#d1fae5' };
    case 'VERIFIED':
      return { label: 'Verified', color: '#10b981', bgColor: '#d1fae5' };
    case 'PAID':
      return { label: 'Paid', color: '#10b981', bgColor: '#d1fae5' };
    case 'PARTIAL':
      return { label: 'Partial', color: '#f59e0b', bgColor: '#fef3c7' };
    default:
      return { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' };
  }
}

export function BookingWorkspace() {
  const { user } = useAuth();
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'rooming' | 'invoice' | 'payment' | 'documents'>('overview');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Failed to load booking:', err);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId]);

  if (!user) return null;
  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading workspace...</div>;
  if (!booking) return <div style={{ padding: '4rem', textAlign: 'center' }}>Booking not found</div>;

  const meetingName = booking.meeting_requests?.meeting_name ?? 'Meeting';
  const requestNumber = booking.meeting_requests?.request_number ?? 'N/A';
  const venueName = booking.hotels?.hotel_name ?? 'Venue';
  const checkInDate = formatDate(booking.check_in_date);
  const checkOutDate = formatDate(booking.check_out_date);
  const expectedPax = booking.expected_pax || 0;
  const roomsBooked = booking.rooms_booked || 0;

  const roomingBadge = getStatusBadge(booking.rooming_status);
  const invoiceBadge = getStatusBadge(booking.invoice_status);
  const paymentBadge = getStatusBadge(booking.payment_status);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: <FileText size={16} /> },
    { id: 'rooming' as const, label: 'Rooming', icon: <Home size={16} /> },
    { id: 'invoice' as const, label: 'Invoice', icon: <DollarSign size={16} /> },
    { id: 'payment' as const, label: 'Payment', icon: <DollarSign size={16} /> },
    { id: 'documents' as const, label: 'Documents', icon: <FileText size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-2)' }}>
            <button
              onClick={() => navigate(ROUTES.bookings)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', display: 'flex', alignItems: 'center'
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>
              {meetingName}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', margin: 0 }}>
            Operational hub for {venueName} • {checkInDate} to {checkOutDate}
          </p>
        </div>
      </div>

      {/* ── Quick Status ────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)'
      }}>
        <div style={{ background: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-2)' }}>
            <Home size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Rooming</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 'var(--font-lg)' }}>{getStatusBadge(booking.rooming_status).label}</strong>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
              background: roomingBadge.bgColor, color: roomingBadge.color
            }}>
              {roomingBadge.label}
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-2)' }}>
            <DollarSign size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Invoice</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 'var(--font-lg)' }}>{getStatusBadge(booking.invoice_status).label}</strong>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
              background: invoiceBadge.bgColor, color: invoiceBadge.color
            }}>
              {invoiceBadge.label}
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-2)' }}>
            <DollarSign size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Payment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 'var(--font-lg)' }}>{getStatusBadge(booking.payment_status).label}</strong>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
              background: paymentBadge.bgColor, color: paymentBadge.color
            }}>
              {paymentBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '1rem 1.5rem', fontSize: 'var(--font-sm)', fontWeight: 600,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'color 0.2s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SECTION A: Event Summary ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Event Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Meeting Name</span>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0' }}>{meetingName}</p>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Request Number</span>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0' }}>{requestNumber}</p>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Venue</span>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0' }}>{venueName}</p>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Dates</span>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0' }}>{checkInDate} → {checkOutDate}</p>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Expected Pax</span>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0' }}>{expectedPax}</p>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Rooms Booked</span>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0' }}>{roomsBooked}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION B: Rooming ──────────────────────────────────────────────── */}
      {activeTab === 'rooming' && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Accommodation / Rooming</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
            Manage occupancy-based room allocation. System auto-calculates room counts.
          </p>
          <button
            onClick={() => navigate(ROUTES.roomingDetails.replace(':id', bookingId!))}
            className="btn btn-primary"
          >
            <Home size={16} />
            Manage Rooming
          </button>
        </div>
      )}

      {/* ── SECTION C: Invoice Management ──────────────────────────────────────────────── */}
      {activeTab === 'invoice' && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Invoice Management</h3>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-4)', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>Invoice Status</p>
                  <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, margin: 'var(--space-1) 0 0' }}>
                    {getStatusBadge(booking.invoice_status).label}
                  </p>
                </div>
                <span style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 700,
                  background: invoiceBadge.bgColor, color: invoiceBadge.color
                }}>
                  {invoiceBadge.label}
                </span>
              </div>
              {booking.invoice_status === 'PENDING' && (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => navigate(`${ROUTES.invoiceUpload}?bookingId=${booking.id}`)}
                >
                  <Upload size={16} />
                  Upload Invoice
                </button>
              )}
              {booking.invoice_status && booking.invoice_status !== 'PENDING' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }}>
                    <Eye size={16} />
                    View Invoice
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }}>
                    <Upload size={16} />
                    Replace Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION D: Payment Management ──────────────────────────────────────────────── */}
      {activeTab === 'payment' && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Payment Management</h3>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-4)', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>Payment Status</p>
                  <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, margin: 'var(--space-1) 0 0' }}>
                    {getStatusBadge(booking.payment_status).label}
                  </p>
                </div>
                <span style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 700,
                  background: paymentBadge.bgColor, color: paymentBadge.color
                }}>
                  {paymentBadge.label}
                </span>
              </div>
              {booking.payment_status !== 'COMPLETED' && (
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  <DollarSign size={16} />
                  Record Payment
                </button>
              )}
              {booking.payment_status === 'COMPLETED' && (
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  <Eye size={16} />
                  View Payment History
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION E: Documents ──────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Documents</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Store and manage all documents related to this booking (contracts, proposals, invoices, supporting docs).
          </p>
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>No documents uploaded yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
