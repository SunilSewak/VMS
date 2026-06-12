/**
 * Room Estimation Types
 * 
 * Defines occupancy rules and room calculation structures
 */

export type DesignationType = 'SO' | 'DM' | 'RSM' | 'CH' | 'IBH';

export type OccupancyType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';

export const DESIGNATION_LABELS: Record<DesignationType, string> = {
  SO: 'Sales Officer',
  DM: 'District Manager',
  RSM: 'Regional Sales Manager',
  CH: 'Channel Head',
  IBH: 'Institutional Business Head',
};

export const DESIGNATION_CODES: Record<DesignationType, string> = {
  SO: 'SO',
  DM: 'DM',
  RSM: 'RSM',
  CH: 'CH',
  IBH: 'IBH',
};

export const OCCUPANCY_LABELS: Record<OccupancyType, string> = {
  SINGLE: 'Single Occupancy',
  DOUBLE: 'Double Sharing',
  TRIPLE: 'Triple Sharing',
  QUAD: 'Quad Sharing',
};

export const OCCUPANCY_CAPACITY: Record<OccupancyType, number> = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  QUAD: 4,
};

export interface ParticipantMix {
  so: number;
  dm: number;
  rsm: number;
  ch: number;
  ibh: number;
  others: number;
}

export interface OccupancyRule {
  id: string;
  hotel_id: string;
  designation_type: DesignationType;
  occupancy_type: OccupancyType;
  created_at?: string;
  updated_at?: string;
}

export interface DefaultOccupancyRule {
  id: string;
  designation_type: DesignationType;
  occupancy_type: OccupancyType;
  description?: string;
}

export interface HotelOccupancyMatrix {
  hotel_id: string;
  rules: Partial<Record<DesignationType, OccupancyType>>;
}

export interface RoomEstimation {
  designation: DesignationType;
  participant_count: number;
  occupancy_type: OccupancyType;
  persons_per_room: number;
  rooms_required: number;
}

export interface RoomEstimationSummary {
  breakdown: RoomEstimation[];
  total_rooms: number;
  total_participants: number;
  hotel_id?: string;
  uses_defaults: boolean;
}

// Default occupancy rules (fallback when hotel-specific not available)
export const DEFAULT_OCCUPANCY_MATRIX: Record<DesignationType, OccupancyType> = {
  SO: 'TRIPLE',
  DM: 'DOUBLE',
  RSM: 'SINGLE',
  CH: 'SINGLE',
  IBH: 'SINGLE',
};
