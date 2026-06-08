import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, DollarSign, Users, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInvoiceById } from '../features/invoices/invoiceService';
import { validateInvoicePackage, getValidationSummary } from '../features/invoices/invoiceValidationService';
import { getBookingById } from '../features/bookings/bookingService';
import type { Invoice, InvoiceValidationCheck } from '../features/invoices/types';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const statusBadge = (status: string) => {
  const color =
    status === 'APPROVED'
      ? 'var(--success)'
      : status === 'REJECTED'
      ? 'var(--danger)'
      : status === 'VERIFIED'
      ? 'var(--warning)'
      : 'var(--primary)';

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        backgroundColor: color + '10',
        color,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      {status}
    </span>
  );
};

export function InvoiceDetails() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [validationChecks, setValidationChecks] = useState<InvoiceValidationCheck[]>([]);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const successMessage = searchParams.get('created') ? 'Invoice created successfully.' : null;
  const canApprove = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (!id) {
      setError('Invoice ID is missing.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const invoiceData = await getInvoiceById(id);
        if (mounted) {
          setInvoice(invoiceData);
          
          // Load booking details
          try {
            const bookingData = await getBookingById(invoiceData.booking_id);
            setBooking(bookingData);
          } catch {
            // Booking may not exist
          }

          // Run validation engine
          const validationResult = await validateInvoicePackage(invoiceData);
          setValidationChecks(validationResult.checks);
          setValidationSummary(getValidationSummary(validationResult));
        }
      } catch (loadError) {
        setError('Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading invoice details...</div>;
  }

  if (error || !invoice) {
    return (
      <EmptyState
        title={error ? 'Unable to load invoice' : 'Invoice not found'}
        description={error ?? 'Please go back to the invoices list and try again.'}
        icon={<AlertCircle size={48} style={{ color: 'var(--primary)' }} />}
      />
    );
  }

  const criticalVariances = validationChecks.filter((v) => v.severity === 'CRITICAL');
  const hasMaterialVariance = criticalVariances.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Success Message */}
      {successMessage ? (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: 'var(--success)',
          }}
        >
          <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <span style={{ fontWeight: 500 }}>{successMessage}</span>
        </div>
      ) : null}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Link to={ROUTES.invoices} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>Invoice {invoice.invoice_number}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>
            Status: {statusBadge(invoice.status)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {canApprove && invoice.status === 'VERIFIED' ? (
            <button
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--success)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Approve Invoice
            </button>
          ) : null}
        </div>
      </div>

      {/* Variance Alert */}
      {hasMaterialVariance ? (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <div style={{ fontWeight: 700 }}>Material variance detected</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {criticalVariances.length} critical variance{criticalVariances.length > 1 ? 's' : ''} found. Review before approval.
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 320px' }}>
        <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {/* Invoice Information */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <DollarSign size={18} /> Invoice Information
            </h2>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Invoice Number</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{invoice.invoice_number}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Invoice Date</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatDate(invoice.invoice_date)}</div>
                </div>
              </div>

              <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'grid', gap: '1rem', fontSize: 'var(--font-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Room Charges</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.room_charges)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Hall Charges</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.hall_charges)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Food Charges</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.food_charges)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tax Amount</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total Amount</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(invoice.invoice_amount)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pax Billed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} /> {invoice.pax_billed}
                  </div>
                </div>
                {invoice.remarks ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Remarks</div>
                    <div style={{ fontSize: '0.95rem' }}>{invoice.remarks}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Validation Panel */}
          {validationSummary ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={18} /> Validation Summary
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Checks</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{validationSummary.totalChecks}</div>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Passed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{validationSummary.passed}</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>Warnings</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{validationSummary.warnings}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>Critical</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{validationSummary.critical}</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Validation Checks Grid */}
          {validationChecks.length > 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={18} /> Validation Checks
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>Check</th>
                      <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected</th>
                      <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actual</th>
                      <th style={{ textAlign: 'center', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Severity</th>
                      <th style={{ textAlign: 'center', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationChecks.map((check) => (
                      <tr key={check.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{check.check_type}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{check.description}</div>
                        </td>
                        <td style={{ textAlign: 'right', padding: '1rem 1rem', fontSize: '0.9rem' }}>
                          {typeof check.expected_value === 'number' ? check.expected_value.toLocaleString('en-IN') : check.expected_value}
                        </td>
                        <td style={{ textAlign: 'right', padding: '1rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                          {typeof check.actual_value === 'number' ? check.actual_value.toLocaleString('en-IN') : check.actual_value}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1rem 1rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              backgroundColor:
                                check.severity === 'CRITICAL'
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : check.severity === 'WARNING'
                                  ? 'rgba(245, 158, 11, 0.1)'
                                  : 'rgba(59, 130, 246, 0.1)',
                              color:
                                check.severity === 'CRITICAL'
                                  ? 'var(--danger)'
                                  : check.severity === 'WARNING'
                                  ? 'var(--warning)'
                                  : 'var(--primary)',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            {check.severity}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '1rem 1rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              backgroundColor: check.status === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: check.status === 'PASS' ? 'var(--success)' : 'var(--danger)',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            {check.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>CURRENT STATUS</h3>
            <div style={{ marginBottom: 'var(--space-3)' }}>{statusBadge(invoice.status)}</div>

            {invoice.verified_at ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  ✓ Verified on {formatDate(invoice.verified_at)}
                </div>
              </div>
            ) : null}

            {invoice.approved_at ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                <div>✓ Approved on {formatDate(invoice.approved_at)}</div>
              </div>
            ) : null}

            {invoice.rejection_reason ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', padding: 'var(--space-2)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Rejection Reason</div>
                <div>{invoice.rejection_reason}</div>
              </div>
            ) : null}
          </div>

          {/* Booking Link */}
          {booking ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>LINKED BOOKING</h3>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Link to={ROUTES.bookingDetails.replace(':id', booking.id)} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  {booking.booking_reference}
                </Link>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>{formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</div>
                <div>{booking.expected_pax} pax</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
