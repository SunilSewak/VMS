import { EmptyState } from '../components/EmptyState';
import { Hotel as HotelIcon } from 'lucide-react';

export function Hotels() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Hotel Partners</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Manage hotel directory, contacts, and contracted rates.
      </p>
      <EmptyState
        title="No hotel partners listed"
        description="Get started by adding hotel properties and contracted rates."
        icon={<HotelIcon size={48} style={{ color: 'var(--primary)' }} />}
        actionLabel="Register Hotel"
        onAction={() => alert('Feature coming soon in Phase 2!')}
      />
    </div>
  );
}
