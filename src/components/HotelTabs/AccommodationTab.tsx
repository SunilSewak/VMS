import React, { useState, useEffect } from 'react';
import { Edit2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import type { Hotel, AccommodationInventory } from '../../features/venues/types';
import { getAccommodationByHotel, createAccommodation, updateAccommodation, deleteAccommodation } from '../../features/venues/venueService';
import { AccommodationInventoryEditor } from '../AccommodationInventoryEditor';

interface AccommodationTabProps {
  hotel: Hotel;
  onRefresh: () => void;
}

export function AccommodationTab({ hotel, onRefresh }: AccommodationTabProps) {
  const [inventory, setInventory] = useState<AccommodationInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingInventory, setEditingInventory] = useState<AccommodationInventory | null>(null);

  useEffect(() => {
    loadInventory();
  }, [hotel.id]);

  async function loadInventory() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccommodationByHotel(hotel.id);
      setInventory(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('Error loading accommodation:', err);
      setError('Failed to load accommodation inventory');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateClick() {
    setEditingInventory(null);
    setShowEditor(true);
  }

  function handleEditClick() {
    if (inventory) {
      setEditingInventory(inventory);
      setShowEditor(true);
    }
  }

  async function handleDeleteClick() {
    if (!inventory) return;
    if (!confirm('Are you sure you want to delete this accommodation inventory?')) return;

    try {
      await deleteAccommodation(inventory.id);
      setInventory(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting accommodation:', err);
      setError('Failed to delete accommodation inventory');
    }
  }

  async function handleFormComplete() {
    setShowEditor(false);
    setEditingInventory(null);
    await loadInventory();
    onRefresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading accommodation inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Accommodation Inventory</h3>
        {inventory ? (
          <div className="flex gap-2">
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Create Inventory
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Inventory Display */}
      {inventory ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Status Badge */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Inventory Configuration</h4>
              <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold gap-2 bg-green-100 text-green-800`}
            >
              <CheckCircle size={16} />
              Configured
            </span>
          </div>

          {/* Inventory Grid */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Total Rooms */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{inventory.total_rooms}</p>
              </div>

              {/* Single Rooms */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Single Rooms</p>
                <p className="text-3xl font-bold text-blue-600">{inventory.single_rooms || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {inventory.single_rooms && inventory.total_rooms 
                    ? `${((inventory.single_rooms / inventory.total_rooms) * 100).toFixed(0)}%`
                    : '-'}
                </p>
              </div>

              {/* Double Rooms */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Double Rooms</p>
                <p className="text-3xl font-bold text-green-600">{inventory.double_rooms || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {inventory.double_rooms && inventory.total_rooms 
                    ? `${((inventory.double_rooms / inventory.total_rooms) * 100).toFixed(0)}%`
                    : '-'}
                </p>
              </div>

              {/* Triple Rooms */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Triple Rooms</p>
                <p className="text-3xl font-bold text-purple-600">{inventory.triple_rooms || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {inventory.triple_rooms && inventory.total_rooms 
                    ? `${((inventory.triple_rooms / inventory.total_rooms) * 100).toFixed(0)}%`
                    : '-'}
                </p>
              </div>

              {/* Quad Rooms */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Quad Rooms</p>
                <p className="text-3xl font-bold text-orange-600">{inventory.quad_rooms || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {inventory.quad_rooms && inventory.total_rooms 
                    ? `${((inventory.quad_rooms / inventory.total_rooms) * 100).toFixed(0)}%`
                    : '-'}
                </p>
              </div>

              {/* Allocation Status */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Allocated</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(inventory.single_rooms || 0) + (inventory.double_rooms || 0) + (inventory.triple_rooms || 0) + (inventory.quad_rooms || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {inventory.total_rooms}
                </p>
              </div>
            </div>

            {/* Validation Check */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {((inventory.single_rooms || 0) + (inventory.double_rooms || 0) + (inventory.triple_rooms || 0) + (inventory.quad_rooms || 0)) === inventory.total_rooms ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">✓ Inventory allocation matches total rooms perfectly</p>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                  <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    ⚠ Inventory allocation ({(inventory.single_rooms || 0) + (inventory.double_rooms || 0) + (inventory.triple_rooms || 0) + (inventory.quad_rooms || 0)}) does not equal total rooms ({inventory.total_rooms})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Accommodation Inventory</h4>
          <p className="text-gray-600 mb-6">
            Create an accommodation inventory to specify room allocations by type.
          </p>
          <button
            onClick={handleCreateClick}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create Inventory Now
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <AccommodationInventoryEditor
          hotel={hotel}
          inventory={editingInventory}
          onClose={() => {
            setShowEditor(false);
            setEditingInventory(null);
          }}
          onComplete={handleFormComplete}
        />
      )}
    </div>
  );
}
