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
  CalendarDays, ClipboardList, Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingById } from '../features/bookings/bookingService';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';
import { WorkflowStatusTracker, mapBookingStatusToWorkflowStage } from '../components/WorkflowStatusTracker';
import { OperationalKpiCards, deriveKpisFromBooking } from '../components/OperationalKpiCards';
import { OwnershipAuditPanel } from '../components/OwnershipAuditPanel';
import { NextActionCard } from '../components/NextActionCard';

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
          TAB 1: OVERVIEW - OPERATIONAL DASHBOARD
      ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
          {/* Section 1: Event Summary Card */}
          <section style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)',
            border: '2px solid var(--border)',
          }}>
            <h3 style={{ 
              fontSize: 'var(--font-xl)', 
              fontWeight: 700, 
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <CalendarDays size={24} style={{ color: 'var(--primary)' }} />
              Event Summary
            </h3>
            
            {/* Event Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  MEETING NAME
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.meeting_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  DIVISION
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.divisions?.division_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  MEETING TYPE
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.meeting_types?.meeting_type_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  CITY
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.cities?.city_name || booking.hotels?.city_name || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  START DATE
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {formatDate(booking.meeting_requests?.start_date).split(',')[0]}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  END DATE
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {formatDate(booking.meeting_requests?.end_date).split(',')[0]}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '2px', background: 'var(--border)', margin: 'var(--space-4) 0' }} />

            {/* Attendance & Requirements */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  EXPECTED PAX
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>
                  {booking.expected_pax || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  GUARANTEED PAX
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)', color: 'var(--primary)' }}>
                  {booking.meeting_requests?.guaranteed_pax || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  ACCOMMODATION
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.residential_flag ? 'Residential' : 'Non-Residential'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  ROOMS REQUIRED
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.rooms_booked || booking.meeting_requests?.rooms_required || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
                  HALLS REQUIRED
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  {booking.meeting_requests?.halls_required || '—'}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Workflow Status Tracker */}
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
            }}>
              Workflow Progress
            </h3>
            <WorkflowStatusTracker 
              currentStage={mapBookingStatusToWorkflowStage(
                booking.status,
                false, // hasQuotations - TODO: Add from quotations table
                false, // isCommercialApproved - TODO: Add from commercials table
                !!booking.invoice_status && booking.invoice_status !== 'PENDING',
                booking.invoice_status === 'VERIFIED' || booking.invoice_status === 'APPROVED',
                booking.payment_status === 'COMPLETED'
              )}
            />
          </section>

          {/* Section 3: Operational KPI Cards */}
          <OperationalKpiCards {...deriveKpisFromBooking(booking)} />

          {/* Section 4 & 5: Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {/* Section 4: Ownership & Audit Panel */}
            <OwnershipAuditPanel
              requestOwner={booking.meeting_requests?.created_by ? {
                name: booking.meeting_requests.created_by,
                division: booking.meeting_requests.divisions?.division_name || 'Unknown Division',
              } : undefined}
              processingOwner={booking.confirmed_by ? {
                name: booking.confirmed_by,
              } : undefined}
              audit={{
                createdBy: booking.created_by || undefined,
                createdAt: booking.created_at,
                updatedBy: booking.updated_by || undefined,
                updatedAt: booking.updated_at || undefined,
              }}
            />

            {/* Venue Info Card */}
            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}>
              <h4 style={{
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <Building2 size={18} style={{ color: 'var(--primary)' }} />
                Venue Details
              </h4>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: '4px', fontWeight: 600 }}>
                    HOTEL
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {booking.hotels?.hotel_name || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: '4px', fontWeight: 600 }}>
                    HALL
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {booking.halls?.hall_name || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: '4px', fontWeight: 600 }}>
                    CHECK-IN
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {formatDate(booking.check_in_date)}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: '4px', fontWeight: 600 }}>
                    CHECK-OUT
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {formatDate(booking.check_out_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Next Action Card */}
          <NextActionCard 
            currentStage={mapBookingStatusToWorkflowStage(
              booking.status,
              false,
              false,
              !!booking.invoice_status && booking.invoice_status !== 'PENDING',
              booking.invoice_status === 'VERIFIED' || booking.invoice_status === 'APPROVED',
              booking.payment_status === 'COMPLETED'
            )}
            bookingStatus={booking.status}
          />
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
