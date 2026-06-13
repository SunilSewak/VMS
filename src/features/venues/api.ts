import { supabase } from '../../lib/supabase';
import { getZoneForCity } from '../../constants/zones';
import type {
  HotelWithRelations,
  VenueCardViewModel,
  VenueSearchFilters,
  VenueShortlist,
  HotelCategoryOption,
  City,
} from './types';

// Fetch all cities for filter dropdowns
export async function fetchCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, city_name')
    .order('city_name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Fetch all hotel categories for filter dropdowns
export async function fetchCategories(): Promise<HotelCategoryOption[]> {
  const { data, error } = await supabase
    .from('hotel_categories')
    .select('id, category_code, category_name')
    .order('category_name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Search venues with filters — returns card-ready data
// Joins: hotel_categories, cities, venue_photos (primary), halls (for MAX capacity)
// Implements zone-based filtering with city override logic
export async function searchVenues(filters: VenueSearchFilters): Promise<VenueCardViewModel[]> {
  let query = supabase
    .from('hotels')
    .select(`
      id,
      hotel_name,
      address,
      status,
      hotel_category,
      city_id,
      total_ajanta_events,
      last_used_date,
      halls ( id, classroom_capacity, u_shape_capacity, cluster_capacity )
    `)
    .eq('status', 'ACTIVE')
    .is('blacklisted', false);

  // RULE 3: City takes precedence over zone (city always wins)
  if (filters.cityId && filters.cityId !== 'all') {
    // City filter selected - use it exclusively
    query = query.eq('city_id', filters.cityId);
  } else if (filters.zone && filters.zone !== 'all') {
    // RULE 1: Zone selected only - filter by cities in that zone
    // First fetch all cities to build zone filter
    const { data: allCities } = await supabase
      .from('cities')
      .select('id, city_name') as { data: Array<{ id: string; city_name: string }> | null };
    
    if (allCities) {
      const citiesInZone = allCities
        .filter(city => getZoneForCity(city.city_name) === filters.zone)
        .map(city => city.id);
      
      if (citiesInZone.length > 0) {
        query = query.in('city_id', citiesInZone);
      } else {
        // No cities in zone - return empty results
        return [];
      }
    }
  }

  // Filter by category
  if (filters.categoryCode && filters.categoryCode !== 'all') {
    query = query.eq('hotel_category', filters.categoryCode);
  }

  const { data, error } = await query.order('hotel_name');
  if (error) throw new Error(error.message);

  const hotels = (data ?? []) as HotelWithRelations[];

  // Transform into VenueCardViewModel
  let results: VenueCardViewModel[] = hotels.map((h: HotelWithRelations) => {
    const halls = h.halls ?? [];
    const maxCapacity = halls.length > 0 
      ? Math.max(...halls.map((hall) => Math.max(
          hall.classroom_capacity ?? 0,
          hall.u_shape_capacity ?? 0,
          hall.cluster_capacity ?? 0
        )))
      : 0;

    return {
      id: h.id,
      hotelId: h.id,
      hotelName: h.hotel_name,
      categoryName: h.hotel_category ?? '—',
      cityName: h.city?.city_name ?? '—',
      address: h.address ?? '—',
      primaryImage: null,
      largestHallCapacity: maxCapacity,
      hallCount: halls.length,
      shortlisted: false,
      totalAjantaEvents: h.total_ajanta_events ?? 0,
      lastUsedDate: h.last_used_date ?? null,
    };
  });

  // Client-side text search (hotel name, city, address)
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (v) =>
        v.hotelName.toLowerCase().includes(q) ||
        v.cityName.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
    );
  }

  // Client-side capacity filter
  if (filters.capacityMin !== undefined) {
    results = results.filter((v) => v.largestHallCapacity >= (filters.capacityMin ?? 0));
  }

  return results;
}

// Get full hotel details for the Detail Page
export async function getVenueById(id: string): Promise<HotelWithRelations> {
  const { data, error } = await supabase
    .from('hotels')
    .select(`
      id, hotel_name, address, hotel_category, status,
      sales_contact_name, sales_contact_mobile, sales_contact_email,
      remarks,
      city:city_id ( id, city_name ),
      halls ( id, hotel_id, hall_name, floor, classroom_capacity, u_shape_capacity, cluster_capacity, indoor_outdoor, status ),
      photos:photos ( id, storage_path, display_order )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as HotelWithRelations;
}

// Toggle shortlist: add if not exists, or no-op (removal handled by UI for now)
export async function addToShortlist(
  requestId: string,
  hotelId: string,
  userId: string
): Promise<void> {
  const record = {
    request_id: requestId,
    hotel_id: hotelId,
    shortlisted_by: userId,
    shortlisted_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('venue_shortlists').insert(record as never);
  if (error && !error.message.includes('duplicate')) throw new Error(error.message);
}

export async function removeFromShortlist(
  requestId: string,
  hotelId: string
): Promise<void> {
  const { error } = await supabase
    .from('venue_shortlists')
    .delete()
    .eq('request_id', requestId)
    .eq('hotel_id', hotelId);
  if (error) throw new Error(error.message);
}

// Fetch shortlisted hotel IDs for a given request
export async function fetchShortlistedIds(requestId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('venue_shortlists')
    .select('hotel_id')
    .eq('request_id', requestId);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ hotel_id: string }>).map((row) => row.hotel_id);
}

// Fetch all shortlists for the logged-in user
export async function fetchMyShortlists(userId: string): Promise<VenueShortlist[]> {
  const { data, error } = await supabase
    .from('venue_shortlists')
    .select(`
      id, request_id, hotel_id, hall_id, shortlisted_by, shortlisted_at,
      hotels ( id, hotel_name, address, city:city_id ( city_name ), hotel_category, photos ( storage_path, display_order ) )
    `)
    .eq('shortlisted_by', userId)
    .order('shortlisted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as VenueShortlist[];
}

// Fetch all shortlists for a given request (includes hotel details)
export async function fetchShortlistsForRequest(requestId: string): Promise<VenueShortlist[]> {
  const { data, error } = await supabase
    .from('venue_shortlists')
    .select(`
      id, request_id, hotel_id, hall_id, shortlisted_by, shortlisted_at,
      hotels ( id, hotel_name, address, city:city_id ( city_name ), hotel_category, photos ( storage_path, display_order ) )
    `)
    .eq('request_id', requestId)
    .order('shortlisted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as VenueShortlist[];
}
