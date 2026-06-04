import { EmptyState } from '../components/EmptyState';
import { BarChart3 } from 'lucide-react';

export function Reports() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Reports & Audit</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Analyze spend analytics, vendor performance metrics, and policy compliance logs.
      </p>
      <EmptyState
        title="Audit report queue is empty"
        description="Run analytical filters to generate venue usage or vendor spending metrics."
        icon={<BarChart3 size={48} style={{ color: 'var(--primary)' }} />}
      />
    </div>
  );
}
