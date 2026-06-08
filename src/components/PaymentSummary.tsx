import { ArrowDownRight, ArrowUpRight, Clock3, DollarSign, ShieldCheck } from 'lucide-react';
import type { PaymentSummary as PaymentSummaryModel } from '../features/payments/types';

interface Props {
  summary: PaymentSummaryModel;
}

const cardStyles = {
  padding: '1rem',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
};

export function PaymentSummary({ summary }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <DollarSign size={18} />
          <strong>Total payments</strong>
        </div>
        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{summary.totalPayments}</div>
      </div>
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={18} />
          <strong>Pending verification</strong>
        </div>
        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{summary.pendingVerification}</div>
      </div>
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <ArrowUpRight size={18} />
          <strong>Pending approval</strong>
        </div>
        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{summary.pendingApproval}</div>
      </div>
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <ArrowDownRight size={18} />
          <strong>Pending payment</strong>
        </div>
        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{summary.pendingPayment}</div>
      </div>
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={18} />
          <strong>Completed payments</strong>
        </div>
        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{summary.completedPayments}</div>
      </div>
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Clock3 size={18} />
          <strong>Outstanding amount</strong>
        </div>
        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>₹{summary.outstandingAmount.toLocaleString('en-IN')}</div>
      </div>
    </div>
  );
}
