import { FileText, CheckSquare, Calendar, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { title: 'Active Requests', value: '12', icon: <FileText size={20} />, change: '+2 today', color: '#3b82f6' },
    { title: 'Pending Approvals', value: '5', icon: <CheckSquare size={20} />, change: '3 high priority', color: '#f59e0b' },
    { title: 'Upcoming Bookings', value: '8', icon: <Calendar size={20} />, change: 'Next event: 12 June', color: '#10b981' },
    { title: 'Total Venue Expense', value: '₹4,82,000', icon: <TrendingUp size={20} />, change: 'This quarter', color: '#6366f1' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>
          Welcome back, Sunil
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          Here is a quick overview of Ajanta Venue and Event operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--surface)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.title}
              </p>
              <h4 style={{ fontSize: 'var(--font-2xl)', fontWeight: '700', margin: 'var(--space-1) 0' }}>
                {stat.value}
              </h4>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-light)' }}>
                {stat.change}
              </span>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: `${stat.color}15`,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Mock Charts/Tables Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--space-6)'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Recent Requests Log
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1, 2, 3].map((item) => (
              <div key={item} style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--primary)'
              }}>
                <div>
                  <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '600' }}>Annual Leadership Meet 2026</h5>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Requested by HR Team • Mumbai</p>
                </div>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: '700',
                  backgroundColor: 'var(--status-warning-bg)',
                  color: 'var(--status-warning)'
                }}>
                  PENDING REVIEW
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Active Vendor Status
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { hotel: 'Taj Lands End, Mumbai', status: 'Quote Received', color: '#10b981' },
              { hotel: 'Grand Hyatt, Goa', status: 'Negotiation', color: '#3b82f6' },
              { hotel: 'JW Marriott, Pune', status: 'Awaiting Contract', color: '#f59e0b' }
            ].map((v, idx) => (
              <div key={idx} style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '600' }}>{v.hotel}</h5>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Updated 2 hours ago</p>
                </div>
                <span style={{
                  fontSize: 'var(--font-xs)',
                  fontWeight: '600',
                  color: v.color
                }}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
