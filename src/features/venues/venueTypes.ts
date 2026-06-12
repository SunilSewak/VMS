/**
 * Venue Master Data Types
 * 
 * Step 6: Venue Master Data Architecture
 * Comprehensive type definitions for the venue repository
 */

// =====================================================================
// LEVEL 1: ZONE MASTER
// =====================================================================

export enum ZoneCode {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  HO = 'HO',
}

export interface Zone {
  id: string;
  zone_code: ZoneCode;
  zone_name: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================================
// LEVEL 2: CITY (ENHANCED)
// =====================================================================

export interface City {
  id: string;
  city_name: string;
  state?: string;
  zone_id?: string;
  tier?: string;
  active?: boolean;
  // Relations
  zones?: Zone;
}

// =====================================================================
// LEVEL 3: HOTEL (ENHANCED)
// =====================================================================

export enum HotelCategory {
  FIVE_STAR = '5_STAR',
  FOUR_STAR = '4_STAR',
  THREE_STAR = '3_STAR',
  BUSINESS = 'BUSINESS',
  BUDGET = 'BUDGET',
  RESORT = 'RESORT',
  BOUTIQUE = 'BOUTIQUE',
}

export enum HotelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export interface Hotel {
  id: string;
  hotel_name: string;
  hotel_brand?: string;
  hotel_category?: HotelCategory;
  city_id: string;
  zone_id?: string;
  
  // Contact & Location
  address?: string;
  gst_number?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  
  // Contact Information
  sales_contact_name?: string;
  sales_contact_designation?: string;
  sales_contact_mobile?: string;
  sales_contact_email?: string;
  
  // Operational
  status: HotelStatus;
  preferred_vendor?: boolean;
  blacklisted?: boolean;
  remarks?: string;
  
  // Suitability (derived)
  residential_supported?: boolean;
  non_residential_supported?: boolean;
  max_residential_pax?: number;
  max_meeting_pax?: number;
  multiple_halls?: boolean;
  
  // Inventory (existing fields)
  residential_capacity?: number;
  largest_hall_capacity?: number;
  total_rooms?: number;
  
  // Historical Intelligence
  total_ajanta_events?: number;
  last_used_date?: string;
  last_division_id?: string;
  last_meeting_type_id?: string;
  ajanta_rating?: number;
  ajanta_feedback_count?: number;
  
  // Legacy vendor fields
  vendor_code?: string;
  preferred_vendor_status?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Relations
  cities?: City;
  zones?: Zone;
  divisions?: { division_name: string };
  meeting_types?: { meeting_type_name: string };
}

// =====================================================================
// LEVEL 4: ACCOMMODATION INVENTORY
// =====================================================================

export interface HotelAccommodationInventory {
  id: string;
  hotel_id: string;
  total_rooms: number;
  single_rooms?: number;
  double_rooms?: number;
  triple_rooms?: number;
  quad_rooms?: number;
  suite_rooms?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================================
// LEVEL 5: OCCUPANCY MATRIX
// =====================================================================

export type DesignationType = 'SO' | 'DM' | 'RSM' | 'CH' | 'IBH' | 'OTHERS';
export type OccupancyType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';

export interface HotelOccupancyRule {
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
  created_at?: string;
}

// =====================================================================
// LEVEL 6: HALL (ENHANCED)
// =====================================================================

export enum IndoorOutdoor {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
  BOTH = 'BOTH',
}

export enum HallStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_RENOVATION = 'UNDER_RENOVATION',
}

export interface Hall {
  id: string;
  hotel_id: string;
  hall_name: string;
  floor?: string;
  area_sqft?: number;
  indoor_outdoor?: IndoorOutdoor;
  status: HallStatus;
  
  // Multi-capacity seating
  theatre_capacity: number;
  classroom_capacity: number;
  u_shape_capacity: number;
  cluster_capacity: number;
  boardroom_capacity: number;
  round_table_capacity?: number;
  reception_capacity?: number;
  
  // Legacy fields
  capacity?: number;
  hall_type?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// =====================================================================
// LEVEL 9: PHOTO REPOSITORY
// =====================================================================

export enum PhotoType {
  // Hotel Photos
  HOTEL_EXTERIOR = 'HOTEL_EXTERIOR',
  HOTEL_LOBBY = 'HOTEL_LOBBY',
  HOTEL_GUEST_ROOM = 'HOTEL_GUEST_ROOM',
  HOTEL_RESTAURANT = 'HOTEL_RESTAURANT',
  HOTEL_AMENITY = 'HOTEL_AMENITY',
  // Hall Photos
  HALL_EMPTY = 'HALL_EMPTY',
  HALL_THEATRE = 'HALL_THEATRE',
  HALL_CLASSROOM = 'HALL_CLASSROOM',
  HALL_CLUSTER = 'HALL_CLUSTER',
  HALL_U_SHAPE = 'HALL_U_SHAPE',
  HALL_BOARDROOM = 'HALL_BOARDROOM',
  HALL_SETUP = 'HALL_SETUP',
  OTHER = 'OTHER',
}

export interface VenuePhoto {
  id: string;
  hotel_id?: string;
  hall_id?: string;
  photo_type: PhotoType;
  photo_url: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  uploaded_at: string;
  uploaded_by?: string;
}

// =====================================================================
// HELPER INTERFACES
// =====================================================================

export interface HotelWithDetails extends Hotel {
  accommodation_inventory?: HotelAccommodationInventory;
  occupancy_rules?: HotelOccupancyRule[];
  halls?: Hall[];
  photos?: VenuePhoto[];
}

export interface HallWithPhotos extends Hall {
  photos?: VenuePhoto[];
}

// =====================================================================
// VENUE UPLOAD TEMPLATE STRUCTURES
// =====================================================================

export interface HotelMasterRow {
  hotel_name: string;
  hotel_brand?: string;
  hotel_category?: string;
  zone: string;
  city: string;
  address?: string;
  gst_number?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  sales_contact_name?: string;
  sales_contact_designation?: string;
  sales_contact_mobile?: string;
  sales_contact_email?: string;
  preferred_vendor?: boolean;
  blacklisted?: boolean;
  status?: string;
  remarks?: string;
}

export interface HallMasterRow {
  hotel_name: string;
  hall_name: string;
  floor?: string;
  area_sqft?: number;
  indoor_outdoor?: string;
  theatre_capacity: number;
  classroom_capacity: number;
  u_shape_capacity: number;
  cluster_capacity: number;
  boardroom_capacity: number;
  round_table_capacity?: number;
  status?: string;
}

export interface AccommodationInventoryRow {
  hotel_name: string;
  total_rooms: number;
  single_rooms?: number;
  double_rooms?: number;
  triple_rooms?: number;
  quad_rooms?: number;
  suite_rooms?: number;
  remarks?: string;
}

export interface OccupancyMatrixRow {
  hotel_name: string;
  so_occupancy?: string;
  dm_occupancy?: string;
  rsm_occupancy?: string;
  ch_occupancy?: string;
  ibh_occupancy?: string;
  others_occupancy?: string;
}

export interface PhotoMappingRow {
  hotel_name?: string;
  hall_name?: string;
  photo_type: string;
  photo_url: string;
  caption?: string;
  display_order?: number;
  is_primary?: boolean;
}

// =====================================================================
// VENUE UPLOAD RESULT
// =====================================================================

export interface VenueUploadResult {
  success: boolean;
  hotels_created: number;
  hotels_updated: number;
  halls_created: number;
  halls_updated: number;
  inventory_created: number;
  occupancy_rules_created: number;
  photos_created: number;
  errors: string[];
  warnings: string[];
}

// =====================================================================
// CONSTANTS
// =====================================================================

export const HOTEL_CATEGORY_LABELS: Record<HotelCategory, string> = {
  [HotelCategory.FIVE_STAR]: '5 Star',
  [HotelCategory.FOUR_STAR]: '4 Star',
  [HotelCategory.THREE_STAR]: '3 Star',
  [HotelCategory.BUSINESS]: 'Business Hotel',
  [HotelCategory.BUDGET]: 'Budget Hotel',
  [HotelCategory.RESORT]: 'Resort',
  [HotelCategory.BOUTIQUE]: 'Boutique Hotel',
};

export const ZONE_CODE_LABELS: Record<ZoneCode, string> = {
  [ZoneCode.NORTH]: 'North Zone',
  [ZoneCode.SOUTH]: 'South Zone',
  [ZoneCode.EAST]: 'East Zone',
  [ZoneCode.WEST]: 'West Zone',
  [ZoneCode.HO]: 'Head Office',
};

export const OCCUPANCY_TYPE_LABELS: Record<OccupancyType, string> = {
  SINGLE: 'Single Occupancy',
  DOUBLE: 'Double Sharing',
  TRIPLE: 'Triple Sharing',
  QUAD: 'Quad Sharing',
};

export const DESIGNATION_TYPE_LABELS: Record<DesignationType, string> = {
  SO: 'Sales Officer',
  DM: 'District Manager',
  RSM: 'Regional Sales Manager',
  CH: 'Channel Head',
  IBH: 'Institutional Business Head',
  OTHERS: 'Others',
};

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  HOTEL_EXTERIOR: 'Hotel Exterior',
  HOTEL_LOBBY: 'Hotel Lobby',
  HOTEL_GUEST_ROOM: 'Guest Room',
  HOTEL_RESTAURANT: 'Restaurant',
  HOTEL_AMENITY: 'Hotel Amenity',
  HALL_EMPTY: 'Hall (Empty)',
  HALL_THEATRE: 'Hall (Theatre Setup)',
  HALL_CLASSROOM: 'Hall (Classroom Setup)',
  HALL_CLUSTER: 'Hall (Cluster Setup)',
  HALL_U_SHAPE: 'Hall (U-Shape Setup)',
  HALL_BOARDROOM: 'Hall (Boardroom Setup)',
  HALL_SETUP: 'Hall Setup',
  OTHER: 'Other',
};

