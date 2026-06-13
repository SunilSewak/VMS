import React, { useState, useEffect } from 'react';
import type { AccommodationInventory, HotelWithRelations } from '../../features/venues/types';
import { getAccommodationByHotel, createAccommodation } from '../../features/venues/venueService';
import { supabase } from '../../lib/supabase';

interface AccommodationInventoryTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

export function AccommodationInventoryTab({ hotel, onRefresh }: AccommodationInventoryTabProps) {
  const [inventory, setInventory] = useState<AccommodationInventory[]>(
    hotel.accommodation_inventory || []
  );
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AccommodationInventory>>({});
  const [totalRooms, setTotalRooms] = useState<number>(
    (hotel.accommodation_inventory || []).reduce((sum, inv) => sum + inv.total_rooms, 0)
  );

  // Load accommodation data
  useEffect(() => {
    loadAccommodation();
  }, [hotel.id]);

  async function loadAccommodation() {
    try {
      setLoading(true);
      const data = await getAccommodationByHotel(hotel.id);
      setInventory(data);
      setTotalRooms(data.reduce((sum, inv) => sum + inv.total_rooms, 0));
    } catch (error) {
      console.error('Error loading accommodation:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(item: AccommodationInventory) {
    try {
      const updates = editValues[item.id!] || {};
      const updatedItem = { ...item, ...updates };

      // Validate total rooms
      const sumExcludingCurrent = inventory
        .filter(inv => inv.id !== item.id)
        .reduce((sum, inv) => sum + inv.total_rooms, 0);
      
      if (sumExcludingCurrent + updatedItem.total_rooms > (hotel.total_rooms || 9999)) {
        alert(`Total rooms cannot exceed hotel's total rooms (${hotel.total_rooms})`);
        return;
      }

      // Update in database
      const { error } = await supabase
        .from('hotel_accommodation_inventory')
        .update({
          total_rooms: updatedItem.total_rooms,
          available_rooms: updatedItem.available_rooms,
          single_bed: updatedItem.single_bed,
          double_bed: updatedItem.double_bed,
          occupancy: updatedItem.occupancy,
          rate_per_night: updatedItem.rate_per_night,
          status: updatedItem.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (error) throw error;

      setEditingId(null);
      setEditValues({});
      await loadAccommodation();
      onRefresh();
    } catch (error) {
      console.error('Error saving accommodation:', error);
      alert('Failed to save accommodation');
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('Are you sure you want to delete this room type?')) return;

    try {
      const { error } = await supabase
        .from('hotel_accommodation_inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await loadAccommodation();
      onRefresh();
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      alert('Failed to delete accommodation');
    }
  }

  // Check completeness
  const isComplete = inventory.length > 0 && inventory.every(inv => inv.rate_per_night && inv.rate_per_night > 0);
  const sumOfRooms = inventory.reduce((sum, inv) => sum + inv.total_rooms, 0);
  const isValid = !hotel.total_rooms || sumOfRooms <= hotel.total_rooms;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading accommodation inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Completeness Status */}
      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Accommodation Status</p>
          <p className="mt-1 text-lg font-semibold text-blue-900">
            {isComplete ? '✓ Complete' : '⚠ Incomplete'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Total Rooms Configured</p>
          <p className="mt-1 text-lg font-semibold text-blue-900">
            {sumOfRooms} {hotel.total_rooms ? `/ ${hotel.total_rooms}` : ''}
          </p>
        </div>
      </div>

      {!isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">
            ⚠ Warning: Total rooms ({sumOfRooms}) exceeds hotel's total rooms ({hotel.total_rooms})
          </p>
        </div>
      )}

      {/* Room Types Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Room Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Total
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Available
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Occupancy
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Rate/Night
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No accommodation inventory configured
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.room_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValues[item.id!]?.total_rooms ?? item.total_rooms}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [item.id!]: {
                              ...editValues[item.id!],
                              total_rooms: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      item.total_rooms
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValues[item.id!]?.available_rooms ?? item.available_rooms ?? item.total_rooms}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [item.id!]: {
                              ...editValues[item.id!],
                              available_rooms: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      item.available_rooms ?? item.total_rooms
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValues[item.id!]?.occupancy ?? item.occupancy}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [item.id!]: {
                              ...editValues[item.id!],
                              occupancy: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      item.occupancy
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValues[item.id!]?.rate_per_night ?? item.rate_per_night ?? ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [item.id!]: {
                              ...editValues[item.id!],
                              rate_per_night: parseFloat(e.target.value) || null,
                            },
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                        placeholder="0.00"
                      />
                    ) : (
                      item.rate_per_night ? `₹${item.rate_per_night.toFixed(2)}` : 'Not set'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleSave(item)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(item.id!);
                            setEditValues({ [item.id!]: item });
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
