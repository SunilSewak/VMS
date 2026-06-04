import { EmptyState } from '../components/EmptyState';
import { Receipt } from 'lucide-react';

export function Quotations() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Quotations</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Compare quotations received from hotel partners for various events.
      </p>
      <EmptyState
        title="No quotations uploaded"
        description="When hotels submit quotations, they will show up here for line-item comparison."
        icon={<Receipt size={48} style={{ color: 'var(--primary)' }} />}
        actionLabel="Upload Quote"
        onAction={() => alert('Feature coming soon in Phase 2!')}
      />
    </div>
  );
}
