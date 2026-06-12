/**
 * Room Estimation Calculator
 * 
 * Automatically calculates room requirements based on participant mix
 * and hotel-specific occupancy rules.
 */

import type {
  ParticipantMix,
  OccupancyType,
  DesignationType,
  HotelOccupancyMatrix,
  RoomEstimation,
  RoomEstimationSummary,
} from './types';

import {
  OCCUPANCY_CAPACITY,
  DEFAULT_OCCUPANCY_MATRIX,
  DESIGNATION_LABELS,
} from './types';

/**
 * Calculate total planned pax from participant mix
 */
export function calculateTotalPlannedPax(mix: ParticipantMix): number {
  return (
    (mix.so || 0) +
    (mix.dm || 0) +
    (mix.rsm || 0) +
    (mix.ch || 0) +
    (mix.ibh || 0) +
    (mix.others || 0)
  );
}

/**
 * Calculate rooms required for a specific designation
 */
function calculateDesignationRooms(
  count: number,
  occupancyType: OccupancyType
): number {
  if (count <= 0) return 0;
  
  const personsPerRoom = OCCUPANCY_CAPACITY[occupancyType];
  return Math.ceil(count / personsPerRoom);
}

/**
 * Get occupancy type for a designation (hotel-specific or default)
 */
function getOccupancyType(
  designation: DesignationType,
  hotelMatrix?: HotelOccupancyMatrix
): OccupancyType {
  // Try hotel-specific rule first
  if (hotelMatrix?.rules[designation]) {
    return hotelMatrix.rules[designation]!;
  }
  
  // Fallback to default
  return DEFAULT_OCCUPANCY_MATRIX[designation];
}

/**
 * Estimate rooms required with detailed breakdown
 */
export function estimateRoomsWithBreakdown(
  mix: ParticipantMix,
  hotelMatrix?: HotelOccupancyMatrix
): RoomEstimationSummary {
  const breakdown: RoomEstimation[] = [];
  let totalRooms = 0;
  
  const designations: Array<{ type: DesignationType; count: number }> = [
    { type: 'SO', count: mix.so || 0 },
    { type: 'DM', count: mix.dm || 0 },
    { type: 'RSM', count: mix.rsm || 0 },
    { type: 'CH', count: mix.ch || 0 },
    { type: 'IBH', count: mix.ibh || 0 },
  ];
  
  for (const { type, count } of designations) {
    if (count === 0) continue;
    
    const occupancyType = getOccupancyType(type, hotelMatrix);
    const personsPerRoom = OCCUPANCY_CAPACITY[occupancyType];
    const roomsRequired = calculateDesignationRooms(count, occupancyType);
    
    breakdown.push({
      designation: type,
      participant_count: count,
      occupancy_type: occupancyType,
      persons_per_room: personsPerRoom,
      rooms_required: roomsRequired,
    });
    
    totalRooms += roomsRequired;
  }
  
  // "Others" are assumed single occupancy (1 room per person)
  if (mix.others && mix.others > 0) {
    totalRooms += mix.others;
  }
  
  return {
    breakdown,
    total_rooms: totalRooms,
    total_participants: calculateTotalPlannedPax(mix),
    hotel_id: hotelMatrix?.hotel_id,
    uses_defaults: !hotelMatrix || Object.keys(hotelMatrix.rules).length === 0,
  };
}

/**
 * Quick calculation: total rooms only (no breakdown)
 */
export function estimateRooms(
  mix: ParticipantMix,
  hotelMatrix?: HotelOccupancyMatrix
): number {
  return estimateRoomsWithBreakdown(mix, hotelMatrix).total_rooms;
}

/**
 * Validate guaranteed pax against total planned pax
 */
export function validateGuaranteedPax(
  guaranteedPax: number,
  totalPlannedPax: number
): { valid: boolean; error?: string } {
  if (guaranteedPax < 0) {
    return {
      valid: false,
      error: 'Guaranteed Pax cannot be negative',
    };
  }
  
  if (guaranteedPax > totalPlannedPax) {
    return {
      valid: false,
      error: `Guaranteed Pax (${guaranteedPax}) cannot exceed Total Planned Pax (${totalPlannedPax})`,
    };
  }
  
  return { valid: true };
}

/**
 * Format room estimation for display
 */
export function formatRoomEstimation(summary: RoomEstimationSummary): string {
  const lines: string[] = [];
  
  for (const item of summary.breakdown) {
    const label = DESIGNATION_LABELS[item.designation];
    lines.push(
      `${label} (${item.participant_count}): ${item.rooms_required} ${
        item.rooms_required === 1 ? 'room' : 'rooms'
      } (${item.occupancy_type.toLowerCase()})`
    );
  }
  
  if (summary.total_rooms > 0) {
    lines.push(`\nTotal Estimated Rooms: ${summary.total_rooms}`);
  }
  
  if (summary.uses_defaults) {
    lines.push('\n(Using default occupancy rules)');
  }
  
  return lines.join('\n');
}

/**
 * Create empty participant mix
 */
export function createEmptyParticipantMix(): ParticipantMix {
  return {
    so: 0,
    dm: 0,
    rsm: 0,
    ch: 0,
    ibh: 0,
    others: 0,
  };
}

/**
 * Check if participant mix is empty
 */
export function isParticipantMixEmpty(mix: ParticipantMix): boolean {
  return calculateTotalPlannedPax(mix) === 0;
}
