import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import type { Hotel, AccommodationInventory } from '../features/venues/types';
import { createAccommodation, updateAccommodation } from '../features/venues/venueService';

interface AccommodationInventoryEditorProps {
  hotel: Hotel;
  inventory?: AccommodationInventory | null;
  onClose: () => void;
  onComplete: () => void;
}

export function AccommodationInventoryEditor({
  hotel,
  inventory,
  onClose,
  onComplete,
}: AccommodationInventoryEditorProps) {
  const isEditing = !!inventory;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    total_rooms: inventory?.total_rooms || 0,
    single_rooms: inventory?.single_rooms || 0,
    double_rooms: inventory?.double_rooms || 0,
    triple_rooms: inventory?.triple_rooms || 0,
    quad_rooms: inventory?.quad_rooms || 0,
  });

  // Calculate allocated rooms
  const allocatedRooms = 
    (formData.single_rooms || 0) + 
    (formData.double_rooms || 0) + 
    (formData.triple_rooms || 0) + 
    (formData.quad_rooms || 0);

  const isAllocationValid = allocatedRooms === formData.total_rooms;
  const allocationPercentage = formData.total_rooms > 0 
    ? Number(((allocatedRooms / formData.total_rooms) * 100).toFixed(0))
    : 0;

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    // Total rooms required and must be positive
    if (!formData.total_rooms || formData.total_rooms <= 0) {
      newErrors.total_rooms = 'Total rooms must be greater than 0';
    }

    // All inventory values must be non-negative
    if (formData.single_rooms < 0) {
      newErrors.single_rooms = 'Cannot be negative';
    }
    if (formData.double_rooms < 0) {
      newErrors.double_rooms = 'Cannot be negative';
    }
    if (formData.triple_rooms < 0) {
      newErrors.triple_rooms = 'Cannot be negative';
    }
    if (formData.quad_rooms < 0) {
      newErrors.quad_rooms = 'Cannot be negative';
    }

    // Inventory values cannot exceed total rooms
    if ((formData.single_rooms || 0) > formData.total_rooms) {
      newErrors.single_rooms = 'Cannot exceed total rooms';
    }
    if ((formData.double_rooms || 0) > formData.total_rooms) {
      newErrors.double_rooms = 'Cannot exceed total rooms';
    }
    if ((formData.triple_rooms || 0) > formData.total_rooms) {
      newErrors.triple_rooms = 'Cannot exceed total rooms';
    }
    if ((formData.quad_rooms || 0) > formData.total_rooms) {
      newErrors.quad_rooms = 'Cannot exceed total rooms';
    }

    // Total allocation should equal total rooms
    if (allocatedRooms !== formData.total_rooms) {
      newErrors.allocation = `Total allocation (${allocatedRooms}) must equal total rooms (${formData.total_rooms})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hotel_id: hotel.id,
        total_rooms: formData.total_rooms,
        single_rooms: formData.single_rooms || 0,
        double_rooms: formData.double_rooms || 0,
        triple_rooms: formData.triple_rooms || 0,
        quad_rooms: formData.quad_rooms || 0,
      };

      if (isEditing && inventory) {
        await updateAccommodation(inventory.id, payload);
      } else {
        await createAccommodation(payload);
      }

      onComplete();
    } catch (error) {
      console.error('Error saving accommodation:', error);
      setErrors({ submit: 'Failed to save accommodation inventory. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: string, value: any) {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? 0 : parseInt(value) || 0,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Accommodation Inventory' : 'Create Accommodation Inventory'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Hotel Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">{hotel.hotel_name}</p>
            <p className="text-xs text-blue-600">{hotel.city?.city_name || 'City not specified'}</p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Total Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Rooms <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.total_rooms}
              onChange={(e) => handleInputChange('total_rooms', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.total_rooms ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.total_rooms && <p className="text-red-500 text-xs mt-1">{errors.total_rooms}</p>}
          </div>

          {/* Room Type Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Single Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Single Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.single_rooms}
                onChange={(e) => handleInputChange('single_rooms', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.single_rooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.single_rooms && <p className="text-red-500 text-xs mt-1">{errors.single_rooms}</p>}
            </div>

            {/* Double Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Double Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.double_rooms}
                onChange={(e) => handleInputChange('double_rooms', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.double_rooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.double_rooms && <p className="text-red-500 text-xs mt-1">{errors.double_rooms}</p>}
            </div>

            {/* Triple Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Triple Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.triple_rooms}
                onChange={(e) => handleInputChange('triple_rooms', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.triple_rooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.triple_rooms && <p className="text-red-500 text-xs mt-1">{errors.triple_rooms}</p>}
            </div>

            {/* Quad Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quad Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.quad_rooms}
                onChange={(e) => handleInputChange('quad_rooms', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quad_rooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.quad_rooms && <p className="text-red-500 text-xs mt-1">{errors.quad_rooms}</p>}
            </div>
          </div>

          {/* Allocation Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Total Allocated</p>
              <p className="text-2xl font-bold text-gray-900">{allocatedRooms}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAllocationValid ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {allocationPercentage}% of {formData.total_rooms} total rooms
            </p>

            {isAllocationValid ? (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded flex gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">✓ Perfect allocation match</p>
              </div>
            ) : (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex gap-2">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">Allocation ({allocatedRooms}) does not match total ({formData.total_rooms})</p>
              </div>
            )}
          </div>

          {/* Allocation Error */}
          {errors.allocation && (
            <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{errors.allocation}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isAllocationValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
