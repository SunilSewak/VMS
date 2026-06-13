// Venue Service - Complete CRUD for Venue Master

import { supabase } from '../../lib/supabase';
import type {
  Hotel,
  HotelWithRelations,
  Hall,
  AccommodationInventory,
  OccupancyRule,
  VenuePhoto,
  HotelCreateInput,
  HotelUpdateInput,
  HallCreateInput,
  HallUpdateInput,
  AccommodationInventoryCreateInput,
  OccupancyRuleCreateInput,
} from './types';

const HOTEL_SELECT = `
  id,
  hotel_name,
  city_id,
  zone_id,
  hotel_brand,
  hotel_category,
  address,
  gst_number,
  website,
  latitude,
  longitude,
  sales_contact_name,
  sales_contact_designation,
  sales_contact_mobile,
  sales_contact_email,
  preferred_vendor,
  blacklisted,
  remarks,
  status,
  created_at,
  updated_at
`;

const HALL_SELECT = `
  id,
  hotel_id,
  hall_name,
  hall_type,
  capacity,
  floor,
  area_sqft,
  theatre_capacity,
  classroom_capacity,
  u_shape_capacity,
  cluster_capacity,
  boardroom_capacity,
  round_table_capacity,
  indoor_outdoor,
  status,
  created_at,
  updated_at
`;

// ============================================================================
// HOTELS
// ============================================================================

export async function getHotels(): Promise<Hotel[]> {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select(HOTEL_SELECT)
      .order('hotel_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
}

export async function getHotelById(id: string): Promise<HotelWithRelations> {
  try {
    console.log('=== getHotelById START ===');
    console.log('Fetching hotel ID:', id);

    // First, fetch the basic hotel data
    const { data: hotelData, error: hotelError } = await supabase
      .from('hotels')
      .select(HOTEL_SELECT)
      .eq('id', id)
      .single();

    console.log('Hotel fetch result:', { hotelData, hotelError });
    if (hotelError) throw new Error(`Hotel fetch failed: ${hotelError.message}`);
    if (!hotelData) throw new Error('Hotel not found');

    console.log('Hotel fetched successfully:', hotelData.hotel_name);

    // Then fetch relations separately - COLLECT ERRORS but don't fail completely
    const errors: string[] = [];

    // Fetch city
    let city = null;
    try {
      console.log('Fetching city for hotel:', hotelData.city_id);
      const res = await supabase
        .from('cities')
        .select('id, city_name, zone_id')
        .eq('id', hotelData.city_id)
        .single();
      if (res.error) {
        console.warn('City fetch warning:', res.error.message);
        errors.push(`City: ${res.error.message}`);
      } else {
        city = res.data;
        console.log('City fetched successfully:', city?.city_name);
      }
    } catch (err) {
      console.warn('City fetch exception:', err);
      errors.push(`City: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Fetch halls
    let halls: Hall[] = [];
    try {
      console.log('Fetching halls for hotel:', id);
      const res = await supabase
        .from('halls')
        .select(HALL_SELECT)
        .eq('hotel_id', id);
      if (res.error) {
        console.warn('Halls fetch warning:', res.error.message);
        errors.push(`Halls: ${res.error.message}`);
      } else {
        halls = res.data || [];
        console.log('Halls fetched successfully:', halls.length, 'halls');
      }
    } catch (err) {
      console.warn('Halls fetch exception:', err);
      errors.push(`Halls: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Fetch accommodation
    let accommodation: AccommodationInventory[] = [];
    try {
      console.log('Fetching accommodation for hotel:', id);
      const res = await supabase
        .from('hotel_accommodation_inventory')
        .select('id, hotel_id, total_rooms, single_rooms, double_rooms, triple_rooms, quad_rooms, status, created_at, updated_at')
        .eq('hotel_id', id);
      if (res.error) {
        console.warn('Accommodation fetch warning:', res.error.message);
        errors.push(`Accommodation: ${res.error.message}`);
      } else {
        accommodation = res.data || [];
        console.log('Accommodation fetched successfully:', accommodation.length, 'records');
      }
    } catch (err) {
      console.warn('Accommodation fetch exception:', err);
      errors.push(`Accommodation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Fetch occupancy rules
    let rules: OccupancyRule[] = [];
    try {
      console.log('Fetching occupancy rules for hotel:', id);
      const res = await supabase
        .from('hotel_occupancy_rules')
        .select('id, hotel_id, rule_type, min_occupancy, max_occupancy, rate_adjustment, is_active, created_at')
        .eq('hotel_id', id);
      if (res.error) {
        console.warn('Rules fetch warning:', res.error.message);
        errors.push(`Occupancy Rules: ${res.error.message}`);
      } else {
        rules = res.data || [];
        console.log('Rules fetched successfully:', rules.length, 'rules');
      }
    } catch (err) {
      console.warn('Rules fetch exception:', err);
      errors.push(`Occupancy Rules: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Fetch photos
    let photos: VenuePhoto[] = [];
    try {
      console.log('Fetching photos for hotel:', id);
      const res = await supabase
        .from('venue_photos')
        .select('id, hotel_id, hall_id, photo_url, photo_name, display_order, created_at')
        .eq('hotel_id', id);
      if (res.error) {
        console.warn('Photos fetch warning:', res.error.message);
        errors.push(`Photos: ${res.error.message}`);
      } else {
        photos = res.data || [];
        console.log('Photos fetched successfully:', photos.length, 'photos');
      }
    } catch (err) {
      console.warn('Photos fetch exception:', err);
      errors.push(`Photos: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Log any collection errors
    if (errors.length > 0) {
      console.warn('=== Partial Data Loading - Errors Encountered ===');
      errors.forEach(err => console.warn('  -', err));
      console.warn('Hotel details will load with available data only');
    }

    // Combine results - HOTEL DATA IS CRITICAL, RELATIONS ARE OPTIONAL
    const result: HotelWithRelations = {
      ...hotelData,
      city,
      halls,
      accommodation_inventory: accommodation,
      occupancy_rules: rules,
      photos: photos,
    };

    console.log('=== getHotelById SUCCESS ===');
    console.log('Hotel loaded with:', {
      hotel: result.hotel_name,
      city: result.city?.city_name || 'N/A',
      halls: result.halls?.length || 0,
      accommodation: result.accommodation_inventory?.length || 0,
      rules: result.occupancy_rules?.length || 0,
      photos: result.photos?.length || 0,
      errors: errors.length,
    });
    return result;
  } catch (error) {
    console.error('=== getHotelById ERROR ===', error);
    throw error;
  }
}

export async function createHotel(input: HotelCreateInput): Promise<Hotel> {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .insert({
        hotel_name: input.hotel_name.trim(),
        hotel_brand: input.hotel_brand?.trim() || null,
        hotel_category: input.hotel_category || null,
        zone_id: input.zone_id || null,
        city_id: input.city_id,
        address: input.address?.trim() || null,
        gst_number: input.gst_number?.trim() || null,
        website: input.website?.trim() || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        sales_contact_name: input.sales_contact_name?.trim() || null,
        sales_contact_designation: input.sales_contact_designation?.trim() || null,
        sales_contact_mobile: input.sales_contact_mobile?.trim() || null,
        sales_contact_email: input.sales_contact_email?.trim() || null,
        preferred_vendor: input.preferred_vendor || false,
        blacklisted: input.blacklisted || false,
        remarks: input.remarks?.trim() || null,
        status: input.status || 'PENDING_APPROVAL',
      })
      .select(HOTEL_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error creating hotel:', error);
    throw error;
  }
}

export async function updateHotel(id: string, input: HotelUpdateInput): Promise<Hotel> {
  try {
    const updateData: any = {};
    if (input.hotel_name) updateData.hotel_name = input.hotel_name.trim();
    if (input.hotel_brand !== undefined) updateData.hotel_brand = input.hotel_brand?.trim() || null;
    if (input.hotel_category !== undefined) updateData.hotel_category = input.hotel_category || null;
    if (input.zone_id !== undefined) updateData.zone_id = input.zone_id || null;
    if (input.city_id) updateData.city_id = input.city_id;
    if (input.address !== undefined) updateData.address = input.address?.trim() || null;
    if (input.gst_number !== undefined) updateData.gst_number = input.gst_number?.trim() || null;
    if (input.website !== undefined) updateData.website = input.website?.trim() || null;
    if (input.latitude !== undefined) updateData.latitude = input.latitude || null;
    if (input.longitude !== undefined) updateData.longitude = input.longitude || null;
    if (input.sales_contact_name !== undefined) updateData.sales_contact_name = input.sales_contact_name?.trim() || null;
    if (input.sales_contact_designation !== undefined) updateData.sales_contact_designation = input.sales_contact_designation?.trim() || null;
    if (input.sales_contact_mobile !== undefined) updateData.sales_contact_mobile = input.sales_contact_mobile?.trim() || null;
    if (input.sales_contact_email !== undefined) updateData.sales_contact_email = input.sales_contact_email?.trim() || null;
    if (input.preferred_vendor !== undefined) updateData.preferred_vendor = input.preferred_vendor;
    if (input.blacklisted !== undefined) updateData.blacklisted = input.blacklisted;
    if (input.remarks !== undefined) updateData.remarks = input.remarks?.trim() || null;
    if (input.status) updateData.status = input.status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('hotels')
      .update(updateData)
      .eq('id', id)
      .select(HOTEL_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating hotel:', error);
    throw error;
  }
}

export async function deleteHotel(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Error deleting hotel:', error);
    throw error;
  }
}

// ============================================================================
// HALLS
// ============================================================================

export async function getHallsByHotel(hotelId: string): Promise<Hall[]> {
  try {
    const { data, error } = await supabase
      .from('halls')
      .select(HALL_SELECT)
      .eq('hotel_id', hotelId)
      .order('hall_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Error fetching halls:', error);
    throw error;
  }
}

export async function getHallById(id: string): Promise<Hall> {
  try {
    const { data, error } = await supabase
      .from('halls')
      .select(HALL_SELECT)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Hall not found');
    return data;
  } catch (error) {
    console.error('Error fetching hall:', error);
    throw error;
  }
}

export async function createHall(input: HallCreateInput): Promise<Hall> {
  try {
    const { data, error } = await supabase
      .from('halls')
      .insert({
        hotel_id: input.hotel_id,
        hall_name: input.hall_name.trim(),
        floor: input.floor || null,
        classroom_capacity: input.classroom_capacity || null,
        u_shape_capacity: input.u_shape_capacity || null,
        cluster_capacity: input.cluster_capacity || null,
        indoor_outdoor: input.indoor_outdoor || 'INDOOR',
        status: input.status || 'ACTIVE',
      })
      .select(HALL_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error creating hall:', error);
    throw error;
  }
}

export async function updateHall(id: string, input: HallUpdateInput): Promise<Hall> {
  try {
    const updateData: any = {};
    if (input.hall_name) updateData.hall_name = input.hall_name.trim();
    if (input.floor !== undefined) updateData.floor = input.floor;
    if (input.classroom_capacity !== undefined) updateData.classroom_capacity = input.classroom_capacity;
    if (input.u_shape_capacity !== undefined) updateData.u_shape_capacity = input.u_shape_capacity;
    if (input.cluster_capacity !== undefined) updateData.cluster_capacity = input.cluster_capacity;
    if (input.indoor_outdoor) updateData.indoor_outdoor = input.indoor_outdoor;
    if (input.status) updateData.status = input.status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('halls')
      .update(updateData)
      .eq('id', id)
      .select(HALL_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating hall:', error);
    throw error;
  }
}

export async function deleteHall(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('halls')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Error deleting hall:', error);
    throw error;
  }
}

// ============================================================================
// ACCOMMODATION INVENTORY
// ============================================================================

export async function getAccommodationByHotel(hotelId: string): Promise<AccommodationInventory[]> {
  try {
    const { data, error } = await supabase
      .from('hotel_accommodation_inventory')
      .select('*')
      .eq('hotel_id', hotelId);

    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Error fetching accommodation inventory:', error);
    throw error;
  }
}

export async function createAccommodation(input: AccommodationInventoryCreateInput): Promise<AccommodationInventory> {
  try {
    const { data, error } = await supabase
      .from('hotel_accommodation_inventory')
      .insert({
        hotel_id: input.hotel_id,
        total_rooms: input.total_rooms,
        single_rooms: input.single_rooms || 0,
        double_rooms: input.double_rooms || 0,
        triple_rooms: input.triple_rooms || 0,
        quad_rooms: input.quad_rooms || 0,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error creating accommodation:', error);
    throw error;
  }
}

export async function updateAccommodation(id: string, input: Partial<AccommodationInventoryCreateInput>): Promise<AccommodationInventory> {
  try {
    const updateData: any = {};
    if (input.total_rooms !== undefined) updateData.total_rooms = input.total_rooms;
    if (input.single_rooms !== undefined) updateData.single_rooms = input.single_rooms;
    if (input.double_rooms !== undefined) updateData.double_rooms = input.double_rooms;
    if (input.triple_rooms !== undefined) updateData.triple_rooms = input.triple_rooms;
    if (input.quad_rooms !== undefined) updateData.quad_rooms = input.quad_rooms;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('hotel_accommodation_inventory')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating accommodation:', error);
    throw error;
  }
}

export async function deleteAccommodation(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hotel_accommodation_inventory')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    throw error;
  }
}

// ============================================================================
// OCCUPANCY RULES
// ============================================================================

export async function getOccupancyRulesByHotel(hotelId: string): Promise<OccupancyRule[]> {
  try {
    const { data, error } = await supabase
      .from('hotel_occupancy_rules')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('is_active', true);

    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Error fetching occupancy rules:', error);
    throw error;
  }
}

export async function createOccupancyRule(input: OccupancyRuleCreateInput): Promise<OccupancyRule> {
  try {
    const { data, error } = await supabase
      .from('hotel_occupancy_rules')
      .insert({
        hotel_id: input.hotel_id,
        rule_type: input.rule_type,
        min_occupancy: input.min_occupancy || null,
        max_occupancy: input.max_occupancy || null,
        rate_adjustment: input.rate_adjustment || null,
        is_active: input.is_active !== false,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error creating occupancy rule:', error);
    throw error;
  }
}

export async function updateOccupancyRule(id: string, input: Partial<OccupancyRuleCreateInput>): Promise<OccupancyRule> {
  try {
    const updateData: any = {};
    if (input.rule_type) updateData.rule_type = input.rule_type;
    if (input.min_occupancy !== undefined) updateData.min_occupancy = input.min_occupancy;
    if (input.max_occupancy !== undefined) updateData.max_occupancy = input.max_occupancy;
    if (input.rate_adjustment !== undefined) updateData.rate_adjustment = input.rate_adjustment;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('hotel_occupancy_rules')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating occupancy rule:', error);
    throw error;
  }
}

export async function deleteOccupancyRule(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hotel_occupancy_rules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Error deleting occupancy rule:', error);
    throw error;
  }
}
