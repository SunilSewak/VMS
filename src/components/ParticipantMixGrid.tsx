/**
 * Participant Mix Grid Component
 * 
 * Allows Sales Head to input participant counts by designation.
 * Automatically calculates total planned pax.
 */

import React from 'react';
import { Users } from 'lucide-react';
import type { ParticipantMix } from '../features/rooms/types';
import { DESIGNATION_LABELS, DesignationType } from '../features/rooms/types';
import { calculateTotalPlannedPax } from '../features/rooms/roomCalculator';

interface ParticipantMixGridProps {
  value: ParticipantMix;
  onChange: (mix: ParticipantMix) => void;
  disabled?: boolean;
}

const DESIGNATIONS: DesignationType[] = ['SO', 'DM', 'RSM', 'CH', 'IBH'];

export function ParticipantMixGrid({ value, onChange, disabled = false }: ParticipantMixGridProps) {
  const handleChange = (designation: keyof ParticipantMix, count: number) => {
    onChange({
      ...value,
      [designation]: count >= 0 ? count : 0,
    });
  };

  const totalPax = calculateTotalPlannedPax(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Users size={18} style={{ color: 'var(--primary)' }} />
        <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 700, margin: 0 }}>
          Participant Mix
        </h4>
      </div>

      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: '-var(--space-2)' }}>
        Enter the number of attendees by designation. Room requirements will be calculated automatically.
      </p>

      {/* Designation Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
      }}>
        {DESIGNATIONS.map((designation) => {
          const key = designation.toLowerCase() as keyof ParticipantMix;
          const label = DESIGNATION_LABELS[designation];
          const count = value[key] || 0;

          return (
            <div key={designation} style={{
              padding: 'var(--space-3)',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {designation}
              </label>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-light)', marginBottom: 'var(--space-2)' }}>
                {label}
              </div>
              <input
                type="number"
                min="0"
                value={count}
                onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
                disabled={disabled}
                className="input"
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              />
            </div>
          );
        })}

        {/* Others */}
        <div style={{
          padding: 'var(--space-3)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            OTHERS
          </label>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-light)', marginBottom: 'var(--space-2)' }}>
            Other participants
          </div>
          <input
            type="number"
            min="0"
            value={value.others || 0}
            onChange={(e) => handleChange('others', parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="input"
            style={{
              width: '100%',
              padding: 'var(--space-2)',
              fontSize: 'var(--font-lg)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      {/* Total Planned Pax */}
      <div style={{
        padding: 'var(--space-4)',
        background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000))',
        borderRadius: 'var(--radius-md)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 'var(--font-xs)', opacity: 0.9, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Planned Pax
          </div>
          <div style={{ fontSize: 'var(--font-sm)', opacity: 0.8 }}>
            Auto-calculated from participant mix
          </div>
        </div>
        <div style={{
          fontSize: 'var(--font-3xl)',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <Users size={24} style={{ opacity: 0.8 }} />
          {totalPax}
        </div>
      </div>

      {/* Validation Message */}
      {totalPax === 0 && (
        <div style={{
          padding: 'var(--space-3)',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          color: '#dc2626',
          fontSize: 'var(--font-sm)',
        }}>
          ⚠ At least one participant is required
        </div>
      )}
    </div>
  );
}

/**
 * Read-Only Participant Mix Display
 * For viewing existing requests
 */
interface ParticipantMixDisplayProps {
  value: ParticipantMix;
}

export function ParticipantMixDisplay({ value }: ParticipantMixDisplayProps) {
  const totalPax = calculateTotalPlannedPax(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: 0 }}>
        Participant Mix
      </h4>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--space-2)',
      }}>
        {DESIGNATIONS.map((designation) => {
          const key = designation.toLowerCase() as keyof ParticipantMix;
          const count = value[key] || 0;
          if (count === 0) return null;

          return (
            <div key={designation} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--space-2)',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                {designation}:
              </span>
              <strong style={{ fontSize: 'var(--font-sm)' }}>{count}</strong>
            </div>
          );
        })}
        
        {value.others > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-2)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Others:
            </span>
            <strong style={{ fontSize: 'var(--font-sm)' }}>{value.others}</strong>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 'var(--space-3)',
        background: 'var(--primary)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        fontWeight: 700,
      }}>
        <span>Total Planned Pax:</span>
        <span>{totalPax}</span>
      </div>
    </div>
  );
}
