import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Hall, HotelWithRelations, HallCreateInput, HallUpdateInput } from '../features/venues/types';
import { createHall, updateHall } from '../features/venues/venueService';
import { Modal } from './Modal';

interface HallFormModalProps {
  hotel: HotelWithRelations;
  hall: Hall | null;
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

const hintStyle: React.CSSProperties = {
  color: 'var(--text-light)',
  fontSize: 'var(--font-xs)',
  marginTop: 'var(--space-1)',
};

export function HallFormModal({ hotel, hall, onClose, onComplete }: HallFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hall_name: hall?.hall_name || '',
    floor_name: (hall?.floor_name as string) || '',
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
    const hasCapacity =
      (formData.classroom_capacity || 0) > 0 ||
      (formData.u_shape_capacity || 0) > 0 ||
      (formData.cluster_capacity || 0) > 0;
    if (!hasCapacity) {
      newErrors.capacities = 'At least one seating capacity must be greater than 0';
    }
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
        floor_name: formData.floor_name || undefined,
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
    <Modal isOpen={true} onClose={onClose}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-on-primary)' }}>
            {hall ? 'Edit Conference Room' : 'Add Conference Room'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-on-primary)', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyle}>Conference Room Name *</label>
              <input
                type="text"
                className="input"
                style={{ width: '100%' }}
                value={formData.hall_name}
                onChange={(e) => setFormData({ ...formData, hall_name: e.target.value })}
                placeholder="e.g., Hall A, Conference Room 1"
              />
              {errors.hall_name && <p style={errStyle}>{errors.hall_name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Floor Name</label>
              <input
                type="text"
                className="input"
                style={{ width: '100%' }}
                value={formData.floor_name}
                onChange={(e) => setFormData({ ...formData, floor_name: e.target.value })}
                placeholder="e.g., Ground, 1st, 2nd"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyle}>Type (Indoor / Outdoor) *</label>
              <select
                className="input"
                style={{ width: '100%' }}
                value={formData.indoor_outdoor}
                onChange={(e) => setFormData({ ...formData, indoor_outdoor: e.target.value })}
              >
                {indoorOutdoorOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status *</label>
              <select
                className="input"
                style={{ width: '100%' }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Capacities header */}
          <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>
              Seating Capacities * (at least one must be &gt; 0)
            </h3>
            {errors.capacities && <p style={{ ...errStyle, marginTop: 0, marginBottom: 'var(--space-3)' }}>{errors.capacities}</p>}
          </div>

          {/* Capacities */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
            <div>
              <label style={labelStyle}>Classroom Capacity</label>
              <input
                type="number" min="0"
                className="input"
                style={{ width: '100%' }}
                value={formData.classroom_capacity || 0}
                onChange={(e) => setFormData({ ...formData, classroom_capacity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              {errors.classroom_capacity && <p style={errStyle}>{errors.classroom_capacity}</p>}
              <p style={hintStyle}>Classroom-style with tables</p>
            </div>
            <div>
              <label style={labelStyle}>U-Shape Capacity</label>
              <input
                type="number" min="0"
                className="input"
                style={{ width: '100%' }}
                value={formData.u_shape_capacity || 0}
                onChange={(e) => setFormData({ ...formData, u_shape_capacity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              {errors.u_shape_capacity && <p style={errStyle}>{errors.u_shape_capacity}</p>}
              <p style={hintStyle}>U-shape configuration</p>
            </div>
            <div>
              <label style={labelStyle}>Cluster Capacity</label>
              <input
                type="number" min="0"
                className="input"
                style={{ width: '100%' }}
                value={formData.cluster_capacity || 0}
                onChange={(e) => setFormData({ ...formData, cluster_capacity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              {errors.cluster_capacity && <p style={errStyle}>{errors.cluster_capacity}</p>}
              <p style={hintStyle}>Multiple cluster groups</p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving...' : hall ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
