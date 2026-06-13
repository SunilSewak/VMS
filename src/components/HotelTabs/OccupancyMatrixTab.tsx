import { useState, useEffect } from 'react';
import type { OccupancyRule, HotelWithRelations } from '../../features/venues/types';
import { getOccupancyRulesByHotel, createOccupancyRule, updateOccupancyRule } from '../../features/venues/venueService';

interface OccupancyMatrixTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

// PHASE 4: Only 4 designation groups as per specification
const DESIGNATIONS = [
  { code: 'SO' as const, label: 'Sales Officer', default: 'TRIPLE' as const },
  { code: 'DM' as const, label: 'District Manager', default: 'DOUBLE' as const },
  { code: 'RSM' as const, label: 'Regional Sales Manager', default: 'SINGLE' as const },
  { code: 'Senior Manager' as const, label: 'Senior Manager', default: 'SINGLE' as const },
];

const OCCUPANCY_OPTIONS = [
  { value: 'SINGLE' as const, label: 'Single' },
  { value: 'DOUBLE' as const, label: 'Double' },
  { value: 'TRIPLE' as const, label: 'Triple' },
  { value: 'QUAD' as const, label: 'Quad' },
];

export function OccupancyMatrixTab({ hotel, onRefresh }: OccupancyMatrixTabProps) {
  const [rules, setRules] = useState<OccupancyRule[]>(hotel.occupancy_rules || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRules, setEditingRules] = useState<Record<string, 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'>>({});
  const [error, setError] = useState<string | null>(null);

  // Load occupancy rules
  useEffect(() => {
    loadRules();
  }, [hotel.id]);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await getOccupancyRulesByHotel(hotel.id);
      setRules(data);
      
      // Initialize editing state with current values
      const initial: Record<string, 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'> = {};
      DESIGNATIONS.forEach(des => {
        const rule = data.find(r => r.rule_type === des.code);
        initial[des.code] = (rule ? mapNumberToOccupancyType(rule.min_occupancy) : des.default) as 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
      });
      setEditingRules(initial);
    } catch (error) {
      console.error('Error loading occupancy rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    // Validation: all rules must be assigned
    const hasBlank = DESIGNATIONS.some(des => !editingRules[des.code]);
    if (hasBlank) {
      setError('All occupancy rules must be assigned.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save all rules
      for (const des of DESIGNATIONS) {
        const occupancyType = editingRules[des.code];
        const existingRule = rules.find(r => r.rule_type === des.code);

        if (existingRule) {
          // Update existing rule
          await updateOccupancyRule(existingRule.id, {
            rule_type: des.code,
            min_occupancy: mapOccupancyToNumber(occupancyType as 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'),
            is_active: true,
          });
        } else {
          // Create new rule
          await createOccupancyRule({
            hotel_id: hotel.id,
            rule_type: des.code,
            min_occupancy: mapOccupancyToNumber(occupancyType as 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'),
            is_active: true,
          });
        }
      }

      await loadRules();
      onRefresh();
    } catch (err) {
      console.error('Error saving occupancy rules:', err);
      setError('Failed to save occupancy rules. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Check if all required designations are configured
  const allConfigured = DESIGNATIONS.every(des => editingRules[des.code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading occupancy rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Completion Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Occupancy Matrix Status</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: allConfigured ? '#059669' : '#dc2626' }}>
              {allConfigured ? '✓ Complete' : '⚠ Incomplete'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Designations Configured</p>
            <p className="mt-1 text-lg font-semibold text-blue-900">
              {Object.values(editingRules).filter(v => v).length} / {DESIGNATIONS.length}
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Occupancy Rules Editor */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Occupancy Rules</h3>
          <p className="mt-1 text-xs text-gray-600">Select the room occupancy type for each designation</p>
        </div>

        <div className="divide-y divide-gray-200">
          {DESIGNATIONS.map((des) => (
            <div key={des.code} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{des.code}</p>
                <p className="text-xs text-gray-500 mt-1">{des.label}</p>
              </div>

              <div className="w-40">
                <select
                  value={editingRules[des.code] || ''}
                  onChange={(e) => setEditingRules(prev => ({
                    ...prev,
                    [des.code]: (e.target.value as 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD')
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select occupancy type</option>
                  {OCCUPANCY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Default Values Reference */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <p className="font-medium mb-2">Default assignments:</p>
          <ul className="space-y-1">
            {DESIGNATIONS.map(des => (
              <li key={des.code}>• {des.code}: {des.default}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !allConfigured}
          className={`px-6 py-2 font-medium rounded-lg transition-colors ${
            allConfigured && !saving
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Save Occupancy Rules'}
        </button>
      </div>

      {/* Current Configuration Display */}
      {rules.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Configuration</h3>
          <div className="space-y-2">
            {DESIGNATIONS.map(des => {
              const rule = rules.find(r => r.rule_type === des.code);
              const occupancy = rule ? mapNumberToOccupancy(rule.min_occupancy) : 'Not configured';
              return (
                <p key={des.code} className="text-sm text-gray-600">
                  • <strong>{des.code}</strong>: {occupancy}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Map occupancy label to number for storage
function mapOccupancyToNumber(occupancy: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'): number {
  const mapping: Record<'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD', number> = {
    'SINGLE': 1,
    'DOUBLE': 2,
    'TRIPLE': 3,
    'QUAD': 4,
  };
  return mapping[occupancy] || 1;
}

// Helper: Map number to occupancy label for display
function mapNumberToOccupancy(num?: number | null): string {
  if (!num) return 'Not configured';
  const mapping: Record<number, string> = {
    1: 'Single',
    2: 'Double',
    3: 'Triple',
    4: 'Quad',
  };
  return mapping[num] || 'Unknown';
}

// Helper: Map number to occupancy type for state
function mapNumberToOccupancyType(num?: number | null): 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD' | undefined {
  if (!num) return undefined;
  const mapping: Record<number, 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'> = {
    1: 'SINGLE',
    2: 'DOUBLE',
    3: 'TRIPLE',
    4: 'QUAD',
  };
  return mapping[num] || undefined;
}
