import { EmptyState } from '../components/EmptyState';
import { Users } from 'lucide-react';

export function UserSettings() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>User Management</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Manage platform user profiles, authorization permissions, and RBAC policies.
      </p>
      <EmptyState
        title="No external profiles listed"
        description="Add corporate delegates, requesters, and finance personnel permissions."
        icon={<Users size={48} style={{ color: 'var(--primary)' }} />}
      />
    </div>
  );
}
