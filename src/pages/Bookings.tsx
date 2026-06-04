import { EmptyState } from '../components/EmptyState';
import { CalendarRange } from 'lucide-react';

export function Bookings() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Bookings</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
        Confirmed bookings and logistics calendars.
      </p>
      <EmptyState
        title="No active bookings scheduled"
        description="Finalize request negotiations to book venues and issue event calendars."
        icon={<CalendarRange size={48} style={{ color: 'var(--primary)' }} />}
      />
    </div>
  );
}
