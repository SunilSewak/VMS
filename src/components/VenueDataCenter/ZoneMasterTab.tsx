import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
  status: 'ACTIVE' | 'INACTIVE';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ZoneMasterTabProps {
  onRefresh: () => void;
}

const thStyle = {
  padding: '0.75rem 1.25rem',
  textAlign: 'left' as const,
  fontSize: 'var(--font-xs)',
  fontWeight: 700 as const,
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface-2)',
};

const tdStyle = {
  padding: '0.85rem 1.25rem',
  fontSize: 'var(--font-sm)',
  borderBottom: '1px solid var(--border)',
};

export function ZoneMasterTab({ onRefresh }: ZoneMasterTabProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({ zone_code: '', zone_name: '' });

  useEffect(() => {
    loadZones();
  }, []);

  async function loadZones() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from('zones')
        .select('*')
        .order('zone_code', { ascending: true });

      if (queryError) throw queryError;
      setZones(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.zone_code.trim() || !formData.zone_name.trim()) {
      setError('All fields required');
      return;
    }

    try {
      if (editingZone) {
        const { error: updateError } = await supabase
          .from('zones')
          .update({
            zone_name: formData.zone_name,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', editingZone.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('zones')
          .insert([{
            zone_code: formData.zone_code.toUpperCase(),
            zone_name: formData.zone_name,
            status: 'ACTIVE',
          } as any]);

        if (insertError) throw insertError;
      }

      setShowForm(false);
      setEditingZone(null);
      setFormData({ zone_code: '', zone_name: '' });
      await loadZones();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save zone');
    }
  }

  async function handleToggleStatus(zone: Zone) {
    try {
      const { error: updateError } = await supabase
        .from('zones')
        .update({ status: zone.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } as any)
        .eq('id', zone.id);

      if (updateError) throw updateError;
      await loadZones();
    } catch (err: any) {
      setError(err.message || 'Failed to update zone');
    }
  }

  async function handleDelete(zone: Zone) {
    if (!confirm(`Delete zone "${zone.zone_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('zones')
        .delete()
        .eq('id', zone.id);

      if (deleteError) throw deleteError;
      await loadZones();
    } catch (err: any) {
      setError(err.message || 'Failed to delete zone');
    }
  }

  function handleEdit(zone: Zone) {
    setEditingZone(zone);
    setFormData({
      zone_code: zone.zone_code,
      zone_name: zone.zone_name,
    });
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingZone(null);
    setFormData({ zone_code: '', zone_name: '' });
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Zone Master</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>Manage geographical zones and their status</p>
        </div>
        <button
          onClick={() => {
            setEditingZone(null);
            setFormData({ zone_code: '', zone_name: '' });
            setShowForm(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} />
          Add Zone
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', margin: 0 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Zones Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone.id}>
                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-main)' }}>{zone.zone_code}</td>
                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{zone.zone_name}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleStatus(zone)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: 'var(--font-xs)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'background 0.2s',
                      background: zone.status === 'ACTIVE' ? '#10b98118' : 'var(--surface-2)',
                      color: zone.status === 'ACTIVE' ? '#10b981' : 'var(--text-muted)',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {zone.status}
                  </button>
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                  {new Date(zone.created_at).toLocaleDateString()}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(zone)}
                      style={{
                        padding: '0.4rem', borderRadius: 'var(--radius-md)',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                      title="Edit zone"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(zone)}
                      style={{
                        padding: '0.4rem', borderRadius: 'var(--radius-md)',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                      title="Delete zone"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {zones.length === 0 && (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No zones found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}>
          <div className="card" style={{ padding: 'var(--space-6)', maxWidth: '28rem', width: '100%', margin: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
              {editingZone ? 'Edit Zone' : 'Add New Zone'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                  Zone Code {editingZone ? '(read-only)' : '(required)'}
                </label>
                <input
                  type="text"
                  value={formData.zone_code}
                  onChange={e => setFormData({ ...formData, zone_code: e.target.value.toUpperCase() })}
                  disabled={!!editingZone}
                  placeholder="e.g., NORTH"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                  Zone Name (required)
                </label>
                <input
                  type="text"
                  value={formData.zone_name}
                  onChange={e => setFormData({ ...formData, zone_name: e.target.value })}
                  placeholder="e.g., North Region"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <button onClick={handleCloseForm} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
                {editingZone ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
