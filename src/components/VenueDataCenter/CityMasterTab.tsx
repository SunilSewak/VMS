import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../Modal';

interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
}

interface City {
  id: string;
  city_name: string;
  state: string;
  zone_id: string;
  status: 'ACTIVE' | 'INACTIVE';
  zones?: Zone;
  created_at: string;
}

interface CityMasterTabProps {
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

export function CityMasterTab({ onRefresh }: CityMasterTabProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({
    city_name: '',
    state: '',
    zone_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('zone_code', { ascending: true });

      if (zonesError) throw zonesError;
      setZones(zonesData || []);

      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('*, zones(id, zone_code, zone_name)')
        .order('city_name', { ascending: true });

      if (citiesError) throw citiesError;
      setCities(citiesData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.city_name.trim() || !formData.state.trim() || !formData.zone_id) {
      setError('All fields required');
      return;
    }

    try {
      if (editingCity) {
        const { error: updateError } = await supabase
          .from('cities')
          .update({
            city_name: formData.city_name,
            state: formData.state,
            zone_id: formData.zone_id,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', editingCity.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cities')
          .insert([{
            city_name: formData.city_name,
            state: formData.state,
            zone_id: formData.zone_id,
            status: 'ACTIVE',
          } as any]);

        if (insertError) throw insertError;
      }

      setShowForm(false);
      setEditingCity(null);
      setFormData({ city_name: '', state: '', zone_id: '' });
      await loadData();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save city');
    }
  }

  async function handleToggleStatus(city: City) {
    try {
      const { error: updateError } = await supabase
        .from('cities')
        .update({ status: city.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } as any)
        .eq('id', city.id);

      if (updateError) throw updateError;
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update city');
    }
  }

  async function handleDelete(city: City) {
    if (!confirm(`Delete city "${city.city_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('cities')
        .delete()
        .eq('id', city.id);

      if (deleteError) throw deleteError;
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete city');
    }
  }

  function handleEdit(city: City) {
    setEditingCity(city);
    setFormData({
      city_name: city.city_name,
      state: city.state,
      zone_id: city.zone_id,
    });
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingCity(null);
    setFormData({ city_name: '', state: '', zone_id: '' });
    setError(null);
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
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>City Master</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>Manage cities and link them to zones</p>
        </div>
        <button
          onClick={() => {
            setEditingCity(null);
            setFormData({ city_name: '', state: '', zone_id: '' });
            setShowForm(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} />
          Add City
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

      {/* Cities Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>City</th>
              <th style={thStyle}>State</th>
              <th style={thStyle}>Zone</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map(city => (
              <tr key={city.id}>
                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-main)' }}>{city.city_name}</td>
                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{city.state}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                    fontSize: 'var(--font-xs)', fontWeight: 600,
                    background: '#3b82f618', color: '#3b82f6',
                  }}>
                    {city.zones?.zone_code || 'N/A'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleStatus(city)}
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
                      background: city.status === 'ACTIVE' ? '#10b98118' : 'var(--surface-2)',
                      color: city.status === 'ACTIVE' ? '#10b981' : 'var(--text-muted)',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {city.status}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(city)}
                      style={{
                        padding: '0.4rem', borderRadius: 'var(--radius-md)',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                      title="Edit city"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(city)}
                      style={{
                        padding: '0.4rem', borderRadius: 'var(--radius-md)',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                      title="Delete city"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cities.length === 0 && (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No cities found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal isOpen={true} onClose={handleCloseForm}>
          <div className="card" style={{ padding: 'var(--space-6)', maxWidth: '28rem', width: '100%', margin: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
              {editingCity ? 'Edit City' : 'Add New City'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                  City Name (required)
                </label>
                <input
                  type="text"
                  value={formData.city_name}
                  onChange={e => setFormData({ ...formData, city_name: e.target.value })}
                  placeholder="e.g., Mumbai"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                  State (required)
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Maharashtra"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                  Zone (required)
                </label>
                <select
                  value={formData.zone_id}
                  onChange={e => setFormData({ ...formData, zone_id: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.zone_code} - {zone.zone_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <button onClick={handleCloseForm} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
                {editingCity ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
