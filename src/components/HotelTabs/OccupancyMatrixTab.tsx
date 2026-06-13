import { useState, useEffect } from 'react';
import type { OccupancyRule, OccupancyType, HotelWithRelations } from '../../features/venues/types';
import { getOccupancyRulesByHotel, createOccupancyRule, updateOccupancyRule } from '../../features/venues/venueService';

interface OccupancyMatrixTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

// Designations match hotel_occupancy_rules.designation_type CHECK constraint
// Defaults mirror default_occupancy_rules seed data
const DESIGNATIONS = [
  { code: 'SO' as const, label: 'Sales Officer', default: 'TRIPLE' as OccType },
  { code: 'DM' as const, label: 'District Manager', default: 'DOUBLE' as OccType },
  { code: 'RSM' as const, label: 'Regional Sales Manager', default: 'SINGLE' as OccType },
  { code: 'CH' as const, label: 'Channel Head', default: 'SINGLE' as OccType },
  { code: 'IBH' as const, label: 'Institutional Business Head', default: 'SINGLE' as OccType },
  { code: 'OTHERS' as const, label: 'Others', default: 'SINGLE' as OccType },
];

const OCCUPANCY_OPTIONS = [
  { value: 'SINGLE' as const, label: 'Single' },
  { value: 'DOUBLE' as const, label: 'Double' },
  { value: 'TRIPLE' as const, label: 'Triple' },
  { value: 'QUAD' as const, label: 'Quad' },
];

type OccType = OccupancyType;

const OCC_LABEL: Record<OccType, string> = { SINGLE: 'Single', DOUBLE: 'Double', TRIPLE: 'Triple', QUAD: 'Quad' };

export function OccupancyMatrixTab({ hotel, onRefresh }: OccupancyMatrixTabProps) {
  const [rules, setRules] = useState<OccupancyRule[]>(hotel.occupancy_rules || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRules, setEditingRules] = useState<Record<string, OccType>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, [hotel.id]);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await getOccupancyRulesByHotel(hotel.id);
      setRules(data);
      const initial: Record<string, OccType> = {};
      DESIGNATIONS.forEach((des) => {
        const rule = data.find((r) => r.designation_type === des.code);
        initial[des.code] = (rule?.occupancy_type ?? des.default) as OccType;
      });
      setEditingRules(initial);
    } catch (error) {
      console.error('Error loading occupancy rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const hasBlank = DESIGNATIONS.some((des) => !editingRules[des.code]);
    if (hasBlank) {
      setError('All occupancy rules must be assigned.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      for (const des of DESIGNATIONS) {
        const occupancyType = editingRules[des.code];
        const existingRule = rules.find((r) => r.designation_type === des.code);
        if (existingRule) {
          await updateOccupancyRule(existingRule.id, {
            designation_type: des.code,
            occupancy_type: occupancyType,
          });
        } else {
          await createOccupancyRule({
            hotel_id: hotel.id,
            designation_type: des.code,
            occupancy_type: occupancyType,
          });
        }
      }
      await loadRules();
      onRefresh();
    } catch (err) {
      console.error('Error saving occupancy rules:', err);
      setError(`Failed to save occupancy rules: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  }

  const allConfigured = DESIGNATIONS.every((des) => editingRules[des.code]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading occupancy rules...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
      {/* Status */}
      <div style={{
        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Occupancy Matrix Status</p>
            <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: allConfigured ? 'var(--status-success)' : 'var(--status-error)' }}>
              {allConfigured ? '✓ Complete' : '⚠ Incomplete'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Designations Configured</p>
            <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--primary)' }}>
              {Object.values(editingRules).filter((v) => v).length} / {DESIGNATIONS.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'color-mix(in srgb, var(--status-error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--status-error)' }}>{error}</p>
        </div>
      )}

      {/* Editor */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)' }}>Occupancy Rules</h3>
          <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Select the room occupancy type for each designation</p>
        </div>

        <div>
          {DESIGNATIONS.map((des, idx) => (
            <div key={des.code} style={{
              padding: 'var(--space-4) var(--space-6)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)',
              borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)' }}>{des.code}</p>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>{des.label}</p>
              </div>
              <div style={{ width: '160px' }}>
                <select
                  className="input"
                  style={{ width: '100%' }}
                  value={editingRules[des.code] || ''}
                  onChange={(e) => setEditingRules((prev) => ({ ...prev, [des.code]: e.target.value as OccType }))}
                >
                  <option value="">Select occupancy type</option>
                  {OCCUPANCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Default assignments:</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', padding: 0, margin: 0 }}>
            {DESIGNATIONS.map((des) => (
              <li key={des.code}>• {des.code}: {OCC_LABEL[des.default]}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !allConfigured}
          style={{ opacity: saving || !allConfigured ? 0.6 : 1, cursor: saving || !allConfigured ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Occupancy Rules'}
        </button>
      </div>

      {/* Current Config */}
      {rules.length > 0 && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>Current Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {DESIGNATIONS.map((des) => {
              const rule = rules.find((r) => r.designation_type === des.code);
              const occupancy = rule ? OCC_LABEL[rule.occupancy_type] : 'Not configured';
              return (
                <p key={des.code} style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  • <strong style={{ color: 'var(--text-main)' }}>{des.code}</strong>: {occupancy}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
