import { Plus } from 'lucide-react';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';

interface RequestRow {
  id: string;
  eventName: string;
  department: string;
  dateRange: string;
  status: 'APPROVED' | 'PENDING' | 'DRAFT';
}

const mockRequests: RequestRow[] = [
  { id: 'REQ-2026-001', eventName: 'Ajanta Sales Summit', department: 'Marketing', dateRange: '12 Oct - 15 Oct 2026', status: 'APPROVED' },
  { id: 'REQ-2026-002', eventName: 'Q2 Finance Review', department: 'Finance', dateRange: '24 Nov - 25 Nov 2026', status: 'PENDING' },
  { id: 'REQ-2026-003', eventName: 'Annual Board Meeting', department: 'Executive', dateRange: '10 Dec 2026', status: 'DRAFT' }
];

export function VenueRequests() {
  const columns: ColumnDefinition<RequestRow>[] = [
    {
      header: 'Request ID',
      accessor: (row) => <strong style={{ color: 'var(--primary)' }}>{row.id}</strong>,
      priority: 'always',
      mobileLabel: 'Request ID'
    },
    {
      header: 'Event Name',
      accessor: (row) => row.eventName,
      priority: 'always',
      mobileLabel: 'Event Name'
    },
    {
      header: 'Department',
      accessor: (row) => row.department,
      priority: 'tablet-desktop',
      mobileLabel: 'Department'
    },
    {
      header: 'Date Range',
      accessor: (row) => row.dateRange,
      priority: 'tablet-desktop',
      mobileLabel: 'Date Range'
    },
    {
      header: 'Status',
      accessor: (row) => {
        let badgeType: 'success' | 'warning' | 'info' = 'info';
        if (row.status === 'APPROVED') badgeType = 'success';
        else if (row.status === 'PENDING') badgeType = 'warning';
        
        return <span className={`badge badge-${badgeType}`}>{row.status}</span>;
      },
      priority: 'always',
      mobileLabel: 'Status'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>
            Venue Requests
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Submit, track, and manage all venue and event hosting requests.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', margin: 0 }}>Recent Requests</h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Showing {mockRequests.length} requests</span>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <ResponsiveDataTable 
            columns={columns} 
            data={mockRequests} 
            keyExtractor={(row) => row.id} 
          />
        </div>
      </div>
    </div>
  );
}
