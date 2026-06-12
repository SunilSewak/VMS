/**
 * Admin Processing Workspace
 * 
 * Primary operational workspace for Admin after a request enters processing stage.
 * Centralizes all downstream activities:
 * - Request Review
 * - Venue Evaluation
 * - Quotation Management
 * - Commercial Negotiation
 * - Booking Confirmation
 * - Invoice Verification
 * - Payment Tracking
 * 
 * Step 1: Workspace shell with tab navigation (placeholders for future modules)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, MapPin, DollarSign, 
  TrendingDown, CheckCircle, Receipt, CreditCard,
  CalendarDays, ClipboardList
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingById } from '../features/bookings/bookingService';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type TabId = 'overview' | 'venue-evaluation' | 'quotations' | 'commercials' | 'booking' | 'invoice' | 'payment';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function AdminProcessingWorkspace() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate(ROUTES.bookings);
    }
  }, [user, isAdmin, navigate]);

  // Redirect immediately if there is no usable ID
  useEffect(() => {
    if (!id || id === 'undefined' || id === ':id') {
      navigate(ROUTES.bookings);
    }
  }, [id, navigate]);

  // Load booking data
  useEffect(() => {
    if (!id || id === 'undefined' || id === ':id') return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getBookingById(id);
        if (mounted) {
          setBooking(data);
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

  // Tab definitions
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FileText size={16} />,
      description: 'Request and event information summary',
    },
    {
      id: 'venue-evaluation',
      label: 'Venue Evaluation',
      icon: <MapPin size={16} />,
      description: 'Venue comparison and selection',
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: <Receipt size={16} />,
      description: 'Quotation collection and comparison',
    },
    {
      id: 'commercials',
      label: 'Commercials',
      icon: <TrendingDown size={16} />,
      description: 'Negotiation and savings tracking',
    },
    {
      id: 'booking',
      label: 'Booking',
      icon: <CheckCircle size={16} />,
      description: 'Booking confirmation activities',
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: <DollarSign size={16} />,
      description: 'Invoice verification activities',
    },
    {
      id: 'payment',
      label: 'Payment',
      icon: <CreditCard size={16} />,
      description: 'Payment tracking',
    },
  ];

  // Render loading/error states
  if (!id || id === 'undefined' || id === ':id') return null;

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading workspace...
      </div>
    );
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        gap: 'var(--space-3)', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: 'var(--font-xl)', 
            fontWeight: 700, 
            marginBottom: 'var(--space-1)' 
          }}>
            Admin Processing Workspace
          </h1>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: 'var(--font-sm)', 
            margin: 0 
          }}>
            Operational center for {booking.meeting_requests?.meeting_name || 'this request'} • {booking.hotels?.hotel_name || 'Venue'} • {formatDate(booking.check_in_date).split(',')[0]}
          </p>
        </div>

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
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB NAVIGATION
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border)',
        overflowX: 'auto',
        flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '1rem 1.5rem',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              marginBottom: '-2px',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      
      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: OVERVIEW
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {/* Event Summary */}
          <section style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ 
              fontSize: 'var(--font-lg)', 
              fontWeight: 700, 
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
              Event Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                  Meeting Name
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.meeting_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                  Request Number
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.request_number || booking.meeting_request_id}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                  Division
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.divisions?.division_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                  Meeting Type
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.meeting_types?.meeting_type_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                  City
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.cities?.city_name || booking.hotels?.city_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                  Zone
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.zone || '—'}
                </div>
              </div>
            </div>
          </section>

          {/* Venue and Dates */}
          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <section style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>
                  Venue Information
                </h4>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Hotel</div>
                  <div style={{ fontWeight: 600 }}>{booking.hotels?.hotel_name || booking.hotel_id}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Hall</div>
                  <div style={{ fontWeight: 600 }}>{booking.halls?.hall_name || booking.hall_id || '—'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>City</div>
                  <div style={{ fontWeight: 600 }}>{booking.hotels?.city_name || '—'}</div>
                </div>
              </div>
            </section>

            <section style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}>
                <CalendarDays size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600 }}>
                  Booking Timeline
                </h4>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Check In</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(booking.check_in_date)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Check Out</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(booking.check_out_date)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Status</div>
                  <div style={{ fontWeight: 600 }}>{booking.status.replace('_', ' ')}</div>
                </div>
              </div>
            </section>
          </div>

          {/* Participant Information */}
          <section style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-md)', fontWeight: 600 }}>
              Participant Details
            </h4>
            <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Expected Pax</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-lg)' }}>{booking.expected_pax || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Guaranteed Pax</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-lg)', color: 'var(--primary)' }}>
                  {booking.meeting_requests?.guaranteed_pax || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Rooms Booked</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-lg)' }}>{booking.rooms_booked || '—'}</div>
              </div>
            </div>
          </section>

          {/* Audit Trail */}
          <section style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-md)', fontWeight: 600 }}>
              Audit Trail
            </h4>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Created</div>
                <div style={{ fontWeight: 600 }}>
                  {formatDate(booking.created_at)}{booking.created_by ? ` • ${booking.created_by}` : ''}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Last Updated</div>
                <div style={{ fontWeight: 600 }}>
                  {formatDate(booking.updated_at)}{booking.updated_by ? ` • ${booking.updated_by}` : ''}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Confirmed</div>
                <div style={{ fontWeight: 600 }}>
                  {formatDate(booking.confirmed_at)}{booking.confirmed_by ? ` • ${booking.confirmed_by}` : ''}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: VENUE EVALUATION (Placeholder)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'venue-evaluation' && (
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          textAlign: 'center',
        }}>
          <MapPin size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
            Venue Evaluation Module
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)', maxWidth: '500px', margin: '0 auto' }}>
            Coming in next step. This module will handle venue comparison, scoring, and selection.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: QUOTATIONS (Placeholder)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'quotations' && (
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          textAlign: 'center',
        }}>
          <Receipt size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
            Quotation Management Module
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)', maxWidth: '500px', margin: '0 auto' }}>
            Coming in next step. This module will handle quotation collection, comparison, and approval.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: COMMERCIALS (Placeholder)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'commercials' && (
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          textAlign: 'center',
        }}>
          <TrendingDown size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
            Commercial Negotiation Module
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)', maxWidth: '500px', margin: '0 auto' }}>
            Coming in next step. This module will handle commercial negotiations and savings tracking.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 5: BOOKING (Placeholder)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'booking' && (
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          textAlign: 'center',
        }}>
          <CheckCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
            Booking Management Module
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)', maxWidth: '500px', margin: '0 auto' }}>
            Coming in next step. This module will handle booking confirmation and documentation.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 6: INVOICE (Placeholder)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'invoice' && (
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          textAlign: 'center',
        }}>
          <DollarSign size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
            Invoice Verification Module
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)', maxWidth: '500px', margin: '0 auto' }}>
            Coming in next step. This module will handle invoice uploads, verification, and approval.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 7: PAYMENT (Placeholder)
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'payment' && (
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          textAlign: 'center',
        }}>
          <CreditCard size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
            Payment Tracking Module
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-md)', maxWidth: '500px', margin: '0 auto' }}>
            Coming in next step. This module will handle payment tracking and reconciliation.
          </p>
        </div>
      )}
    </div>
  );
}
