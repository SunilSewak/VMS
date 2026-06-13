import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

      // Load zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('zone_code', { ascending: true });

      if (zonesError) throw zonesError;
      setZones(zonesData || []);

      // Load cities with zone info
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
        // Update existing
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
        // Create new
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
          <h2 className="text-2xl font-bold text-gray-900">City Master</h2>
          <p className="text-gray-600 text-sm mt-1">Manage cities and link them to zones</p>
        </div>
        <button
          onClick={() => {
            setEditingCity(null);
            setFormData({ city_name: '', state: '', zone_id: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add City
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

      {/* Cities Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">City</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">State</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Zone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cities.map(city => (
              <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{city.city_name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{city.state}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {city.zones?.zone_code || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(city)}
                    className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 transition-colors ${
                      city.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {city.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(city)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                      title="Edit city"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(city)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600"
                      title="Delete city"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cities.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No cities found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCity ? 'Edit City' : 'Add New City'}
            </h3>

            <div className="space-y-4">
              {/* City Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City Name (required)
                </label>
                <input
                  type="text"
                  value={formData.city_name}
                  onChange={e => setFormData({ ...formData, city_name: e.target.value })}
                  placeholder="e.g., Mumbai"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State (required)
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Maharashtra"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone (required)
                </label>
                <select
                  value={formData.zone_id}
                  onChange={e => setFormData({ ...formData, zone_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                {editingCity ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
