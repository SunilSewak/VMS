// Venue Master Types

// ============================================================================
// VENUE SEARCH & DISPLAY TYPES (for VenueExplorer)
// ============================================================================

export interface City {
  id: string;
  city_name: string;
  zone_id?: string;
}

export interface HotelCategoryOption {
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

export type VenueStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'UNDER_REVIEW';
export type HotelCategory = '5_STAR' | '4_STAR' | '3_STAR' | 'BUSINESS' | 'BUDGET' | 'RESORT' | 'BOUTIQUE';
export type HallType = 'BALLROOM' | 'CONFERENCE' | 'BANQUET' | 'BOARDROOM' | 'THEATRE' | 'OTHER';
export type IndoorOutdoor = 'INDOOR' | 'OUTDOOR' | 'BOTH';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'PRESIDENTIAL';
// PHASE 4: Occupancy designations - one matrix per hotel with 4 designation groups
export type OccupancyRuleType = 'SO' | 'DM' | 'RSM' | 'Senior Manager';
// Legacy: MIN_OCCUPANCY | 'MAX_OCCUPANCY' | 'STANDARD' (deprecated, kept for compatibility)

export const HOTEL_CATEGORY_OPTIONS: { value: HotelCategory; label: string }[] = [
  { value: '5_STAR', label: '5 Star' },
  { value: '4_STAR', label: '4 Star' },
  { value: '3_STAR', label: '3 Star' },
  { value: 'BUSINESS', label: 'Business Hotel' },
  { value: 'BUDGET', label: 'Budget Hotel' },
  { value: 'RESORT', label: 'Resort' },
  { value: 'BOUTIQUE', label: 'Boutique Hotel' },
];

// Hotel
export interface Hotel {
  id: string;
  hotel_name: string;
  city_id: string;
  zone_id?: string | null;
  hotel_brand?: string | null;
  hotel_category?: HotelCategory | null;
  address?: string | null;
  gst_number?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  sales_contact_name?: string | null;
  sales_contact_designation?: string | null;
  sales_contact_mobile?: string | null;
  sales_contact_email?: string | null;
  preferred_vendor?: boolean;
  blacklisted?: boolean;
  remarks?: string | null;
  total_rooms?: number | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: VenueStatus;
  residential_supported?: boolean;
  non_residential_supported?: boolean;
  max_residential_pax?: number;
  max_meeting_pax?: number;
  multiple_halls?: boolean;
  total_ajanta_events?: number;
  last_used_date?: string | null;
  ajanta_rating?: number | null;
  ajanta_feedback_count?: number;
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
  floor?: string | null;
  // PHASE 5 SIMPLIFIED: Only 3 seating capacities for corporate meetings
  classroom_capacity?: number | null;   // Classroom-style with tables
  u_shape_capacity?: number | null;     // U-shape configuration
  cluster_capacity?: number | null;     // Multiple cluster groups
  indoor_outdoor: IndoorOutdoor;
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
  hotel_brand?: string;
  hotel_category?: HotelCategory;
  city_id: string;
  zone_id?: string;
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
  remarks?: string;
  status?: VenueStatus;
}

export interface HotelUpdateInput {
  hotel_name?: string;
  hotel_brand?: string | null;
  hotel_category?: HotelCategory | null;
  city_id?: string;
  zone_id?: string | null;
  address?: string | null;
  gst_number?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sales_contact_name?: string | null;
  sales_contact_designation?: string | null;
  sales_contact_mobile?: string | null;
  sales_contact_email?: string | null;
  preferred_vendor?: boolean;
  blacklisted?: boolean;
  remarks?: string | null;
  status?: VenueStatus;
}

export interface HallCreateInput {
  hotel_id: string;
  hall_name: string;
  floor?: string;
  // PHASE 5 SIMPLIFIED: Only 3 seating capacities
  classroom_capacity?: number;
  u_shape_capacity?: number;
  cluster_capacity?: number;
  indoor_outdoor?: IndoorOutdoor;
  status?: VenueStatus;
}

export interface HallUpdateInput {
  hall_name?: string;
  floor?: string | null;
  // PHASE 5 SIMPLIFIED: Only 3 seating capacities
  classroom_capacity?: number | null;
  u_shape_capacity?: number | null;
  cluster_capacity?: number | null;
  indoor_outdoor?: IndoorOutdoor;
  status?: VenueStatus;
}

export interface AccommodationInventoryCreateInput {
  hotel_id: string;
  total_rooms: number;
  single_rooms?: number;
  double_rooms?: number;
  triple_rooms?: number;
  quad_rooms?: number;
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

// ============================================================================
// MULTI-SHEET BULK IMPORT TYPES
// ============================================================================

export interface BulkImportRequest {
  file: File;
  uploadedBy: string;
  fileName: string;
}

export interface MultiSheetValidationResult {
  hotels: SheetValidationResult;
  halls: SheetValidationResult;
  inventory: SheetValidationResult;
  occupancy: SheetValidationResult;
  photos: SheetValidationResult;
  totalValid: number;
  totalInvalid: number;
  allErrors: ImportValidationError[];
}

export interface SheetValidationResult {
  sheetName: string;
  validRows: number;
  invalidRows: number;
  errors: ImportValidationError[];
  toCreate: number;
  toUpdate: number;
}

export interface ImportedHotel {
  id: string;
  hotel_name: string;
  city_id: string;
  isNew: boolean;
}

export interface ImportedHall {
  id: string;
  hotel_id: string;
  hall_name: string;
  isNew: boolean;
}

export interface BulkImportResult extends ImportResult {
  inventoryCreated: number;
  occupancyCreated: number;
  photosCreated: number;
}

export interface DataQualityIssue {
  hotel_id: string;
  hotel_name: string;
  issue_type: 'MISSING_HALLS' | 'MISSING_INVENTORY' | 'MISSING_OCCUPANCY' | 'MISSING_PHOTOS';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface VenueReadinessReport {
  totalHotels: number;
  venueReadyCount: number;
  partialReadyCount: number;
  notReadyCount: number;
  readinessByHotel: Array<{
    hotel_id: string;
    hotel_name: string;
    readinessScore: number;
    status: 'READY' | 'PARTIAL' | 'NOT_READY';
    missingComponents: string[];
  }>;
}
