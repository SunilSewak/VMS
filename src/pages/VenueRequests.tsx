import { Plus } from 'lucide-react';

export function VenueRequests() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>
            Venue Requests
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Submit, track, and manage all venue and event hosting requests.
          </p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--primary)',
          color: 'var(--text-on-primary)',
          borderRadius: 'var(--radius-md)',
          fontWeight: '600',
          fontSize: 'var(--font-sm)'
        }}>
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600' }}>Recent Requests</h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Showing 2 requests</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)' }}>REQUEST ID</th>
              <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)' }}>EVENT NAME</th>
              <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)' }}>DEPARTMENT</th>
              <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)' }}>DATE RANGE</th>
              <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)', fontWeight: '600' }}>REQ-2026-001</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)' }}>Ajanta Sales Summit</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)' }}>Marketing</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)' }}>12 Oct - 15 Oct 2026</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: '700',
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)'
                }}>APPROVED</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)', fontWeight: '600' }}>REQ-2026-002</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)' }}>Q2 Finance Review</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)' }}>Finance</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--font-sm)' }}>24 Nov - 25 Nov 2026</td>
              <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: '700',
                  backgroundColor: 'var(--status-warning-bg)',
                  color: 'var(--status-warning)'
                }}>PENDING</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
