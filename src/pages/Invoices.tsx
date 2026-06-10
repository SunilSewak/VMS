import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInvoices } from '../features/invoices/invoiceService';
import type { Invoice, InvoiceStatus } from '../features/invoices/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveDataTable, type ColumnDefinition } from '../components/ResponsiveDataTable';

const STATUS_OPTIONS: Array<InvoiceStatus | ''> = ['', 'RECEIVED', 'VERIFIED', 'APPROVED', 'REJECTED'];

const statusBadge = (status: InvoiceStatus) => {
  const color =
    status === 'APPROVED'
      ? 'var(--success)'
      : status === 'REJECTED'
      ? 'var(--danger)'
      : status === 'VERIFIED'
      ? 'var(--warning)'
      : 'var(--primary)';

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        backgroundColor: 'rgba(0,0,0,0.04)',
        color,
        fontWeight: 600,
        fontSize: '0.8rem',
      }}
    >
      {status}
    </span>
  );
};

const columns: ColumnDefinition<Invoice>[] = [
  {
    header: 'Invoice number',
    accessor: (invoice) => (
      <Link to={ROUTES.invoiceDetails.replace(':id', invoice.id)} style={{ color: 'var(--primary)', fontWeight: 600 }}>
        {invoice.invoice_number}
      </Link>
    ),
    priority: 'always',
  },
  {
    header: 'Invoice date',
    accessor: (invoice) => new Date(invoice.invoice_date).toLocaleDateString('en-IN'),
    priority: 'tablet-desktop',
    mobileLabel: 'Date',
  },
  {
    header: 'Amount',
    accessor: (invoice) => `₹${invoice.invoice_amount.toLocaleString('en-IN')}`,
    priority: 'tablet-desktop',
    mobileLabel: 'Amount',
  },
  {
    header: 'Status',
    accessor: (invoice) => statusBadge(invoice.status),
    priority: 'tablet-desktop',
    mobileLabel: 'Status',
  },
  {
    header: 'Actions',
    accessor: (invoice) => (
      <Link to={ROUTES.invoiceDetails.replace(':id', invoice.id)} style={{ color: 'var(--primary)' }}>
        View
      </Link>
    ),
    priority: 'desktop',
    mobileLabel: 'Actions',
  },
];

export function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadInvoices = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await getInvoices(user, statusFilter ? { status: statusFilter } : undefined);
        if (mounted) {
          setInvoices(items);
        }
      } catch (caught) {
        if (mounted) {
          setError((caught as Error).message ?? 'Unable to load invoices.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInvoices();
    return () => {
      mounted = false;
    };
  }, [user, statusFilter]);

  const filteredInvoices = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return invoices;

    return invoices.filter((invoice) => {
      return [
        invoice.invoice_number,
        invoice.booking_id,
        invoice.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [invoices, searchText]);

  if (!user) {
    return null;
  }

  const canUploadInvoice = user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Invoices</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                Review and manage invoice submissions, verify charges, and process approvals.
              </p>
            </div>
            {canUploadInvoice ? (
              <Link
                to={ROUTES.invoiceUpload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.9rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--primary)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Plus size={16} /> Upload Invoice
              </Link>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search invoice number..."
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SlidersHorizontal size={18} />
            <select
              aria-label="Filter invoices by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as InvoiceStatus | '')}
              style={{
                minWidth: '200px',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading invoices...
        </div>
      ) : error ? (
        <div style={{ padding: '3rem 0', color: 'var(--danger)' }}>{error}</div>
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title={invoices.length === 0 ? 'No invoices uploaded yet' : 'No invoices matched your filters'}
          description={
            invoices.length === 0
              ? 'No invoices uploaded yet. Upload a vendor invoice to begin verification.'
              : 'Try clearing the search or selecting a different status filter.'
          }
          icon={<DollarSign size={48} style={{ color: 'var(--primary)' }} />}
        />
      ) : (
        <ResponsiveDataTable
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(invoice) => invoice.id}
          emptyState={null}
        />
      )}
    </div>
  );
}
