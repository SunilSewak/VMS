// Venue Master Types

// ============================================================================
// VENUE SEARCH & DISPLAY TYPES (for VenueExplorer)
// ============================================================================

export interface City {
  id: string;
  city_name: string;
  zone_id?: string;
}

export interface HotelCategory {
  id: string;
  category_code: string;
  category_name: string;
}

export interface VenueCardViewModel {
  id: string;
  hotelId: string;
  hotelName: string;
  categoryName: string;
  cityName: string;
  address: string;
  primaryImage: string | null;
  largestHallCapacity: number;
  hallCount: number;
  shortlisted: boolean;
}

// Alias for backward compatibility
export type VenueCardData = VenueCardViewModel;

export interface VenueSearchFilters {
  searchQuery: string;
  cityId?: string;
  zone?: string;
  categoryCode?: string;
  capacityMin?: number;
}

export interface VenueShortlist {
  id: string;
  request_id: string;
  hotel_id: string;
  hall_id?: string | null;
  shortlisted_by: string;
  shortlisted_at: string;
  hotels?: Hotel | null;
}

// ============================================================================
// CORE VENUE TYPES
// ============================================================================

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
  u_shape_capacity?: number | null;
  cluster_capacity?: number | null;
  boardroom_capacity?: number | null;
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
  total_rooms: number;
  single_rooms?: number | null;
  double_rooms?: number | null;
  triple_rooms?: number | null;
  quad_rooms?: number | null;
  suite_rooms?: number | null;
  available_rooms?: number | null;
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
  photo_type?: string;
  file_name?: string;
  storage_path?: string;
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
  u_shape_capacity?: number;
  cluster_capacity?: number;
  boardroom_capacity?: number;
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
  u_shape_capacity?: number | null;
  cluster_capacity?: number | null;
  boardroom_capacity?: number | null;
  indoor_outdoor?: IndoorOutdoor;
  amenities?: string[] | null;
  status?: VenueStatus;
}

export interface AccommodationInventoryCreateInput {
  hotel_id: string;
  total_rooms: number;
  single_rooms?: number;
  double_rooms?: number;
  triple_rooms?: number;
  quad_rooms?: number;
  suite_rooms?: number;
  available_rooms?: number;
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

// ============================================================================
// VENUE IMPORT TYPES (for Bulk Upload)
// ============================================================================

export interface ImportValidationError {
  row: number;
  field: string;
  error: string;
  value?: string | number | null;
  severity: 'ERROR' | 'WARNING';
}

export interface ImportPreviewData {
  validRows: number;
  invalidRows: number;
  errors: ImportValidationError[];
  hotelsSummary: {
    toCreate: number;
    toUpdate: number;
  };
  hallsSummary: {
    toCreate: number;
    toUpdate: number;
  };
}

export interface ImportResult {
  success: boolean;
  hotelCount: number;
  hallCount: number;
  hotelCreated: number;
  hotelUpdated: number;
  hallCreated: number;
  hallUpdated: number;
  rowsProcessed: number;
  rowsSkipped: number;
  errors: ImportValidationError[];
  importSessionId?: string;
}

export interface VenueImportHistory {
  id: string;
  import_session_id: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  rows_processed: number;
  hotels_created: number;
  hotels_updated: number;
  halls_created: number;
  halls_updated: number;
  rows_skipped: number;
  status: 'UPLOADED' | 'VALIDATED' | 'IMPORTING' | 'SUCCESS' | 'FAILED';
  error_report_path?: string;
  created_at: string;
}

export interface DataQualityMetrics {
  totalHotels: number;
  hotelsMissingHalls: number;
  hotelsMissingInventory: number;
  hotelsMissingOccupancy: number;
  hotelsMissingPhotos: number;
  hotelsNotVenueReady: number;
  readinessDistribution: {
    notReady: number;
    partial: number;
    ready: number;
    optimized: number;
  };
}

export interface ExcelRow {
  [key: string]: any;
}
