import { useState, useMemo } from 'react';
import {
  Plus, Eye, Edit2, Trash2, Send, Search,
  AlertTriangle, RefreshCw, SlidersHorizontal,
  LayoutGrid, List,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';
import { MeetingRequestCard } from '../components/MeetingRequestCard';
import { useMeetingRequests } from '../features/meetings/hooks';
import { MeetingRequest, MeetingStatus } from '../features/meetings/types';
import { MEETING_STATUSES } from '../features/meetings/constants';
import { deleteMeetingRequest, updateMeetingRequest } from '../features/meetings/meetingService';
import { ROUTES } from '../routes/routeRegistry';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../auth/permissions';

const LS_VIEW_KEY = 'avems_req_view';
type ViewMode = 'cards' | 'table';

function loadViewPref(): ViewMode {
  try {
    const v = localStorage.getItem(LS_VIEW_KEY);
    return v === 'table' ? 'table' : 'cards';
  } catch {
    return 'cards';
  }
}

function saveViewPref(v: ViewMode) {
  try { localStorage.setItem(LS_VIEW_KEY, v); } catch { /* no-op */ }
}

// Status filter options using business-friendly labels
const STATUS_FILTER_OPTIONS: Array<{ value: MeetingStatus | ''; label: string }> = [
  { value: '',                   label: 'All Requests'        },
  { value: 'DRAFT',              label: 'Request Created'     },
  { value: 'VENUES_SHORTLISTED', label: 'Venue Selection'     },
  { value: 'SUBMITTED_TO_ADMIN', label: 'Availability Check'  },
  { value: 'AVAILABILITY_CHECK', label: 'Availability Check (In Progress)' },
  { value: 'VENUE_UNAVAILABLE',  label: 'Venue Unavailable'   },
  { value: 'BOOKED',             label: 'Booking Confirmed'   },
  { value: 'COMPLETED',          label: 'Completed'           },
  { value: 'CLOSED',             label: 'Closed'              },
];

export function MeetingRequests() {
  const { requests, loading, error, refresh } = useMeetingRequests();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [viewMode,      setViewMode]      = useState<ViewMode>(loadViewPref);
  const [actionError,   setActionError]   = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter,  setStatusFilter]  = useState<MeetingStatus | ''>('');
  const [searchText,    setSearchText]    = useState('');

  const userRole = user?.role ?? ROLES.VIEWER;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this draft request?')) return;
    try {
      setActionLoading(id);
      setActionError(null);
      await deleteMeetingRequest(id);
      refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!window.confirm('Submit this request to Admin? It will become read-only.')) return;
    try {
      setActionLoading(id);
      setActionError(null);
      await updateMeetingRequest(id, {}, 'SUBMITTED_TO_ADMIN');
      refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit request');
    } finally {
      setActionLoading(null);
    }
  };

  const switchView = (v: ViewMode) => { setViewMode(v); saveViewPref(v); };

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (statusFilter && req.status !== statusFilter) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        return (
          req.meeting_name.toLowerCase().includes(q) ||
          req.request_number.toLowerCase().includes(q) ||
          (req.cities?.city_name ?? req.target_city_name ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, statusFilter, searchText]);

  // ── Table columns (available to all roles in table view) ──────────────────
  const tableColumns: ColumnDefinition<MeetingRequest>[] = [
    {
      header: 'Request No.',
      accessor: (row) => (
        <span
          style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate(`/meeting-requests/${row.id}`)}
        >
          {row.request_number}
        </span>
      ),
      priority: 'always',
      mobileLabel: 'Request No.',
    },
    {
      header: 'Meeting Name',
      accessor: (row) => row.meeting_name,
      priority: 'always',
      mobileLabel: 'Meeting Name',
    },
    {
      header: 'City',
      accessor: (row) => row.cities?.city_name || row.target_city_name || '—',
      priority: 'tablet-desktop',
      mobileLabel: 'City',
    },
    {
      header: 'Pax',
      accessor: (row) => `${row.expected_pax} / ${row.guaranteed_pax}`,
      priority: 'desktop',
      mobileLabel: 'Pax',
    },
    {
      header: 'Date Range',
      accessor: (row) => {
        const start = new Date(row.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const end   = new Date(row.end_date  ).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${start} – ${end}`;
      },
      priority: 'tablet-desktop',
      mobileLabel: 'Dates',
    },
    {
      header: 'Status',
      accessor: (row) => {
        const cfg = MEETING_STATUSES[row.status] ?? { label: row.status, badgeType: 'info' as const };
        return <span className={`badge badge-${cfg.badgeType}`}>{cfg.label}</span>;
      },
      priority: 'always',
      mobileLabel: 'Status',
    },
    {
      header: 'Actions',
      accessor: (row) => {
        const canEdit = row.status === 'DRAFT' || row.status === 'VENUES_SHORTLISTED' || row.status === 'SHORTLISTED';
        const isMutating = actionLoading === row.id;
        return (
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/meeting-requests/${row.id}`)}
              className="btn btn-secondary"
              style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Eye size={12} /><span className="hide-mobile" style={{ fontSize: '11px' }}>View</span>
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => navigate(`/meeting-requests/${row.id}/edit`)}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  disabled={isMutating}
                >
                  <Edit2 size={12} /><span className="hide-mobile" style={{ fontSize: '11px' }}>Edit</span>
                </button>
                <button
                  onClick={() => handleSubmit(row.id)}
                  className="btn btn-primary"
                  style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  disabled={isMutating}
                >
                  <Send size={12} /><span className="hide-mobile" style={{ fontSize: '11px' }}>Submit</span>
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                  disabled={isMutating}
                >
                  <Trash2 size={12} /><span className="hide-mobile" style={{ fontSize: '11px' }}>Delete</span>
                </button>
              </>
            )}
          </div>
        );
      },
      priority: 'always',
      mobileLabel: 'Actions',
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
            Meeting Requests
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Track requests and their current workflow stage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* View toggle */}
          <div style={{
            display: 'flex', borderRadius: '9px',
            border: '1px solid var(--border)', overflow: 'hidden',
            background: 'var(--surface)',
          }}>
            {(['cards', 'table'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => switchView(v)}
                title={v === 'cards' ? 'Card view' : 'Table view'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.5rem 0.75rem', border: 'none',
                  background: viewMode === v ? 'var(--primary)' : 'transparent',
                  color:      viewMode === v ? '#fff' : 'var(--text-muted)',
                  cursor:     'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {v === 'cards' ? <LayoutGrid size={15} /> : <List size={15} />}
              </button>
            ))}
          </div>

          {userRole !== ROLES.ADMIN && userRole !== ROLES.SUPER_ADMIN && (
            <button className="btn btn-primary" onClick={() => navigate(ROUTES.meetingRequestNew)}>
              <Plus size={16} />
              <span>New Request</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {(error || actionError) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: 'var(--font-sm)',
        }}>
          <AlertTriangle size={16} />
          <span>{actionError || error}</span>
        </div>
      )}

      {/* ── Search + filter bar ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', top: '50%', left: '0.9rem',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search by name, number or city…"
            style={{
              width: '100%', padding: '0.72rem 1rem 0.72rem 2.4rem',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              background: 'var(--surface)', fontSize: 'var(--font-sm)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as MeetingStatus | '')}
            style={{
              padding: '0.72rem 1rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              fontSize: 'var(--font-sm)', minWidth: '210px',
            }}
          >
            {STATUS_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            {filteredRequests.length} of {requests.length}
          </span>
          <button
            onClick={refresh} disabled={loading}
            title="Refresh"
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading meeting requests…</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {requests.length === 0 ? 'No meeting requests yet' : 'No requests match your filters'}
          </p>
          <p style={{ fontSize: 'var(--font-sm)' }}>
            {requests.length === 0
              ? (userRole === ROLES.ADMIN
                ? 'No meeting requests available. Requestors should create requests from the request creation workflow.'
                : 'Click "New Request" to create your first draft.')
              : 'Try clearing the search or selecting a different stage.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* ── Card grid ──────────────────────────────────────────────── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.1rem',
        }}>
          {filteredRequests.map(req => (
            <MeetingRequestCard
              key={req.id}
              request={req}
              userRole={userRole}
              isMutating={actionLoading === req.id}
              onSubmit={handleSubmit}
            />
          ))}
        </div>
      ) : (
        /* ── Table view ─────────────────────────────────────────────── */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: 'var(--space-3) var(--space-5)',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, margin: 0, color: 'var(--text-muted)' }}>
              Requests log — table view
            </h4>
          </div>
          <div style={{ padding: 'var(--space-4)' }}>
            <ResponsiveDataTable
              columns={tableColumns}
              data={filteredRequests}
              keyExtractor={row => row.id}
              emptyState={null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
