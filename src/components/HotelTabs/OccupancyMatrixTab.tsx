import { useState, useEffect } from 'react';
import type { OccupancyRule, HotelWithRelations } from '../../features/venues/types';
import { getOccupancyRulesByHotel } from '../../features/venues/venueService';
import { supabase } from '../../lib/supabase';

interface OccupancyMatrixTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

// Supported designations and occupancy types per requirements
const DESIGNATIONS = ['SO', 'DM', 'RSM', 'CH', 'IBH'];
const OCCUPANCY_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];

export function OccupancyMatrixTab({ hotel, onRefresh }: OccupancyMatrixTabProps) {
  const [rules, setRules] = useState<OccupancyRule[]>(hotel.occupancy_rules || []);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Load occupancy rules
  useEffect(() => {
    loadRules();
  }, [hotel.id]);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await getOccupancyRulesByHotel(hotel.id);
      setRules(data);
    } catch (error) {
      console.error('Error loading occupancy rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(designation: string, occupancyType: string) {
    try {
      // Find or create rule for this designation
      const existingRule = rules.find(r => r.rule_type === designation);
      
      if (existingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('hotel_occupancy_rules')
          .update({
            rule_type: `${designation}_${occupancyType}`,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', existingRule.id);

        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('hotel_occupancy_rules')
          .insert({
            hotel_id: hotel.id,
            rule_type: `${designation}_${occupancyType}`,
            is_active: true,
          } as any);

        if (error) throw error;
      }

      setEditingId(null);
      setEditValue('');
      await loadRules();
      onRefresh();
    } catch (error) {
      console.error('Error updating occupancy rule:', error);
      alert('Failed to update occupancy rule');
    }
  }

  // Check if all required designations exist
  const allDesignationsConfigured = DESIGNATIONS.every(des =>
    rules.some(rule => rule.rule_type?.startsWith(des))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading occupancy rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Completeness Status */}
      <div className="flex items-center justify-between bg-purple-50 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Occupancy Configuration Status</p>
          <p className="mt-1 text-lg font-semibold text-purple-900">
            {allDesignationsConfigured ? '✓ Complete' : '⚠ Incomplete'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Designations Configured</p>
          <p className="mt-1 text-lg font-semibold text-purple-900">
            {rules.length} / {DESIGNATIONS.length}
          </p>
        </div>
      </div>

      {!allDesignationsConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800">
            ⚠ Hotel cannot be marked Venue Ready until all {DESIGNATIONS.length} designations are configured
          </p>
          <p className="mt-2 text-xs text-yellow-700">
            Missing: {DESIGNATIONS.filter(
              des => !rules.some(rule => rule.rule_type?.startsWith(des))
            ).join(', ')}
          </p>
        </div>
      )}

      {/* Occupancy Matrix Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Occupancy Rules Matrix</h3>
          <p className="mt-1 text-xs text-gray-600">
            Map each sales designation to an occupancy type
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {DESIGNATIONS.map((designation) => {
            const existingRule = rules.find(r => r.rule_type?.startsWith(designation));
            const occupancyType = existingRule
              ? existingRule.rule_type?.split('_').pop() || OCCUPANCY_TYPES[0]
              : OCCUPANCY_TYPES[0];

            return (
              <div key={designation} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{designation}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDesignationLabel(designation)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                      {occupancyType}
                    </span>
                  </div>

                  {editingId === designation ? (
                    <div className="flex gap-2">
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {OCCUPANCY_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleUpdate(designation, editValue)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(designation);
                        setEditValue(occupancyType);
                      }}
                      className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules Details */}
      {rules.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Configured Rules</h3>
          <div className="space-y-2">
            {rules.map(rule => (
              <p key={rule.id} className="text-sm text-gray-600">
                • {rule.rule_type} - {rule.is_active ? '✓ Active' : '⊘ Inactive'}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getDesignationLabel(designation: string): string {
  const labels: Record<string, string> = {
    SO: 'Sales Officer',
    DM: 'Division Manager',
    RSM: 'Regional Sales Manager',
    CH: 'Corporate Head',
    IBH: 'In-house Booking Head',
  };
  return labels[designation] || designation;
}
