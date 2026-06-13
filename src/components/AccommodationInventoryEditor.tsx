import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import type { Hotel, AccommodationInventory } from '../features/venues/types';
import { createAccommodation, updateAccommodation } from '../features/venues/venueService';

interface AccommodationInventoryEditorProps {
  hotel: Hotel;
  inventory?: AccommodationInventory | null;
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-on-primary)' }}>
            {isEditing ? 'Edit Accommodation Inventory' : 'Create Accommodation Inventory'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-on-primary)',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Hotel Info */}
          <div style={{
            padding: 'var(--space-4)',
            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
          }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)', fontWeight: 600 }}>{hotel.hotel_name}</p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{hotel.city?.city_name || 'City not specified'}</p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              padding: 'var(--space-4)',
              background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--status-error) 25%, transparent)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', gap: 'var(--space-3)',
            }}>
              <AlertCircle size={20} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: 'var(--status-error)', fontSize: 'var(--font-sm)' }}>{errors.submit}</p>
            </div>
          )}

          {/* Total Rooms */}
          <div>
            <label style={labelStyle}>
              Total Rooms <span style={{ color: 'var(--status-error)' }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.total_rooms}
              onChange={(e) => handleInputChange('total_rooms', e.target.value)}
              className="input"
              style={{ width: '100%', borderColor: errors.total_rooms ? 'var(--status-error)' : undefined }}
            />
            {errors.total_rooms && <p style={errStyle}>{errors.total_rooms}</p>}
          </div>

          {/* Room Type Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
            {/* Single Rooms */}
            <div>
              <label style={labelStyle}>
                Single Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.single_rooms}
                onChange={(e) => handleInputChange('single_rooms', e.target.value)}
                className="input"
                style={{ width: '100%', borderColor: errors.single_rooms ? 'var(--status-error)' : undefined }}
              />
              {errors.single_rooms && <p style={errStyle}>{errors.single_rooms}</p>}
            </div>

            {/* Double Rooms */}
            <div>
              <label style={labelStyle}>
                Double Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.double_rooms}
                onChange={(e) => handleInputChange('double_rooms', e.target.value)}
                className="input"
                style={{ width: '100%', borderColor: errors.double_rooms ? 'var(--status-error)' : undefined }}
              />
              {errors.double_rooms && <p style={errStyle}>{errors.double_rooms}</p>}
            </div>

            {/* Triple Rooms */}
            <div>
              <label style={labelStyle}>
                Triple Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.triple_rooms}
                onChange={(e) => handleInputChange('triple_rooms', e.target.value)}
                className="input"
                style={{ width: '100%', borderColor: errors.triple_rooms ? 'var(--status-error)' : undefined }}
              />
              {errors.triple_rooms && <p style={errStyle}>{errors.triple_rooms}</p>}
            </div>

            {/* Quad Rooms */}
            <div>
              <label style={labelStyle}>
                Quad Rooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.quad_rooms}
                onChange={(e) => handleInputChange('quad_rooms', e.target.value)}
                className="input"
                style={{ width: '100%', borderColor: errors.quad_rooms ? 'var(--status-error)' : undefined }}
              />
              {errors.quad_rooms && <p style={errStyle}>{errors.quad_rooms}</p>}
            </div>
          </div>

          {/* Allocation Status */}
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)' }}>Total Allocated</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)' }}>{allocatedRooms}</p>
            </div>
            <div style={{ width: '100%', background: 'var(--border)', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all 0.2s',
                  background: isAllocationValid ? 'var(--status-success)' : 'var(--status-warning)',
                  width: `${Math.min(allocationPercentage, 100)}%`,
                }}
              ></div>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              {allocationPercentage}% of {formData.total_rooms} total rooms
            </p>

            {isAllocationValid ? (
              <div style={{
                marginTop: 'var(--space-3)', padding: 'var(--space-2)',
                background: 'color-mix(in srgb, var(--status-success) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--status-success) 25%, transparent)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', gap: 'var(--space-2)',
              }}>
                <CheckCircle size={16} style={{ color: 'var(--status-success)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--status-success)' }}>✓ Perfect allocation match</p>
              </div>
            ) : (
              <div style={{
                marginTop: 'var(--space-3)', padding: 'var(--space-2)',
                background: 'color-mix(in srgb, var(--status-warning) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--status-warning) 25%, transparent)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', gap: 'var(--space-2)',
              }}>
                <AlertCircle size={16} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--status-warning)' }}>Allocation ({allocatedRooms}) does not match total ({formData.total_rooms})</p>
              </div>
            )}
          </div>

          {/* Allocation Error */}
          {errors.allocation && (
            <div style={{
              padding: 'var(--space-3)',
              background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--status-error) 25%, transparent)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', gap: 'var(--space-2)',
            }}>
              <AlertCircle size={16} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--status-error)' }}>{errors.allocation}</p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
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
              disabled={loading || !isAllocationValid}
              className="btn btn-primary"
              style={{ opacity: (loading || !isAllocationValid) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              {loading && (
                <div style={{
                  width: '16px', height: '16px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid transparent',
                  borderBottomColor: 'var(--text-on-primary)',
                  animation: 'spin 0.6s linear infinite',
                }}></div>
              )}
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
