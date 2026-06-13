import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookings } from '../features/bookings/bookingService';
import type { Booking, BookingStatus } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveDataTable, type ColumnDefinition } from '../components/ResponsiveDataTable';
import { BookingCard } from '../components/BookingCard';

const LS_BOOKING_VIEW_KEY = 'avems_booking_view';
type ViewMode = 'cards' | 'table';

function loadViewPref(): ViewMode {
  try {
    const v = localStorage.getItem(LS_BOOKING_VIEW_KEY);
    return v === 'table' ? 'table' : 'cards';
  } catch {
    return 'cards';
  }
}

function saveViewPref(v: ViewMode) {
  try { localStorage.setItem(LS_BOOKING_VIEW_KEY, v); } catch { /* no-op */ }
}

const OPERATIONAL_FILTER_OPTIONS = [
  { value: '', label: 'All Bookings' },
  { value: 'upcoming', label: 'Upcoming Events' },
  { value: 'active', label: 'Active Events' },
  { value: 'rooming_pending', label: 'Rooming Pending' },
  { value: 'invoice_pending', label: 'Invoice Pending' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'completed', label: 'Completed Events' },
];

const statusBadge = (status: BookingStatus) => {
  const color =
    status === 'CONFIRMED'
      ? '#6366f1'
      : status === 'ACTIVE'
      ? '#10b981'
      : status === 'INVOICE_PENDING'
      ? '#f59e0b'
      : status === 'PAYMENT_PENDING'
      ? '#f59e0b'
      : status === 'CANCELLED'
      ? '#ef4444'
      : status === 'COMPLETED'
      ? '#059669'
      : '#6b7280';

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        backgroundColor: `${color}22`,
        color,
        fontWeight: 600,
        fontSize: '0.8rem',
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
};

const columns: ColumnDefinition<Booking>[] = [
  {
    header: 'Booking Ref',
    accessor: (booking) => (
      <Link to={ROUTES.bookingDetails.replace(':id', booking.id)} style={{ color: 'var(--primary)', fontWeight: 600 }}>
        {booking.booking_reference}
      </Link>
    ),
    priority: 'always',
  },
  {
    header: 'Meeting',
    accessor: (booking) => booking.meeting_requests?.meeting_name ?? booking.meeting_request_id,
    priority: 'tablet-desktop',
    mobileLabel: 'Meeting',
  },
  {
    header: 'Hotel',
    accessor: (booking) => booking.hotels?.hotel_name ?? booking.hotel_id,
    priority: 'tablet-desktop',
    mobileLabel: 'Hotel',
  },
  {
    header: 'Check In',
    accessor: (booking) => booking.check_in_date ?? '-',
    priority: 'desktop',
    mobileLabel: 'Check In',
  },
  {
    header: 'Check Out',
    accessor: (booking) => booking.check_out_date ?? '-',
    priority: 'desktop',
    mobileLabel: 'Check Out',
  },
  {
    header: 'Pax',
    accessor: (booking) => booking.expected_pax ?? '-',
    priority: 'tablet-desktop',
    mobileLabel: 'Pax',
  },
  {
    header: 'Status',
    accessor: (booking) => statusBadge(booking.status),
    priority: 'tablet-desktop',
    mobileLabel: 'Status',
  },
  {
    header: 'Actions',
    accessor: (booking) => (
      <Link to={ROUTES.bookingDetails.replace(':id', booking.id)} style={{ color: 'var(--primary)' }}>
        View
      </Link>
    ),
    priority: 'desktop',
    mobileLabel: 'Actions',
  },
];

export function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [operationalFilter, setOperationalFilter] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewPref);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await getBookings(user, statusFilter ? { status: statusFilter } : undefined);
        if (mounted) {
          setBookings(items);
        }
      } catch (caught) {
        if (mounted) {
          setError((caught as Error).message ?? 'Unable to load bookings.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBookings();
    return () => {
      mounted = false;
    };
  }, [user, statusFilter]);

  const switchViewMode = (v: ViewMode) => {
    setViewMode(v);
    saveViewPref(v);
  };

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Apply operational filter
    if (operationalFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((booking) => {
        const checkInDate = new Date(booking.check_in_date);
        checkInDate.setHours(0, 0, 0, 0);
        
        switch (operationalFilter) {
          case 'upcoming':
            return checkInDate > today;
          case 'active':
            return checkInDate <= today && new Date(booking.check_out_date) >= today;
          case 'rooming_pending':
            return booking.rooming_status === 'PENDING' || booking.rooming_status === 'IN_PROGRESS';
          case 'invoice_pending':
            return booking.invoice_status === 'PENDING' || booking.invoice_status === 'UNDER_VERIFICATION';
          case 'payment_pending':
            return booking.payment_status === 'PENDING' || booking.payment_status === 'PARTIAL';
          case 'completed':
            return booking.status === 'COMPLETED';
          default:
            return true;
        }
      });
    }

    // Apply search filter
    const query = searchText.trim().toLowerCase();
    if (!query) return filtered;

    return filtered.filter((booking) => {
      const meetingName = booking.meeting_requests?.meeting_name ?? '';
      const hotelName = booking.hotels?.hotel_name ?? '';
      return [
        booking.booking_reference,
        booking.meeting_request_id,
        meetingName,
        hotelName,
        booking.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [bookings, searchText, operationalFilter]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Bookings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Manage confirmed venue reservations and their operational progress.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search bookings, meetings, hotels..."
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
              aria-label="Filter bookings by operational status"
              value={operationalFilter}
              onChange={(event) => setOperationalFilter(event.target.value)}
              style={{
                minWidth: '200px',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              {OPERATIONAL_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => switchViewMode('cards')}
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: viewMode === 'cards' ? 'var(--primary)' : 'var(--surface)',
                color: viewMode === 'cards' ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'var(--font-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LayoutGrid size={16} /> Cards
            </button>
            <button
              onClick={() => switchViewMode('table')}
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: viewMode === 'table' ? 'var(--primary)' : 'var(--surface)',
                color: viewMode === 'table' ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'var(--font-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <List size={16} /> Table
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading bookings...
        </div>
      ) : error ? (
        <div style={{ padding: '3rem 0', color: 'var(--danger)' }}>{error}</div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title={bookings.length === 0 ? 'No bookings available' : 'No bookings matched your filters'}
          description={
            bookings.length === 0
              ? 'No bookings are available yet. Create a meeting request and confirm a venue to generate a booking.'
              : 'Try clearing the search or selecting a different filter.'
          }
          icon={<CalendarDays size={48} style={{ color: 'var(--primary)' }} />}
        />
      ) : viewMode === 'cards' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <ResponsiveDataTable
          columns={columns}
          data={filteredBookings}
          keyExtractor={(booking) => booking.id}
          emptyState={null}
        />
      )}
    </div>
  );
}
