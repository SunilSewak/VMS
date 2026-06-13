import React, { useState } from 'react';
import type { Hall, HotelWithRelations, HallCreateInput, HallUpdateInput } from '../features/venues/types';
import { createHall, updateHall } from '../features/venues/venueService';

interface HallFormModalProps {
  hotel: HotelWithRelations;
  hall: Hall | null;
  onClose: () => void;
  onComplete: () => void;
}

export function HallFormModal({ hotel, hall, onClose, onComplete }: HallFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hall_name: hall?.hall_name || '',
    floor: (hall?.floor as string) || '',
    indoor_outdoor: (hall?.indoor_outdoor as string) || 'INDOOR',
    classroom_capacity: (hall?.classroom_capacity as number) || 0,
    u_shape_capacity: (hall?.u_shape_capacity as number) || 0,
    cluster_capacity: (hall?.cluster_capacity as number) || 0,
    status: (hall?.status as string) || 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const indoorOutdoorOptions = ['INDOOR', 'OUTDOOR', 'BOTH'];

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.hall_name.trim()) {
      newErrors.hall_name = 'Hall name is required';
    }

    // At least one seating capacity must be > 0
    const hasCapacity = 
      (formData.classroom_capacity || 0) > 0 ||
      (formData.u_shape_capacity || 0) > 0 ||
      (formData.cluster_capacity || 0) > 0;

    if (!hasCapacity) {
      newErrors.capacities = 'At least one seating capacity must be greater than 0';
    }

    // Validate no negative capacities
    if ((formData.classroom_capacity || 0) < 0) newErrors.classroom_capacity = 'Cannot be negative';
    if ((formData.u_shape_capacity || 0) < 0) newErrors.u_shape_capacity = 'Cannot be negative';
    if ((formData.cluster_capacity || 0) < 0) newErrors.cluster_capacity = 'Cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const input = {
        hotel_id: hotel.id,
        hall_name: formData.hall_name.trim(),
        floor: formData.floor || undefined,
        indoor_outdoor: formData.indoor_outdoor as any,
        classroom_capacity: (formData.classroom_capacity || 0) || undefined,
        u_shape_capacity: (formData.u_shape_capacity || 0) || undefined,
        cluster_capacity: (formData.cluster_capacity || 0) || undefined,
        status: formData.status as any,
      };

      if (hall?.id) {
        await updateHall(hall.id, input as HallUpdateInput);
      } else {
        await createHall(input as HallCreateInput);
      }

      onComplete();
    } catch (error) {
      console.error('Error saving hall:', error);
      alert('Failed to save hall');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {hall ? 'Edit Conference Room' : 'Add Conference Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 font-size-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Hall Name & Floor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conference Room Name *
              </label>
              <input
                type="text"
                value={formData.hall_name}
                onChange={(e) =>
                  setFormData({ ...formData, hall_name: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Hall A, Conference Room 1"
              />
              {errors.hall_name && (
                <p className="text-red-600 text-sm mt-1">{errors.hall_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floor
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Ground, 1st, 2nd"
              />
            </div>
          </div>

          {/* Row 2: Location Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type (Indoor / Outdoor) *
              </label>
              <select
                value={formData.indoor_outdoor}
                onChange={(e) =>
                  setFormData({ ...formData, indoor_outdoor: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {indoorOutdoorOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Row 3: Seating Capacities Header */}
          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Seating Capacities * (at least one must be &gt; 0)
            </h3>
            {errors.capacities && (
              <p className="text-red-600 text-sm mb-3">{errors.capacities}</p>
            )}
          </div>

          {/* Row 4: Seating Capacities - 3 Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Classroom Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.classroom_capacity || 0}
                onChange={(e) =>
                  setFormData({ ...formData, classroom_capacity: parseInt(e.target.value) || 0 })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.classroom_capacity && (
                <p className="text-red-600 text-xs mt-1">{errors.classroom_capacity}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Classroom-style with tables</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                U-Shape Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.u_shape_capacity || 0}
                onChange={(e) =>
                  setFormData({ ...formData, u_shape_capacity: parseInt(e.target.value) || 0 })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.u_shape_capacity && (
                <p className="text-red-600 text-xs mt-1">{errors.u_shape_capacity}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">U-shape configuration</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Cluster Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.cluster_capacity || 0}
                onChange={(e) =>
                  setFormData({ ...formData, cluster_capacity: parseInt(e.target.value) || 0 })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.cluster_capacity && (
                <p className="text-red-600 text-xs mt-1">{errors.cluster_capacity}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Multiple cluster groups</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Saving...' : hall ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
