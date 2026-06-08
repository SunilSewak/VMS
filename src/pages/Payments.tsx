import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPayments, getPaymentSummary } from '../features/payments/paymentService';
import type { Payment } from '../features/payments/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveDataTable, type ColumnDefinition } from '../components/ResponsiveDataTable';
import { PaymentSummary } from '../components/PaymentSummary';

const STATUS_OPTIONS: Array<Payment['status'] | ''> = ['', 'RECEIVED', 'VERIFIED', 'APPROVED', 'PAID'];

const statusBadge = (status: Payment['status']) => {
  const color =
    status === 'PAID'
      ? 'var(--success)'
      : status === 'APPROVED'
      ? 'var(--warning)'
      : status === 'VERIFIED'
      ? 'var(--info)'
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

const columns: ColumnDefinition<Payment>[] = [
  {
    header: 'Payment ID',
    accessor: (payment) => (
      <Link to={ROUTES.paymentDetails.replace(':id', payment.id)} style={{ color: 'var(--primary)', fontWeight: 600 }}>
        {payment.payment_reference}
      </Link>
    ),
    priority: 'always',
  },
  {
    header: 'Invoice number',
    accessor: (payment) => payment.invoice?.invoice_number ?? payment.invoice_id,
    priority: 'tablet-desktop',
    mobileLabel: 'Invoice',
  },
  {
    header: 'Booking',
    accessor: (payment) => payment.invoice?.bookings?.booking_reference ?? 'N/A',
    priority: 'tablet-desktop',
    mobileLabel: 'Booking',
  },
  {
    header: 'Hotel',
    accessor: (payment) => payment.invoice?.bookings?.hotel_name ?? 'N/A',
    priority: 'tablet-desktop',
    mobileLabel: 'Hotel',
  },
  {
    header: 'Invoice amount',
    accessor: (payment) => `₹${payment.invoice?.invoice_amount?.toLocaleString('en-IN') ?? 0}`,
    priority: 'tablet-desktop',
    mobileLabel: 'Invoice amount',
  },
  {
    header: 'Payment status',
    accessor: (payment) => statusBadge(payment.status),
    priority: 'tablet-desktop',
    mobileLabel: 'Status',
  },
  {
    header: 'Payment date',
    accessor: (payment) => new Date(payment.payment_date).toLocaleDateString('en-IN'),
    priority: 'tablet-desktop',
    mobileLabel: 'Date',
  },
  {
    header: 'Days outstanding',
    accessor: (payment) => {
      const paymentDate = new Date(payment.payment_date);
      const days = Math.max(0, Math.floor((new Date().getTime() - paymentDate.getTime()) / 86400000));
      return `${days} days`;
    },
    priority: 'desktop',
    mobileLabel: 'Days',
  },
  {
    header: 'Actions',
    accessor: (payment) => (
      <Link to={ROUTES.paymentDetails.replace(':id', payment.id)} style={{ color: 'var(--primary)' }}>
        View
      </Link>
    ),
    priority: 'desktop',
    mobileLabel: 'Actions',
  },
];

export function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<Payment['status'] | ''>('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getPayments(user, statusFilter ? { status: statusFilter } : undefined);
        if (mounted) setPayments(items);
      } catch (caught) {
        if (mounted) setError((caught as Error).message ?? 'Unable to load payments.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPayments();
    return () => {
      mounted = false;
    };
  }, [user, statusFilter]);

  const hotelOptions = useMemo(() => {
    return Array.from(new Set(payments.map((payment) => payment.invoice?.bookings?.hotel_name).filter(Boolean) as string[]));
  }, [payments]);

  const divisionOptions = useMemo(() => {
    return Array.from(new Set(payments.map((payment) => payment.invoice?.bookings?.division_name).filter(Boolean) as string[]));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let items = [...payments];

    if (statusFilter) {
      items = items.filter((payment) => payment.status === statusFilter);
    }

    if (hotelFilter) {
      items = items.filter((payment) => payment.invoice?.bookings?.hotel_name === hotelFilter);
    }

    if (divisionFilter) {
      items = items.filter((payment) => payment.invoice?.bookings?.division_name === divisionFilter);
    }

    if (invoiceSearch.trim()) {
      const invoiceQuery = invoiceSearch.trim().toLowerCase();
      items = items.filter((payment) => payment.invoice?.invoice_number.toLowerCase().includes(invoiceQuery));
    }

    if (dateFrom) {
      items = items.filter((payment) => payment.payment_date >= dateFrom);
    }

    if (dateTo) {
      items = items.filter((payment) => payment.payment_date <= dateTo);
    }

    if (!searchText.trim()) {
      return items;
    }

    const query = searchText.trim().toLowerCase();
    return items.filter((payment) => {
      return [
        payment.payment_reference,
        payment.invoice?.invoice_number,
        payment.invoice?.bookings?.booking_reference,
        payment.invoice?.bookings?.hotel_name,
        payment.status,
      ]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(query));
    });
  }, [payments, statusFilter, hotelFilter, divisionFilter, invoiceSearch, dateFrom, dateTo, searchText]);

  if (!user) {
    return null;
  }

  const canCreatePayment = user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
  const summary = getPaymentSummary(payments);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Payments</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', margin: 0 }}>
            Track payment status for approved invoices and keep the finance dashboard aligned with the invoice lifecycle.
          </p>
        </div>
        {canCreatePayment ? (
          <Link
            to={ROUTES.paymentNew}
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
            <Plus size={16} /> New payment
          </Link>
        ) : null}
      </div>

      <PaymentSummary summary={summary} />

      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: '1fr', alignItems: 'center' }}>
        <div style={{ flex: '1 1 min(420px, 100%)', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search payments, invoices, booking, hotel..."
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <select
            aria-label="Filter payments by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as Payment['status'] | '')}
            style={{
              minWidth: '220px',
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

          <select
            aria-label="Filter payments by hotel"
            value={hotelFilter}
            onChange={(event) => setHotelFilter(event.target.value)}
            style={{
              minWidth: '220px',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <option value="">All hotels</option>
            {hotelOptions.map((hotel) => (
              <option key={hotel} value={hotel}>
                {hotel}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter payments by division"
            value={divisionFilter}
            onChange={(event) => setDivisionFilter(event.target.value)}
            style={{
              minWidth: '220px',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <option value="">All divisions</option>
            {divisionOptions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="Filter payments from"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            style={{
              minWidth: '220px',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          />

          <input
            type="date"
            aria-label="Filter payments to"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            style={{
              minWidth: '220px',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          />

          <input
            type="text"
            aria-label="Search by invoice number"
            value={invoiceSearch}
            onChange={(event) => setInvoiceSearch(event.target.value)}
            placeholder="Invoice number"
            style={{
              minWidth: '220px',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading payments...
        </div>
      ) : error ? (
        <div style={{ padding: '3rem 0', color: 'var(--danger)' }}>{error}</div>
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title={payments.length === 0 ? 'No payments available' : 'No payments matched your filters'}
          description={
            payments.length === 0
              ? 'Create a payment entry once the invoice has been approved.'
              : 'Try clearing the search or selecting a different status filter.'
          }
          icon={<Wallet size={48} style={{ color: 'var(--primary)' }} />}
        />
      ) : (
        <ResponsiveDataTable
          columns={columns}
          data={filteredPayments}
          keyExtractor={(payment) => payment.id}
          emptyState={null}
        />
      )}
    </div>
  );
}
