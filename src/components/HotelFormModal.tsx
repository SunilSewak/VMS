import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Hotel, HotelCreateInput, HotelUpdateInput, City } from '../features/venues/types';
import { HOTEL_CATEGORY_OPTIONS } from '../features/venues/types';
import { createHotel, updateHotel } from '../features/venues/venueService';
import { fetchCities } from '../features/venues/api';

interface HotelFormModalProps {
  hotel?: Hotel | null;
  onClose: () => void;
  onComplete: () => void;
}

export function HotelFormModal({ hotel, onClose, onComplete }: HotelFormModalProps) {
  const isEditing = !!hotel;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>(hotel?.zone_id || '');

  // Form state
  const [formData, setFormData] = useState({
    // Section A: Basic Information
    hotel_name: hotel?.hotel_name || '',
    hotel_brand: hotel?.hotel_brand || '',
    hotel_category: hotel?.hotel_category || '',
    zone_id: hotel?.zone_id || '',
    city_id: hotel?.city_id || '',
    address: hotel?.address || '',
    gst_number: hotel?.gst_number || '',
    website: hotel?.website || '',
    latitude: hotel?.latitude || '',
    longitude: hotel?.longitude || '',
    status: hotel?.status || 'ACTIVE',
    
    // Section B: Sales Contact Information
    sales_contact_name: hotel?.sales_contact_name || '',
    sales_contact_designation: hotel?.sales_contact_designation || '',
    sales_contact_mobile: hotel?.sales_contact_mobile || '',
    sales_contact_email: hotel?.sales_contact_email || '',
    
    // Section C: Operational Information
    preferred_vendor: hotel?.preferred_vendor || false,
    blacklisted: hotel?.blacklisted || false,
    remarks: hotel?.remarks || '',
  });

  // Load cities on mount
  useEffect(() => {
    loadCities();
  }, []);

  async function loadCities() {
    try {
      setCitiesLoading(true);
      const data = await fetchCities();
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setCitiesLoading(false);
    }
  }

  // Get filtered cities based on selected zone
  const filteredCities = selectedZone
    ? cities.filter(c => c.zone_id === selectedZone)
    : [];

  // Validation functions
  function validateEmail(email: string): boolean {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone: string): boolean {
    if (!phone) return true; // Optional field for contact_phone
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    // Section A: Basic Information
    if (!formData.hotel_name.trim()) {
      newErrors.hotel_name = 'Hotel name is required';
    }
    if (!formData.hotel_brand.trim()) {
      newErrors.hotel_brand = 'Hotel brand is required';
    }
    if (!formData.hotel_category) {
      newErrors.hotel_category = 'Hotel category is required';
    }
    if (!formData.zone_id) {
      newErrors.zone_id = 'Zone is required';
    }
    if (!formData.city_id) {
      newErrors.city_id = 'City is required';
    }

    // Section B: Sales Contact Information
    if (!formData.sales_contact_name.trim()) {
      newErrors.sales_contact_name = 'Contact name is required';
    }
    if (!formData.sales_contact_mobile.trim()) {
      newErrors.sales_contact_mobile = 'Mobile number is required';
    } else if (!validatePhone(formData.sales_contact_mobile)) {
      newErrors.sales_contact_mobile = 'Mobile number must be at least 10 digits';
    }
    
    if (formData.sales_contact_email && !validateEmail(formData.sales_contact_email)) {
      newErrors.sales_contact_email = 'Invalid email format';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }

    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function isValidUrl(url: string): boolean {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `http://${url}`);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && hotel) {
        // Update existing hotel
        const updateData: HotelUpdateInput = {
          hotel_name: formData.hotel_name.trim(),
          hotel_brand: formData.hotel_brand.trim() || null,
          hotel_category: (formData.hotel_category as any) || null,
          zone_id: formData.zone_id || null,
          city_id: formData.city_id,
          address: formData.address.trim() || null,
          gst_number: formData.gst_number.trim() || null,
          website: formData.website.trim() || null,
          latitude: formData.latitude ? Number(formData.latitude) : null,
          longitude: formData.longitude ? Number(formData.longitude) : null,
          sales_contact_name: formData.sales_contact_name.trim() || null,
          sales_contact_designation: formData.sales_contact_designation.trim() || null,
          sales_contact_mobile: formData.sales_contact_mobile.trim() || null,
          sales_contact_email: formData.sales_contact_email.trim() || null,
          preferred_vendor: formData.preferred_vendor,
          blacklisted: formData.blacklisted,
          remarks: formData.remarks.trim() || null,
          status: formData.status as any,
        };

        await updateHotel(hotel.id, updateData);
      } else {
        // Create new hotel
        const createData: HotelCreateInput = {
          hotel_name: formData.hotel_name.trim(),
          hotel_brand: formData.hotel_brand.trim() || undefined,
          hotel_category: (formData.hotel_category as any) || undefined,
          zone_id: formData.zone_id || undefined,
          city_id: formData.city_id,
          address: formData.address.trim() || undefined,
          gst_number: formData.gst_number.trim() || undefined,
          website: formData.website.trim() || undefined,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude ? Number(formData.longitude) : undefined,
          sales_contact_name: formData.sales_contact_name.trim() || undefined,
          sales_contact_designation: formData.sales_contact_designation.trim() || undefined,
          sales_contact_mobile: formData.sales_contact_mobile.trim() || undefined,
          sales_contact_email: formData.sales_contact_email.trim() || undefined,
          preferred_vendor: formData.preferred_vendor,
          blacklisted: formData.blacklisted,
          remarks: formData.remarks.trim() || undefined,
          status: formData.status as any,
        };

        await createHotel(createData);
      }

      onComplete();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save hotel. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: string, value: any) {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  function handleZoneChange(zoneId: string) {
    handleInputChange('zone_id', zoneId);
    setSelectedZone(zoneId);
    // Reset city selection
    handleInputChange('city_id', '');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Hotel' : 'Create New Hotel'}
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
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* SECTION A: BASIC INFORMATION (Blue) */}
          <div className="mb-8">
            <div className="mb-4 pb-3 border-b-2 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900">📋 Basic Information</h3>
              <p className="text-sm text-blue-700">Hotel name, brand, category, and location</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Hotel Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotel_name}
                  onChange={(e) => handleInputChange('hotel_name', e.target.value)}
                  placeholder="e.g., The Grand Hotel"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotel_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hotel_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.hotel_name}</p>
                )}
              </div>

              {/* Hotel Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotel_brand}
                  onChange={(e) => handleInputChange('hotel_brand', e.target.value)}
                  placeholder="e.g., ITC, Marriott"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotel_brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hotel_brand && (
                  <p className="text-red-500 text-xs mt-1">{errors.hotel_brand}</p>
                )}
              </div>

              {/* Hotel Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={(formData.hotel_category || '') as string}
                  onChange={(e) => handleInputChange('hotel_category', (e.target.value || null) as any)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotel_category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {HOTEL_CATEGORY_OPTIONS.map(option => (
                    <option key={option.value as unknown as string} value={option.value as unknown as string}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.hotel_category && (
                  <p className="text-red-500 text-xs mt-1">{errors.hotel_category}</p>
                )}
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.zone_id}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.zone_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Zone</option>
                  {/* Zones from cities */}
                  {Array.from(new Set(cities.map(c => c.zone_id).filter(Boolean))).map(zone => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
                {errors.zone_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.zone_id}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city_id}
                  onChange={(e) => handleInputChange('city_id', e.target.value)}
                  disabled={!formData.zone_id || citiesLoading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.city_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">
                    {!formData.zone_id ? 'Select zone first' : citiesLoading ? 'Loading cities...' : 'Select City'}
                  </option>
                  {filteredCities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
                {errors.city_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>
                )}
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter hotel address"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gst_number}
                  onChange={(e) => handleInputChange('gst_number', e.target.value)}
                  placeholder="e.g., 27ABCDE1234F1Z5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="e.g., www.hotel.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.website && (
                  <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                )}
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="e.g., 19.0760"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.latitude ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.latitude && (
                  <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="e.g., 72.8856"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.longitude ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.longitude && (
                  <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION B: SALES CONTACT INFORMATION (Green) */}
          <div className="mb-8">
            <div className="mb-4 pb-3 border-b-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-900">👤 Sales Contact Information</h3>
              <p className="text-sm text-green-700">Primary contact for venue coordination</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sales Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sales_contact_name}
                  onChange={(e) => handleInputChange('sales_contact_name', e.target.value)}
                  placeholder="e.g., John Smith"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.sales_contact_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sales_contact_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.sales_contact_name}</p>
                )}
              </div>

              {/* Sales Contact Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.sales_contact_designation}
                  onChange={(e) => handleInputChange('sales_contact_designation', e.target.value)}
                  placeholder="e.g., Sales Manager"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Sales Contact Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.sales_contact_mobile}
                  onChange={(e) => handleInputChange('sales_contact_mobile', e.target.value)}
                  placeholder="e.g., 9876543210"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.sales_contact_mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sales_contact_mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.sales_contact_mobile}</p>
                )}
              </div>

              {/* Sales Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.sales_contact_email}
                  onChange={(e) => handleInputChange('sales_contact_email', e.target.value)}
                  placeholder="e.g., john@hotel.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.sales_contact_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sales_contact_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.sales_contact_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION C: OPERATIONAL INFORMATION (Purple) */}
          <div className="mb-8">
            <div className="mb-4 pb-3 border-b-2 border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900">⚙️ Operational Information</h3>
              <p className="text-sm text-purple-700">Business rules and preferences</p>
            </div>

            <div className="space-y-4">
              {/* Preferred Vendor */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="preferred_vendor"
                  checked={formData.preferred_vendor}
                  onChange={(e) => handleInputChange('preferred_vendor', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="preferred_vendor" className="flex-1 text-sm font-medium text-gray-700">
                  Preferred Vendor
                </label>
                <p className="text-xs text-gray-600">Mark as preferred for priority selection</p>
              </div>

              {/* Blacklisted */}
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <input
                  type="checkbox"
                  id="blacklisted"
                  checked={formData.blacklisted}
                  onChange={(e) => handleInputChange('blacklisted', e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <label htmlFor="blacklisted" className="flex-1 text-sm font-medium text-gray-700">
                  Blacklisted
                </label>
                <p className="text-xs text-gray-600">Exclude from future venue selection</p>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Add any additional notes or observations about this hotel..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isEditing ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
