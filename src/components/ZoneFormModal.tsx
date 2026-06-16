import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Zone, ZoneCreateInput, ZoneUpdateInput } from '../features/zones/types';
import { Modal } from './Modal';

interface ZoneFormModalProps {
  zone: Zone | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: ZoneCreateInput | ZoneUpdateInput) => Promise<void>;
  isLoading?: boolean;
}

export function ZoneFormModal({ zone, isOpen, onClose, onSave, isLoading = false }: ZoneFormModalProps) {
  const [zoneCode, setZoneCode] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (zone) {
      setZoneCode(zone.zone_code);
      setZoneName(zone.zone_name);
      setStatus(zone.status);
    } else {
      setZoneCode('');
      setZoneName('');
      setStatus('ACTIVE');
    }
    setError(null);
  }, [zone, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    // Validation
    if (!zoneCode.trim()) {
      setError('Zone code is required');
      return;
    }

    if (!zoneName.trim()) {
      setError('Zone name is required');
      return;
    }

    setError(null);

    try {
      await onSave({
        zone_code: zoneCode.trim().toUpperCase(),
        zone_name: zoneName.trim(),
        status,
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to save zone';
      setError(errorMsg);
    }
  };

  const isEditing = !!zone;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '520px',
          width: '90%',
          padding: 'var(--space-6)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, margin: 0 }}>
            {isEditing ? 'Edit Zone' : 'Create Zone'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>
              Zone Code
            </label>
            <input
              type="text"
              value={zoneCode}
              onChange={(e) => setZoneCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                fontSize: 'var(--font-sm)',
                textTransform: 'uppercase',
              }}
              placeholder="Enter zone code (e.g., NORTH, SOUTH)"
              maxLength={20}
            />
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              Uppercase, max 20 characters. Examples: NORTH, SOUTH, EAST, WEST, HO
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>
              Zone Name
            </label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                fontSize: 'var(--font-sm)',
              }}
              placeholder="Enter zone name (e.g., North, South)"
              maxLength={100}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {['ACTIVE', 'INACTIVE'].map((value) => (
                <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="zone-status"
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value as 'ACTIVE' | 'INACTIVE')}
                    disabled={isLoading}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Zone' : 'Create Zone')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
