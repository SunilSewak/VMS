import type { InvoiceHistoryEvent } from '../../features/invoices/types';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function InvoiceApprovalHistoryTab({ history }: { history: InvoiceHistoryEvent[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
      <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Approval History</h2>
      
      {history.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No history available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((event, index) => (
            <div key={event.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ width: '2px', background: index === history.length - 1 ? 'transparent' : 'var(--border)', position: 'absolute', left: '7px', top: '24px', bottom: '-16px' }} />
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px', zIndex: 1 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{event.action}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(event.created_at)}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>by {event.user?.full_name ?? 'System'}</div>
                {event.remarks && (
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', background: 'var(--background)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                    {event.remarks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
