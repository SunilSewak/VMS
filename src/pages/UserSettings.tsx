import { UserPlus } from 'lucide-react';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';

interface UserRow {
  email: string;
  fullName: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockUsers: UserRow[] = [
  { fullName: 'Sunil Sewak', email: 'sunil.sewak@ajantapharma.com', role: 'SALES_HEAD', department: 'Sales & Marketing', status: 'ACTIVE' },
  { fullName: 'Admin User', email: 'admin@ajantapharma.com', role: 'ADMIN', department: 'IT Operations', status: 'ACTIVE' },
  { fullName: 'Finance Executive', email: 'finance@ajantapharma.com', role: 'FINANCE', department: 'Corporate Finance', status: 'ACTIVE' },
  { fullName: 'Guest Reviewer', email: 'viewer@ajantapharma.com', role: 'VIEWER', department: 'Audit Division', status: 'INACTIVE' }
];

export function UserSettings() {
  const columns: ColumnDefinition<UserRow>[] = [
    {
      header: 'Full Name',
      accessor: (row) => <strong>{row.fullName}</strong>,
      priority: 'always',
      mobileLabel: 'Name'
    },
    {
      header: 'Email Address',
      accessor: (row) => row.email,
      priority: 'always',
      mobileLabel: 'Email'
    },
    {
      header: 'Role Profile',
      accessor: (row) => <span className="badge badge-info">{row.role.replace('_', ' ')}</span>,
      priority: 'always',
      mobileLabel: 'Role'
    },
    {
      header: 'Department',
      accessor: (row) => row.department,
      priority: 'tablet-desktop',
      mobileLabel: 'Department'
    },
    {
      header: 'Account Status',
      accessor: (row) => (
        <span className={`badge badge-${row.status === 'ACTIVE' ? 'success' : 'danger'}`}>
          {row.status}
        </span>
      ),
      priority: 'tablet-desktop',
      mobileLabel: 'Status'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>User Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Manage platform user profiles, authorization permissions, and RBAC policies.
          </p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={16} />
          <span>Register User</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', margin: 0 }}>Registered Personnel</h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Showing {mockUsers.length} profiles</span>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <ResponsiveDataTable 
            columns={columns} 
            data={mockUsers} 
            keyExtractor={(row) => row.email} 
          />
        </div>
      </div>
    </div>
  );
}
