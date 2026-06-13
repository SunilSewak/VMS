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
    hall_type: (hall?.hall_type as string) || 'BALLROOM',
    indoor_outdoor: (hall?.indoor_outdoor as string) || 'INDOOR',
    area: (hall?.area as string | number) || '',
    length: (hall?.length as string | number) || '',
    width: (hall?.width as string | number) || '',
    height: (hall?.height as string | number) || '',
    capacity: (hall?.capacity as string | number) || '',
    theater_capacity: (hall?.theater_capacity as string | number) || '',
    classroom_capacity: (hall?.classroom_capacity as string | number) || '',
    round_table_capacity: (hall?.round_table_capacity as string | number) || '',
    cocktail_capacity: (hall?.cocktail_capacity as string | number) || '',
    status: (hall?.status as string) || 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const hallTypes = ['BALLROOM', 'CONFERENCE', 'BANQUET', 'BOARDROOM', 'THEATRE', 'OTHER'];
  const indoorOutdoorOptions = ['INDOOR', 'OUTDOOR', 'BOTH'];

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.hall_name.trim()) {
      newErrors.hall_name = 'Hall name is required';
    }

    if (!formData.area && !formData.theater_capacity && !formData.classroom_capacity) {
      newErrors.capacity = 'At least one capacity measure is required';
    }

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
        hall_type: formData.hall_type as any,
        indoor_outdoor: formData.indoor_outdoor as any,
        area: formData.area ? parseInt(String(formData.area)) : undefined,
        length: formData.length ? parseFloat(String(formData.length)) : undefined,
        width: formData.width ? parseFloat(String(formData.width)) : undefined,
        height: formData.height ? parseFloat(String(formData.height)) : undefined,
        capacity: formData.capacity ? parseInt(String(formData.capacity)) : undefined,
        theater_capacity: formData.theater_capacity ? parseInt(String(formData.theater_capacity)) : undefined,
        classroom_capacity: formData.classroom_capacity ? parseInt(String(formData.classroom_capacity)) : undefined,
        round_table_capacity: formData.round_table_capacity ? parseInt(String(formData.round_table_capacity)) : undefined,
        cocktail_capacity: formData.cocktail_capacity ? parseInt(String(formData.cocktail_capacity)) : undefined,
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
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {hall ? 'Edit Hall' : 'Add New Hall'}
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
          {/* Row 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hall Name *
              </label>
              <input
                type="text"
                value={formData.hall_name}
                onChange={(e) =>
                  setFormData({ ...formData, hall_name: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Grand Ballroom"
              />
              {errors.hall_name && (
                <p className="text-red-600 text-sm mt-1">{errors.hall_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hall Type
              </label>
              <select
                value={formData.hall_type}
                onChange={(e) =>
                  setFormData({ ...formData, hall_type: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {hallTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Indoor / Outdoor
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

          {/* Row 3: Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Area (sq.ft)
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Length (ft)
              </label>
              <input
                type="number"
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Width (ft)
              </label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Height (ft)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 4: Seating Capacities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Seating Capacities (at least one required)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  General Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Theatre
                </label>
                <input
                  type="number"
                  value={formData.theater_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, theater_capacity: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Classroom
                </label>
                <input
                  type="number"
                  value={formData.classroom_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, classroom_capacity: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Round Table
                </label>
                <input
                  type="number"
                  value={formData.round_table_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, round_table_capacity: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Cocktail
                </label>
                <input
                  type="number"
                  value={formData.cocktail_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, cocktail_capacity: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            {errors.capacity && (
              <p className="text-red-600 text-sm mt-2">{errors.capacity}</p>
            )}
          </div>

          {/* Row 5: Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
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
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
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
              {loading ? 'Saving...' : hall ? 'Update Hall' : 'Create Hall'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
