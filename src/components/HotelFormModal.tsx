import React, { useState, useEffect } from 'react';
import type { Hotel, HotelCreateInput, HotelUpdateInput } from '../features/venues/types';
import { createHotel, updateHotel } from '../features/venues/venueService';
import { supabase } from '../lib/supabase';

interface HotelFormModalProps {
  hotel: Hotel | null;
  onClose: () => void;
  onComplete: () => void;
}

interface City {
  id: string;
  city_name: string;
  zone_id: string;
}

interface Zone {
  id: string;
  zone_name: string;
  zone_code: string;
}

export function HotelFormModal({ hotel, onClose, onComplete }: HotelFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Section A: Basic Information
    hotel_name: hotel?.hotel_name || '',
    city_id: hotel?.city_id || '',
    address: hotel?.address || '',

    // Section B: Contact Information
    contact_phone: hotel?.contact_phone || '',
    contact_email: hotel?.contact_email || '',

    // Section C: Operational Information
    website: hotel?.website || '',
    total_rooms: hotel?.total_rooms?.toString() || '',
    check_in_time: hotel?.check_in_time || '14:00',
    check_out_time: hotel?.check_out_time || '11:00',

    // Section D: Venue Capability
    status: hotel?.status || 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load cities and zones
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setCitiesLoading(true);

      // Load zones
      const { data: zonesData } = await supabase
        .from('zones')
        .select('id, zone_name, zone_code')
        .eq('status', 'ACTIVE')
        .order('zone_code');
      setZones(zonesData || []);

      // Load cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('id, city_name, zone_id')
        .eq('status', 'ACTIVE')
        .order('city_name');
      setCities(citiesData || []);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setCitiesLoading(false);
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.hotel_name.trim()) {
      newErrors.hotel_name = 'Hotel name is required';
    }

    if (!formData.city_id) {
      newErrors.city_id = 'City is required';
    }

    if (formData.contact_email && !isValidEmail(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address';
    }

    if (formData.contact_phone && !isValidPhone(formData.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone: string): boolean {
    return /^\d{10}/.test(phone.replace(/\D/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const input: any = {
        hotel_name: formData.hotel_name.trim(),
        city_id: formData.city_id,
        address: formData.address.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        website: formData.website.trim() || undefined,
        total_rooms: formData.total_rooms ? parseInt(formData.total_rooms) : undefined,
        check_in_time: formData.check_in_time || undefined,
        check_out_time: formData.check_out_time || undefined,
        status: formData.status as any,
      };

      if (hotel?.id) {
        await updateHotel(hotel.id, input);
      } else {
        await createHotel(input);
      }

      onComplete();
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('Failed to save hotel');
    } finally {
      setLoading(false);
    }
  }

  if (citiesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {hotel ? 'Edit Hotel' : 'Create New Hotel'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION A: Basic Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    value={formData.hotel_name}
                    onChange={(e) =>
                      setFormData({ ...formData, hotel_name: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Grand Hotel"
                  />
                  {errors.hotel_name && (
                    <p className="text-red-600 text-sm mt-1">{errors.hotel_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <select
                    value={formData.city_id}
                    onChange={(e) =>
                      setFormData({ ...formData, city_id: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a city</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.city_name}
                      </option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.city_id}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={2}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hotel address"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: Contact Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10-digit phone number"
                />
                {errors.contact_phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.contact_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="hotel@example.com"
                />
                {errors.contact_email && (
                  <p className="text-red-600 text-sm mt-1">{errors.contact_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION C: Operational Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Operational Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Rooms
                  </label>
                  <input
                    type="number"
                    value={formData.total_rooms}
                    onChange={(e) =>
                      setFormData({ ...formData, total_rooms: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) =>
                      setFormData({ ...formData, check_in_time: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) =>
                      setFormData({ ...formData, check_out_time: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: Venue Capability */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Venue Status
            </h3>
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
              {loading ? 'Saving...' : hotel ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
