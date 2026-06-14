import { Link } from 'react-router-dom';
import { DollarSign, Calendar, Users, Building2, AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
import type { Invoice, InvoiceStatus, AuditStatus, VarianceSeverity } from '../features/invoices/types';
import { ROUTES } from '../routes/routeRegistry';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number | null | undefined) {
  return `₹${(amount ?? 0).toLocaleString('en-IN')}`;
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  RECEIVED: { label: 'Received', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  UNDER_VERIFICATION: { label: 'Under Verification', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  VERIFIED: { label: 'Verified', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  APPROVED: { label: 'Approved', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  PAID: { label: 'Paid', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
};

const auditConfig: Record<AuditStatus, { label: string; color: string; bgColor: string }> = {
  NOT_AUDITED: { label: 'Not Audited', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  PASSED: { label: 'Passed', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  FAILED: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  REVIEW_REQUIRED: { label: 'Review Required', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
};

const varianceConfig: Record<VarianceSeverity, { label: string; color: string; bgColor: string }> = {
  NONE: { label: 'No Variance', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  INFO: { label: 'Info', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  WARNING: { label: 'Warning', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  CRITICAL: { label: 'Critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
};

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const status = statusConfig[invoice.status] || statusConfig.RECEIVED;
  const auditStatus = invoice.audit_status ? auditConfig[invoice.audit_status] : null;
  const varianceSeverity = invoice.variance_severity ? varianceConfig[invoice.variance_severity] : null;

  const hotelName = invoice.bookings?.hotels?.hotel_name || 'Unknown Venue';
  const meetingName = invoice.bookings?.meeting_requests?.meeting_name || 'Unknown Event';
  const bookingRef = invoice.bookings?.booking_reference || 'N/A';
  const checkInDate = invoice.bookings?.check_in_date ? formatDate(invoice.bookings.check_in_date) : '-';
  const checkOutDate = invoice.bookings?.check_out_date ? formatDate(invoice.bookings.check_out_date) : '-';

  const isPending = ['RECEIVED', 'UNDER_VERIFICATION'].includes(invoice.status);
  const requiresReview = invoice.audit_status === 'REVIEW_REQUIRED' || invoice.variance_severity === 'CRITICAL';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: requiresReview ? '2px solid var(--warning)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {isPending && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          Pending
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{invoice.invoice_number}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {bookingRef}
            </div>
          </div>
          <span
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              background: status.bgColor,
              color: status.color,
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Venue and Event */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {hotelName}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {meetingName}
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.9rem' }}>
            {checkInDate} → {checkOutDate}
          </span>
        </div>

        {/* Financial Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Invoice Amount</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              {formatCurrency(invoice.invoice_amount)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Pax Billed</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} />
              {invoice.pax_billed ?? '—'}
            </div>
          </div>
        </div>

        {/* Audit and Variance Status */}
        {(auditStatus || varianceSeverity) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {auditStatus && (
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: auditStatus.bgColor,
                  color: auditStatus.color,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {auditStatus.label === 'Review Required' && <AlertTriangle size={12} />}
                {auditStatus.label === 'Passed' && <CheckCircle2 size={12} />}
                {auditStatus.label}
              </span>
            )}
            {varianceSeverity && varianceSeverity.label !== 'No Variance' && (
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: varianceSeverity.bgColor,
                  color: varianceSeverity.color,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {varianceSeverity.label === 'Critical' && <AlertTriangle size={12} />}
                {varianceSeverity.label === 'Warning' && <Clock size={12} />}
                {varianceSeverity.label}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <Link
          to={ROUTES.invoiceDetails.replace(':id', invoice.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: requiresReview ? '1px solid var(--warning)' : '1px solid var(--primary)',
            background: requiresReview ? 'var(--warning)' : 'var(--primary)',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = requiresReview ? '#d97706' : '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = requiresReview ? 'var(--warning)' : 'var(--primary)';
          }}
        >
          {requiresReview ? <AlertTriangle size={16} /> : <FileText size={16} />}
          Review Invoice
        </Link>
      </div>
    </div>
  );
}
