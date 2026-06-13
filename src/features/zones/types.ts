// Zone Master Types
// Purpose: Type definitions for Zone Master functionality

export type ZoneStatus = 'ACTIVE' | 'INACTIVE';

export interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
  status: ZoneStatus;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface ZoneCreateInput {
  zone_code: string;
  zone_name: string;
  status?: ZoneStatus;
}

export interface ZoneUpdateInput {
  zone_code?: string;
  zone_name?: string;
  status?: ZoneStatus;
}

export interface ZoneQueryFilters {
  status?: ZoneStatus;
  search?: string;
}

// Extended City type with zone information
export interface CityWithZone {
  id: string;
  city_name: string;
  state_name?: string | null;
  zone_id: string;
  zone?: {
    id: string;
    zone_code: string;
    zone_name: string;
    status: ZoneStatus;
  } | null;
  created_at: string;
  updated_at?: string | null;
}
