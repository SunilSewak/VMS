import { EmptyState } from '../components/EmptyState';
import { CheckSquare } from 'lucide-react';

export function Approvals() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Approvals</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Track multi-stage budget and policy approval workflows.
      </p>
      <EmptyState
        title="All caught up!"
        description="No pending requests require your approval signatures at this time."
        icon={<CheckSquare size={48} style={{ color: 'var(--primary)' }} />}
      />
    </div>
  );
}
