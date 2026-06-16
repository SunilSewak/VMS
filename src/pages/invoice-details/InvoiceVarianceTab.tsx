import { TrendingUp, AlertCircle } from 'lucide-react';
import type { InvoiceVarianceRecord } from '../../features/invoices/types';

function formatCurrency(amount: number | null | undefined) {
  return `₹${(amount ?? 0).toLocaleString('en-IN')}`;
}

const CATEGORY_VARIANCE_TYPES = ['ROOM_VARIANCE', 'FOOD_VARIANCE', 'NRC_VARIANCE', 'HALL_VARIANCE'];

const SEVERITY_COLOR: Record<string, string> = {
  PASS: 'var(--success)',
  INFO: 'var(--primary)',
  REVIEW_REQUIRED: 'var(--warning)',
  WARNING: 'var(--warning)',
  CRITICAL: 'var(--danger)',
};

export function InvoiceVarianceTab({
  commercialVariances,
  hasRunAudit,
  runningAudit,
  onRunAudit,
  canManageWorkflow
}: {
  commercialVariances: InvoiceVarianceRecord[];
  hasRunAudit: boolean;
  runningAudit: boolean;
  onRunAudit: () => void;
  canManageWorkflow: boolean;
}) {
  if (!hasRunAudit && commercialVariances.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={18} /> Variance Analysis
        </h2>
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Commercial audit has not been run for this invoice yet.</p>
          {canManageWorkflow && (
            <button
              onClick={onRunAudit}
              disabled={runningAudit}
              style={{
                padding: '0.85rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: runningAudit ? 'not-allowed' : 'pointer',
              }}
            >
              {runningAudit ? 'Running...' : 'Run Variance Analysis'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Use the actual variance records
  const displayVariances = commercialVariances.filter(v => CATEGORY_VARIANCE_TYPES.includes(v.variance_type) || v.variance_type === 'TOTAL_VARIANCE');

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={18} /> Variance Analysis
        </h2>
        {canManageWorkflow && (
          <button
            onClick={onRunAudit}
            disabled={runningAudit}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary)',
              background: 'transparent',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: runningAudit ? 'not-allowed' : 'pointer',
            }}
          >
            {runningAudit ? 'Re-running...' : 'Re-run Analysis'}
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>Category</th>
              <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected</th>
              <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actual</th>
              <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {displayVariances.map((v) => {
              const variance = v.variance_amount ?? 0;
              const isTotal = v.variance_type === 'TOTAL_VARIANCE';
              const nameMap: Record<string, string> = {
                'ROOM_VARIANCE': 'Room Charges',
                'FOOD_VARIANCE': 'Food Charges',
                'NRC_VARIANCE': 'Tax / Other',
                'HALL_VARIANCE': 'Hall Charges',
                'TOTAL_VARIANCE': 'Grand Total'
              };
              
              return (
                <tr key={v.id} style={{ borderBottom: isTotal ? 'none' : '1px solid var(--border)', background: isTotal ? 'var(--background)' : 'transparent' }}>
                  <td style={{ padding: '1rem 0', fontWeight: isTotal ? 700 : 500, paddingLeft: isTotal ? '1rem' : '0' }}>{nameMap[v.variance_type] || v.variance_type}</td>
                  <td style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: isTotal ? 700 : 500 }}>{formatCurrency(v.expected_amount)}</td>
                  <td style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: isTotal ? 700 : 600 }}>{formatCurrency(v.actual_amount)}</td>
                  <td style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: Math.abs(variance) > 1 ? 'var(--danger)' : 'var(--success)' }}>
                    {formatCurrency(variance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
