import { TrendingUp, Zap } from 'lucide-react';
import type { InvoiceValidationCheck } from '../../features/invoices/types';

const VALIDATION_LABELS: Record<string, string> = {
  'CATEGORY_RECONCILIATION': 'Category Totals Match',
  'GRAND_TOTAL_RECONCILIATION': 'Grand Total Match',
  'DATE_VARIANCE': 'Invoice Date Verification',
  'NIGHT_VARIANCE': 'Nights Verification',
  'HOTEL_VERIFICATION': 'Hotel Verification',
  'HALL_MISMATCH': 'Hall Booking Verification',
  'PAX_VARIANCE': 'Pax Verification',
  'ROOM_VARIANCE': 'Room Verification',
  'ROOM_RATE_VARIANCE': 'Room Rate Verification',
  'FOOD_VARIANCE': 'Food Charges Verification',
  'HALL_CHARGE_VARIANCE': 'Hall Charges Verification',
  'GST_VARIANCE': 'GST Verification',
  'TOTAL_VARIANCE': 'Total Amount Match'
};

export function InvoiceValidationTab({
  validationChecks,
  validationSummary
}: {
  validationChecks: InvoiceValidationCheck[];
  validationSummary: any;
}) {
  return (
    <>
      {validationSummary ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={18} /> Validation Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Checks</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{validationSummary.totalChecks}</div>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Passed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{validationSummary.passedChecks}</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>Warnings</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{validationSummary.warningChecks}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>Critical</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{validationSummary.failedChecks}</div>
            </div>
          </div>
        </div>
      ) : null}

      {validationChecks.length > 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp size={18} /> Validation Checks
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>Verification Point</th>
                  <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected</th>
                  <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actual</th>
                  <th style={{ textAlign: 'center', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {validationChecks.map((check) => {
                  const businessLabel = VALIDATION_LABELS[check.check_type] || check.check_type;
                  return (
                    <tr key={check.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{businessLabel}</div>
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
                            backgroundColor: check.status === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : check.status === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: check.status === 'PASS' ? 'var(--success)' : check.status === 'WARNING' ? 'var(--warning)' : 'var(--danger)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          {check.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
