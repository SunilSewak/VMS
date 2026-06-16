import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Hotel, HotelCreateInput, HotelUpdateInput, City } from '../features/venues/types';
import { HOTEL_CATEGORY_OPTIONS } from '../features/venues/types';
import { createHotel, updateHotel } from '../features/venues/venueService';
import { fetchCities } from '../features/venues/api';
import { Modal } from './Modal';

interface HotelFormModalProps {
  hotel?: Hotel | null;
  onClose: () => void;
  onComplete: () => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--font-sm)',
  fontWeight: 600,
  color: 'var(--text-main)',
  marginBottom: 'var(--space-2)',
};

const errStyle: React.CSSProperties = {
  color: 'var(--status-error)',
  fontSize: 'var(--font-xs)',
  marginTop: 'var(--space-1)',
};

const requiredMark: React.CSSProperties = {
  color: 'var(--status-error)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'var(--space-4)',
};

const fullRow: React.CSSProperties = {
  gridColumn: '1 / -1',
};

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
    <Modal isOpen={true} onClose={onClose}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)' }}>
            {isEditing ? 'Edit Hotel' : 'Create New Hotel'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
          {errors.submit && (
            <div style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', gap: 'var(--space-3)',
            }}>
              <AlertCircle size={20} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: 'var(--status-error)', fontSize: 'var(--font-sm)', margin: 0 }}>{errors.submit}</p>
            </div>
          )}

          {/* SECTION A: BASIC INFORMATION */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '2px solid var(--border)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>📋 Basic Information</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>Hotel name, brand, category, and location</p>
            </div>

            <div style={gridStyle}>
              {/* Hotel Name */}
              <div style={fullRow}>
                <label style={labelStyle}>
                  Hotel Name <span style={requiredMark}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotel_name}
                  onChange={(e) => handleInputChange('hotel_name', e.target.value)}
                  placeholder="e.g., The Grand Hotel"
                  className="input"
                  style={{ width: '100%', borderColor: errors.hotel_name ? 'var(--status-error)' : undefined }}
                />
                {errors.hotel_name && (
                  <p style={errStyle}>{errors.hotel_name}</p>
                )}
              </div>

              {/* Hotel Brand */}
              <div>
                <label style={labelStyle}>
                  Hotel Brand <span style={requiredMark}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotel_brand}
                  onChange={(e) => handleInputChange('hotel_brand', e.target.value)}
                  placeholder="e.g., ITC, Marriott"
                  className="input"
                  style={{ width: '100%', borderColor: errors.hotel_brand ? 'var(--status-error)' : undefined }}
                />
                {errors.hotel_brand && (
                  <p style={errStyle}>{errors.hotel_brand}</p>
                )}
              </div>

              {/* Hotel Category */}
              <div>
                <label style={labelStyle}>
                  Hotel Category <span style={requiredMark}>*</span>
                </label>
                <select
                  value={(formData.hotel_category || '') as string}
                  onChange={(e) => handleInputChange('hotel_category', (e.target.value || null) as any)}
                  className="input"
                  style={{ width: '100%', borderColor: errors.hotel_category ? 'var(--status-error)' : undefined }}
                >
                  <option value="">Select Category</option>
                  {HOTEL_CATEGORY_OPTIONS.map(option => (
                    <option key={option.value as unknown as string} value={option.value as unknown as string}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.hotel_category && (
                  <p style={errStyle}>{errors.hotel_category}</p>
                )}
              </div>

              {/* Zone */}
              <div>
                <label style={labelStyle}>
                  Zone <span style={requiredMark}>*</span>
                </label>
                <select
                  value={formData.zone_id}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="input"
                  style={{ width: '100%', borderColor: errors.zone_id ? 'var(--status-error)' : undefined }}
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
                  <p style={errStyle}>{errors.zone_id}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label style={labelStyle}>
                  City <span style={requiredMark}>*</span>
                </label>
                <select
                  value={formData.city_id}
                  onChange={(e) => handleInputChange('city_id', e.target.value)}
                  disabled={!formData.zone_id || citiesLoading}
                  className="input"
                  style={{ width: '100%', borderColor: errors.city_id ? 'var(--status-error)' : undefined }}
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
                  <p style={errStyle}>{errors.city_id}</p>
                )}
              </div>

              {/* Address */}
              <div style={fullRow}>
                <label style={labelStyle}>
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter hotel address"
                  rows={2}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              {/* GST Number */}
              <div>
                <label style={labelStyle}>
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gst_number}
                  onChange={(e) => handleInputChange('gst_number', e.target.value)}
                  placeholder="e.g., 27ABCDE1234F1Z5"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Website */}
              <div>
                <label style={labelStyle}>
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="e.g., www.hotel.com"
                  className="input"
                  style={{ width: '100%', borderColor: errors.website ? 'var(--status-error)' : undefined }}
                />
                {errors.website && (
                  <p style={errStyle}>{errors.website}</p>
                )}
              </div>

              {/* Latitude */}
              <div>
                <label style={labelStyle}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="e.g., 19.0760"
                  className="input"
                  style={{ width: '100%', borderColor: errors.latitude ? 'var(--status-error)' : undefined }}
                />
                {errors.latitude && (
                  <p style={errStyle}>{errors.latitude}</p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label style={labelStyle}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="e.g., 72.8856"
                  className="input"
                  style={{ width: '100%', borderColor: errors.longitude ? 'var(--status-error)' : undefined }}
                />
                {errors.longitude && (
                  <p style={errStyle}>{errors.longitude}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>
                  Status <span style={requiredMark}>*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION B: SALES CONTACT INFORMATION */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '2px solid var(--border)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>👤 Sales Contact Information</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>Primary contact for venue coordination</p>
            </div>

            <div style={gridStyle}>
              {/* Sales Contact Name */}
              <div>
                <label style={labelStyle}>
                  Contact Name <span style={requiredMark}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.sales_contact_name}
                  onChange={(e) => handleInputChange('sales_contact_name', e.target.value)}
                  placeholder="e.g., John Smith"
                  className="input"
                  style={{ width: '100%', borderColor: errors.sales_contact_name ? 'var(--status-error)' : undefined }}
                />
                {errors.sales_contact_name && (
                  <p style={errStyle}>{errors.sales_contact_name}</p>
                )}
              </div>

              {/* Sales Contact Designation */}
              <div>
                <label style={labelStyle}>
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.sales_contact_designation}
                  onChange={(e) => handleInputChange('sales_contact_designation', e.target.value)}
                  placeholder="e.g., Sales Manager"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Sales Contact Mobile */}
              <div>
                <label style={labelStyle}>
                  Mobile Number <span style={requiredMark}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.sales_contact_mobile}
                  onChange={(e) => handleInputChange('sales_contact_mobile', e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="input"
                  style={{ width: '100%', borderColor: errors.sales_contact_mobile ? 'var(--status-error)' : undefined }}
                />
                {errors.sales_contact_mobile && (
                  <p style={errStyle}>{errors.sales_contact_mobile}</p>
                )}
              </div>

              {/* Sales Contact Email */}
              <div>
                <label style={labelStyle}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.sales_contact_email}
                  onChange={(e) => handleInputChange('sales_contact_email', e.target.value)}
                  placeholder="e.g., john@hotel.com"
                  className="input"
                  style={{ width: '100%', borderColor: errors.sales_contact_email ? 'var(--status-error)' : undefined }}
                />
                {errors.sales_contact_email && (
                  <p style={errStyle}>{errors.sales_contact_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION C: OPERATIONAL INFORMATION */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '2px solid var(--border)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>⚙️ Operational Information</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>Business rules and preferences</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Preferred Vendor */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
              }}>
                <input
                  type="checkbox"
                  id="preferred_vendor"
                  checked={formData.preferred_vendor}
                  onChange={(e) => handleInputChange('preferred_vendor', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="preferred_vendor" style={{ flex: 1, fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)' }}>
                  Preferred Vendor
                </label>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>Mark as preferred for priority selection</p>
              </div>

              {/* Blacklisted */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'color-mix(in srgb, var(--status-error) 8%, transparent)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid color-mix(in srgb, var(--status-error) 25%, transparent)',
              }}>
                <input
                  type="checkbox"
                  id="blacklisted"
                  checked={formData.blacklisted}
                  onChange={(e) => handleInputChange('blacklisted', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--status-error)' }}
                />
                <label htmlFor="blacklisted" style={{ flex: 1, fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)' }}>
                  Blacklisted
                </label>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>Exclude from future venue selection</p>
              </div>

              {/* Remarks */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 'var(--space-2)' }}>
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Add any additional notes or observations about this hotel..."
                  rows={3}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end',
            borderTop: '1px solid var(--border)', paddingTop: 'var(--space-6)',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              {loading && <div style={{
                width: '16px', height: '16px',
                border: '2px solid transparent',
                borderBottomColor: 'var(--text-on-primary)',
                borderRadius: 'var(--radius-full)',
                animation: 'spin 0.6s linear infinite',
              }}></div>}
              {isEditing ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
