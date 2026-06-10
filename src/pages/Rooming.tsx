import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Download, FileText, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAccommodationPlans } from '../features/rooming/roomingService';
import type { AccommodationPlan, AccommodationPlanStatus } from '../features/rooming/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveDataTable, type ColumnDefinition } from '../components/ResponsiveDataTable';

const STATUS_OPTIONS: Array<AccommodationPlanStatus | ''> = ['', 'DRAFT', 'PLANNED', 'APPROVED', 'EXECUTED', 'RECONCILED', 'CLOSED'];

const statusBadge = (status: AccommodationPlanStatus) => {
  const color =
    status === 'CLOSED'
      ? 'var(--text-muted)'
      : status === 'RECONCILED' || status === 'APPROVED'
      ? 'var(--success)'
      : status === 'EXECUTED'
      ? 'var(--warning)'
      : status === 'PLANNED'
      ? 'var(--primary)'
      : 'var(--muted)';

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
      {status.replace('_', ' ')}
    </span>
  );
};

function downloadFile(filename: string, text: string, mimeType: string) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = url;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}

function mapToExportRows(plans: AccommodationPlan[]) {
  const headers = [
    'Booking',
    'Venue',
    'Meeting',
    'Expected Pax',
    'Single Rooms Planned',
    'Double Rooms Planned',
    'Triple Rooms Planned',
    'Actual Pax',
    'Status',
  ];
  const rows = plans.map((plan) => [
    plan.booking?.booking_reference ?? plan.booking_id,
    plan.booking?.hotels?.hotel_name ?? '-',
    plan.booking?.meeting_requests?.meeting_name ?? '-',
    plan.expected_pax.toString(),
    plan.single_rooms_planned.toString(),
    plan.double_rooms_planned.toString(),
    plan.triple_rooms_planned.toString(),
    plan.utilization?.actual_pax.toString() ?? '0',
    plan.status,
  ]);
  return [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
}

const columns: ColumnDefinition<AccommodationPlan>[] = [
  {
    header: 'Booking / Venue',
    accessor: (plan) => (
      <Link to={ROUTES.roomingDetails.replace(':id', plan.id)} style={{ color: 'var(--primary)', fontWeight: 600 }}>
        {plan.booking?.booking_reference ?? plan.booking_id}
      </Link>
    ),
    priority: 'always',
  },
  {
    header: 'Venue',
    accessor: (plan) => plan.booking?.hotels?.hotel_name ?? '-',
    priority: 'tablet-desktop',
    mobileLabel: 'Venue',
  },
  {
    header: 'Meeting',
    accessor: (plan) => plan.booking?.meeting_requests?.meeting_name ?? '-',
    priority: 'tablet-desktop',
    mobileLabel: 'Meeting',
  },
  {
    header: 'Expected Pax',
    accessor: (plan) => plan.expected_pax,
    priority: 'desktop',
    mobileLabel: 'Expected Pax',
  },
  {
    header: 'Planned Rooms',
    accessor: (plan) => plan.single_rooms_planned + plan.double_rooms_planned + plan.triple_rooms_planned,
    priority: 'desktop',
    mobileLabel: 'Planned Rooms',
  },
  {
    header: 'Actual Pax',
    accessor: (plan) => plan.utilization?.actual_pax ?? 0,
    priority: 'desktop',
    mobileLabel: 'Actual Pax',
  },
  {
    header: 'Status',
    accessor: (plan) => statusBadge(plan.status),
    priority: 'tablet-desktop',
    mobileLabel: 'Status',
  },
  {
    header: 'Actions',
    accessor: (plan) => (
      <Link to={ROUTES.roomingDetails.replace(':id', plan.id)} style={{ color: 'var(--primary)' }}>
        Manage
      </Link>
    ),
    priority: 'desktop',
    mobileLabel: 'Actions',
  },
];

export function Rooming() {
  const { user } = useAuth();
  const [accommodationPlans, setAccommodationPlans] = useState<AccommodationPlan[]>([]);
  const [statusFilter, setStatusFilter] = useState<AccommodationPlanStatus | ''>('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const plans = await getAccommodationPlans(user, statusFilter ? { status: statusFilter } : undefined);
        if (mounted) {
          setAccommodationPlans(plans);
        }
      } catch (caught) {
        if (mounted) {
          setError((caught as Error).message ?? 'Unable to load accommodation plans.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user, statusFilter]);

  const filteredPlans = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return accommodationPlans;
    return accommodationPlans.filter((plan) => {
      return [
        plan.booking?.booking_reference,
        plan.booking?.hotels?.hotel_name,
        plan.booking?.meeting_requests?.meeting_name,
        plan.status,
      ]
        .filter(Boolean)
        .some((value) => typeof value === 'string' && value.toLowerCase().includes(query));
    });
  }, [accommodationPlans, searchText]);

  const metrics = useMemo(() => {
    const expectedPax = accommodationPlans.reduce((sum, plan) => sum + plan.expected_pax, 0);
    const actualPax = accommodationPlans.reduce((sum, plan) => sum + (plan.utilization?.actual_pax ?? 0), 0);
    const plannedRooms = accommodationPlans.reduce(
      (sum, plan) => sum + plan.single_rooms_planned + plan.double_rooms_planned + plan.triple_rooms_planned,
      0
    );
    const actualRooms = accommodationPlans.reduce(
      (sum, plan) => sum + (plan.utilization ? plan.utilization.single_rooms_actual + plan.utilization.double_rooms_actual + plan.utilization.triple_rooms_actual : 0),
      0
    );
    const variance = plannedRooms - actualRooms;
    const utilizationRate = plannedRooms > 0 ? Math.round((actualRooms / plannedRooms) * 100) : 0;
    return { expectedPax, actualPax, plannedRooms, actualRooms, variance, utilizationRate };
  }, [accommodationPlans]);

  if (!user) {
    return null;
  }

  const canViewRooming =
    user.role === ROLES.SUPER_ADMIN ||
    user.role === ROLES.ADMIN ||
    user.role === ROLES.SALES_HEAD ||
    user.role === ROLES.VIEWER;
  if (!canViewRooming) {
    return (
      <EmptyState
        title="Access denied"
        description="You do not have permission to view accommodation plans."
        icon={<Building2 size={48} style={{ color: 'var(--danger)' }} />}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Accommodation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Manage accommodation plans, planned capacity, and reconciliation against actual usage.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => downloadFile('accommodation-list.csv', mapToExportRows(filteredPlans), 'text/csv;charset=utf-8;')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <Download size={16} /> Export Excel
            </button>
            <button
              type="button"
              onClick={() => downloadFile('accommodation-list.pdf', mapToExportRows(filteredPlans), 'application/pdf')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Expected Pax</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>{metrics.expectedPax}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Actual Pax</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>{metrics.actualPax}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Planned Rooms</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>{metrics.plannedRooms}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Utilization %</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>{metrics.utilizationRate}%</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Plan Variance</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>{metrics.variance}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search accommodation plans..."
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
            aria-label="Filter accommodation plans by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AccommodationPlanStatus | '')}
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
                {statusOption.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading accommodation plans...
        </div>
      ) : error ? (
        <div style={{ padding: '3rem 0', color: 'var(--danger)' }}>{error}</div>
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          title={accommodationPlans.length === 0 ? 'No accommodation plans yet' : 'No accommodation plans matched your filters'}
          description={
            accommodationPlans.length === 0
              ? 'Create accommodation plans after booking confirmation and reconcile expected capacity with actual usage.'
              : 'Try clearing the search or selecting a different status filter.'
          }
          icon={<Building2 size={48} style={{ color: 'var(--primary)' }} />}
        />
      ) : (
        <ResponsiveDataTable
          columns={columns}
          data={filteredPlans}
          keyExtractor={(plan) => plan.id}
          emptyState={null}
        />
      )}
    </div>
  );
}
