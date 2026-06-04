import { EmptyState } from '../components/EmptyState';
import { Coins } from 'lucide-react';

export function Finance() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Finance & Payments</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Track advances, final billing reconciliations, and payment histories.
      </p>
      <EmptyState
        title="No billing transactions recorded"
        description="Invoice submissions and advance payment details will appear here once bookings start."
        icon={<Coins size={48} style={{ color: 'var(--primary)' }} />}
      />
    </div>
  );
}
