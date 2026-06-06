// Venue Feature Types — strictly mapped to verified Supabase schema
// Do NOT add fields that don't exist in the database.

export interface HotelCategory {
  id: string;
  category_code: string;
  category_name: string;
}

export interface City {
  id: string;
  city_name: string;
}

export interface VenuePhoto {
  id: string;
  hotel_id: string;
  hall_id?: string | null;
  photo_type: string;
  file_name?: string | null;
  storage_path: string;
  display_order?: number | null;
}

export interface Hall {
  id: string;
  hotel_id: string;
  hall_name: string;
  capacity: number;
  area?: number | null;
  floor_name?: string | null;
  seating_types?: string | null;
}

export interface Hotel {
  id: string;
  hotel_name: string;
  category_id: string;
  city_id: string;
  address?: string | null;
  contact_person?: string | null;
  contact_number?: string | null;
  email?: string | null;
  remarks?: string | null;
  status: string;
  // Joined relations (populated by API layer)
  hotel_categories?: HotelCategory | null;
  cities?: City | null;
  venue_photos?: VenuePhoto[];
  halls?: Hall[];
}

export interface VenueShortlist {
  id: string;
  request_id: string;
  hotel_id: string;
  hall_id?: string | null;
  shortlisted_by: string;
  shortlisted_at: string;
  // Joined
  hotels?: Hotel | null;
}

// UI-level composed type for display in Venue Cards
export interface VenueCardData {
  id: string;
  hotel_name: string;
  category_name: string;
  city_name: string;
  address: string;
  primaryPhotoUrl: string | null;
  maxCapacity: number;
  hallCount: number;
}

export interface VenueSearchFilters {
  searchQuery: string;
  cityId: string;
  categoryCode: string;
  capacityMin?: number;
  capacityMax?: number;
  requestId?: string;
}
