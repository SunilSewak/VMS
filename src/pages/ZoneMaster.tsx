import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';
import { ZoneFormModal } from '../components/ZoneFormModal';
import { getZones, createZone, updateZone, deleteZone, toggleZoneStatus } from '../features/zones/zoneService';
import type { Zone } from '../features/zones/types';
import type { ZoneCreateInput, ZoneUpdateInput } from '../features/zones/types';

export function ZoneMaster() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch zones on mount
  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getZones();
      setZones(data || []);
    } catch (err) {
      console.error('Failed to load zones:', err);
      setError((err as Error).message || 'Unable to load zones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedZone(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (zone: Zone) => {
    setSelectedZone(zone);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleFormSave = async (input: ZoneCreateInput | ZoneUpdateInput) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && selectedZone) {
        const updated = await updateZone(selectedZone.id, input as ZoneUpdateInput);
        setZones(zones.map(z => z.id === selectedZone.id ? updated : z));
        setSuccess('Zone updated successfully');
      } else {
        const created = await createZone(input as ZoneCreateInput);
        setZones([...zones, created]);
        setSuccess('Zone created successfully');
      }

      setTimeout(() => setSuccess(null), 3000);
      setIsFormOpen(false);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to save zone';
      setError(errorMsg);
      console.error('Error saving zone:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (zone: Zone) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await toggleZoneStatus(zone.id);
      setZones(zones.map(z => z.id === zone.id ? updated : z));
      setSuccess(`Zone ${updated.status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to toggle zone status';
      setError(errorMsg);
      console.error('Error toggling zone status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (zone: Zone) => {
    setDeleteConfirm(zone.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteZone(deleteConfirm);
      setZones(zones.filter(z => z.id !== deleteConfirm));
      setDeleteConfirm(null);
      setSuccess('Zone deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to delete zone';
      setError(errorMsg);
      console.error('Error deleting zone:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDefinition<Zone>[] = [
    {
      header: 'Zone Code',
      accessor: (row) => <strong>{row.zone_code}</strong>,
      priority: 'always',
      mobileLabel: 'Code'
    },
    {
      header: 'Zone Name',
      accessor: (row) => row.zone_name,
      priority: 'always',
      mobileLabel: 'Name'
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge badge-${row.status === 'ACTIVE' ? 'success' : 'danger'}`}>
          {row.status}
        </span>
      ),
      priority: 'tablet-desktop',
      mobileLabel: 'Status'
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'ACTIVE' ? 'Deactivate zone' : 'Activate zone'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: row.status === 'ACTIVE' ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
            disabled={isLoading}
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            title="Edit zone"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
            disabled={isLoading}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            title="Delete zone"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
            disabled={isLoading || deleteConfirm === row.id}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      priority: 'always',
      mobileLabel: 'Actions'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Zone Master</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Manage geographical zones for venue organization and venue search.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateClick} disabled={isLoading}>
          <Plus size={16} />
          <span>Create Zone</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          <span>{success}</span>
        </div>
      )}

      {/* Zones Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', margin: 0 }}>Zones</h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Showing {zones.length} zones</span>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <ResponsiveDataTable
            columns={columns}
            data={zones}
            keyExtractor={(row) => row.id}
            emptyState={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No zones found. Create a new zone to get started.</div>}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '400px',
              width: '90%',
              padding: 'var(--space-6)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Delete Zone?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Are you sure you want to delete this zone? This action cannot be undone if no cities are assigned.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Form Modal */}
      <ZoneFormModal
        zone={isEditMode ? selectedZone : null}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedZone(null);
          setIsEditMode(false);
        }}
        onSave={handleFormSave}
        isLoading={isLoading}
      />
    </div>
  );
}
