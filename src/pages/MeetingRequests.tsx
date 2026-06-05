import { useState } from 'react';
import { Plus, Eye, Edit2, Trash2, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';
import { useMeetingRequests } from '../features/meetings/hooks';
import { MeetingRequest } from '../features/meetings/types';
import { MEETING_STATUSES } from '../features/meetings/constants';
import { deleteMeetingRequest, updateMeetingRequest } from '../features/meetings/api';
import { ROUTES } from '../routes/routeRegistry';

export function MeetingRequests() {
  const { requests, loading, error, refresh } = useMeetingRequests();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // holds id of mutating item

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this draft request?')) return;
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
    if (!window.confirm('Are you sure you want to submit this request? It will become read-only.')) return;
    try {
      setActionLoading(id);
      setActionError(null);
      await updateMeetingRequest(id, {}, 'SUBMITTED');
      refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit request');
    } finally {
      setActionLoading(null);
    }
  };

  const columns: ColumnDefinition<MeetingRequest>[] = [
    {
      header: 'Request No.',
      accessor: (row) => (
        <span 
          style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => navigate(`/meeting-requests/${row.id}`)}
        >
          {row.request_number}
        </span>
      ),
      priority: 'always',
      mobileLabel: 'Request No.'
    },
    {
      header: 'Meeting Name',
      accessor: (row) => row.meeting_name,
      priority: 'always',
      mobileLabel: 'Meeting Name'
    },
    {
      header: 'Division',
      accessor: (row) => row.divisions?.name || row.division_id,
      priority: 'tablet-desktop',
      mobileLabel: 'Division'
    },
    {
      header: 'City',
      accessor: (row) => row.cities?.name || row.city_id,
      priority: 'tablet-desktop',
      mobileLabel: 'City'
    },
    {
      header: 'Pax (Exp/Guar)',
      accessor: (row) => `${row.expected_pax} / ${row.guaranteed_pax}`,
      priority: 'desktop',
      mobileLabel: 'Pax (Exp/Guar)'
    },
    {
      header: 'Date Range',
      accessor: (row) => {
        const start = new Date(row.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const end = new Date(row.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${start} - ${end}`;
      },
      priority: 'tablet-desktop',
      mobileLabel: 'Date Range'
    },
    {
      header: 'Status',
      accessor: (row) => {
        const config = MEETING_STATUSES[row.status] || { label: row.status, badgeType: 'info' };
        return <span className={`badge badge-${config.badgeType}`}>{config.label}</span>;
      },
      priority: 'always',
      mobileLabel: 'Status'
    },
    {
      header: 'Actions',
      accessor: (row) => {
        const isDraft = row.status === 'DRAFT';
        const isMutating = actionLoading === row.id;

        return (
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/meeting-requests/${row.id}`)}
              className="btn btn-secondary"
              style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="View Request"
            >
              <Eye size={12} />
              <span className="hide-mobile" style={{ fontSize: '11px' }}>View</span>
            </button>

            {isDraft && (
              <>
                <button
                  onClick={() => navigate(`/meeting-requests/${row.id}/edit`)}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  title="Edit Draft"
                  disabled={isMutating}
                >
                  <Edit2 size={12} />
                  <span className="hide-mobile" style={{ fontSize: '11px' }}>Edit</span>
                </button>

                <button
                  onClick={() => handleSubmit(row.id)}
                  className="btn btn-primary"
                  style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Submit Draft"
                  disabled={isMutating}
                >
                  <Send size={12} />
                  <span className="hide-mobile" style={{ fontSize: '11px' }}>Submit</span>
                </button>

                <button
                  onClick={() => handleDelete(row.id)}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-1) var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                  title="Delete Draft"
                  disabled={isMutating}
                >
                  <Trash2 size={12} />
                  <span className="hide-mobile" style={{ fontSize: '11px' }}>Delete</span>
                </button>
              </>
            )}
          </div>
        );
      },
      priority: 'always',
      mobileLabel: 'Actions'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>
            Meeting Requests
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Submit, view, and manage request specifications for corporate hotels and venues.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.meetingRequestNew)}
        >
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      {/* Action / General Error Banner */}
      {(error || actionError) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          color: '#ef4444',
          fontSize: 'var(--font-sm)'
        }}>
          <AlertTriangle size={16} />
          <span>{actionError || error}</span>
        </div>
      )}

      {/* Main Listing Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ 
          padding: 'var(--space-4) var(--space-6)', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--surface)'
        }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', margin: 0 }}>Requests Log</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              Total: {requests.length}
            </span>
            <button 
              onClick={refresh}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div style={{ padding: 'var(--space-4)' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
              <p>Loading meeting requests from Supabase...</p>
            </div>
          ) : (
            <ResponsiveDataTable
              columns={columns}
              data={requests}
              keyExtractor={(row) => row.id}
              emptyState={
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>No meeting requests found</p>
                  <p style={{ fontSize: 'var(--font-sm)' }}>Click "New Request" to create your first draft.</p>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
