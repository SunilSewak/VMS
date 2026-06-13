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
        // Update existing
        const { error: updateError } = await supabase
          .from('zones')
          .update({
            zone_name: formData.zone_name,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', editingZone.id);

        if (updateError) throw updateError;
      } else {
        // Create new
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zone Master</h2>
          <p className="text-gray-600 text-sm mt-1">Manage geographical zones and their status</p>
        </div>
        <button
          onClick={() => {
            setEditingZone(null);
            setFormData({ zone_code: '', zone_name: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Zones Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Created</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {zones.map(zone => (
              <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{zone.zone_code}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{zone.zone_name}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(zone)}
                    className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 transition-colors ${
                      zone.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {zone.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(zone.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                      title="Edit zone"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600"
                      title="Delete zone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {zones.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No zones found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingZone ? 'Edit Zone' : 'Add New Zone'}
            </h3>

            <div className="space-y-4">
              {/* Zone Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Code {editingZone ? '(read-only)' : '(required)'}
                </label>
                <input
                  type="text"
                  value={formData.zone_code}
                  onChange={e => setFormData({ ...formData, zone_code: e.target.value.toUpperCase() })}
                  disabled={!!editingZone}
                  placeholder="e.g., NORTH"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>

              {/* Zone Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name (required)
                </label>
                <input
                  type="text"
                  value={formData.zone_name}
                  onChange={e => setFormData({ ...formData, zone_name: e.target.value })}
                  placeholder="e.g., North Region"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseForm}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
              >
                {editingZone ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
