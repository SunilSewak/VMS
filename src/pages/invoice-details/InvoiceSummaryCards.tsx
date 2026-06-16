import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Invoice } from '../../features/invoices/types';
import type { Booking } from '../../features/bookings/types';

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

export function InvoiceSummaryCards({
  invoice,
  booking,
  validationSummary,
}: {
  invoice: Invoice;
  booking: Booking | null;
  validationSummary: any;
}) {
  const cgst = invoice.cgst_amount;
  const sgst = invoice.sgst_amount;
  const igst = invoice.igst_amount;
  const hasGstSplit = cgst != null || sgst != null || igst != null;
  const taxTotal = hasGstSplit
    ? (cgst ?? 0) + (sgst ?? 0) + (igst ?? 0)
    : (invoice.tax_amount ?? 0);
  const subtotal = invoice.subtotal_amount
    ?? ((invoice.room_charges ?? 0) + (invoice.hall_charges ?? 0) + (invoice.food_charges ?? 0) + (invoice.other_charges ?? 0));
  const grandTotal = invoice.invoice_amount ?? (subtotal + taxTotal);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-4)'
    }}>
      {/* Verification Summary Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> VERIFICATION SUMMARY
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{validationSummary?.healthScore ?? '—'}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{validationSummary?.auditOutcome ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Checks Passed</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
              {validationSummary?.passedChecks ?? 0} / {validationSummary?.totalChecks ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Critical Variances</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>{validationSummary?.failedChecks ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Booking Summary Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} /> BOOKING SUMMARY
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booking Number</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{booking?.booking_reference ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hotel</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{booking?.hotels?.hotel_name ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check In / Out</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {formatDate(booking?.check_in_date)}<br/>{formatDate(booking?.check_out_date)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Pax</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{booking?.expected_pax ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Commercial Summary Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> COMMERCIAL SUMMARY
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subtotal</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(subtotal)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tax</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(taxTotal)}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(grandTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
