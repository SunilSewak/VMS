// Venue Master Types

export type VenueStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
export type HallType = 'BALLROOM' | 'CONFERENCE' | 'BANQUET' | 'BOARDROOM' | 'THEATRE' | 'OTHER';
export type IndoorOutdoor = 'INDOOR' | 'OUTDOOR' | 'BOTH';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'PRESIDENTIAL';
export type OccupancyRuleType = 'MIN_OCCUPANCY' | 'MAX_OCCUPANCY' | 'STANDARD';

// Hotel
export interface Hotel {
  id: string;
  hotel_name: string;
  city_id: string;
  address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
  total_rooms?: number | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: VenueStatus;
  created_at: string;
  updated_at?: string | null;
  city?: { id: string; city_name: string; zone_id: string } | null;
}

export interface HotelWithRelations extends Hotel {
  halls?: Hall[];
  accommodation_inventory?: AccommodationInventory[];
  occupancy_rules?: OccupancyRule[];
  photos?: VenuePhoto[];
}

// Hall
export interface Hall {
  id: string;
  hotel_id: string;
  hall_name: string;
  hall_type: HallType;
  capacity?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  area?: number | null;
  theater_capacity?: number | null;
  classroom_capacity?: number | null;
  cocktail_capacity?: number | null;
  round_table_capacity?: number | null;
  indoor_outdoor: IndoorOutdoor;
  amenities?: string[] | null;
  status: VenueStatus;
  created_at: string;
  updated_at?: string | null;
  hotel?: Hotel | null;
}

// Accommodation Inventory
export interface AccommodationInventory {
  id: string;
  hotel_id: string;
  room_type: RoomType;
  total_rooms: number;
  available_rooms?: number | null;
  single_bed?: number | null;
  double_bed?: number | null;
  occupancy: number;
  rate_per_night?: number | null;
  status: VenueStatus;
  created_at: string;
  updated_at?: string | null;
  hotel?: Hotel | null;
}

// Occupancy Rule
export interface OccupancyRule {
  id: string;
  hotel_id: string;
  rule_type: OccupancyRuleType;
  min_occupancy?: number | null;
  max_occupancy?: number | null;
  rate_adjustment?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  hotel?: Hotel | null;
}

// Default Occupancy Rule
export interface DefaultOccupancyRule {
  id: string;
  zone_id?: string | null;
  rule_type: OccupancyRuleType;
  min_occupancy?: number | null;
  max_occupancy?: number | null;
  rate_adjustment?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// Venue Photo
export interface VenuePhoto {
  id: string;
  hotel_id?: string | null;
  hall_id?: string | null;
  photo_url: string;
  photo_name?: string | null;
  display_order?: number | null;
  created_at: string;
  updated_at?: string | null;
}

// Form Inputs
export interface HotelCreateInput {
  hotel_name: string;
  city_id: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  total_rooms?: number;
  check_in_time?: string;
  check_out_time?: string;
  status?: VenueStatus;
}

export interface HotelUpdateInput {
  hotel_name?: string;
  city_id?: string;
  address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
  total_rooms?: number | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status?: VenueStatus;
}

export interface HallCreateInput {
  hotel_id: string;
  hall_name: string;
  hall_type: HallType;
  capacity?: number;
  length?: number;
  width?: number;
  height?: number;
  area?: number;
  theater_capacity?: number;
  classroom_capacity?: number;
  cocktail_capacity?: number;
  round_table_capacity?: number;
  indoor_outdoor?: IndoorOutdoor;
  amenities?: string[];
  status?: VenueStatus;
}

export interface HallUpdateInput {
  hall_name?: string;
  hall_type?: HallType;
  capacity?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  area?: number | null;
  theater_capacity?: number | null;
  classroom_capacity?: number | null;
  cocktail_capacity?: number | null;
  round_table_capacity?: number | null;
  indoor_outdoor?: IndoorOutdoor;
  amenities?: string[] | null;
  status?: VenueStatus;
}

export interface AccommodationInventoryCreateInput {
  hotel_id: string;
  room_type: RoomType;
  total_rooms: number;
  available_rooms?: number;
  single_bed?: number;
  double_bed?: number;
  occupancy: number;
  rate_per_night?: number;
  status?: VenueStatus;
}

export interface OccupancyRuleCreateInput {
  hotel_id: string;
  rule_type: OccupancyRuleType;
  min_occupancy?: number;
  max_occupancy?: number;
  rate_adjustment?: number;
  is_active?: boolean;
}
