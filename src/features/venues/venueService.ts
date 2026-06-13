// Venue Service - Complete CRUD for Venue Master

import { supabase } from '../../lib/supabase';
import type {
  Hotel,
  HotelWithRelations,
  Hall,
  AccommodationInventory,
  OccupancyRule,
  DefaultOccupancyRule,
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
  address,
  contact_phone,
  contact_email,
  website,
  total_rooms,
  check_in_time,
  check_out_time,
  status,
  created_at,
  updated_at,
  cities:city_id (id, city_name, zone_id)
`;

const HALL_SELECT = `
  id,
  hotel_id,
  hall_name,
  hall_type,
  capacity,
  length,
  width,
  height,
  area,
  theater_capacity,
  classroom_capacity,
  cocktail_capacity,
  round_table_capacity,
  indoor_outdoor,
  amenities,
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
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        ${HOTEL_SELECT},
        halls:id (${HALL_SELECT}),
        accommodation_inventory:id (
          id, hotel_id, room_type, total_rooms, available_rooms, single_bed, double_bed, occupancy, rate_per_night, status, created_at
        ),
        hotel_occupancy_rules:id (
          id, hotel_id, rule_type, min_occupancy, max_occupancy, rate_adjustment, is_active, created_at
        ),
        venue_photos:id (
          id, hotel_id, hall_id, photo_url, photo_name, display_order, created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Hotel not found');

    return data;
  } catch (error) {
    console.error('Error fetching hotel:', error);
    throw error;
  }
}

export async function createHotel(input: HotelCreateInput): Promise<Hotel> {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .insert({
        hotel_name: input.hotel_name.trim(),
        city_id: input.city_id,
        address: input.address?.trim() || null,
        contact_phone: input.contact_phone?.trim() || null,
        contact_email: input.contact_email?.trim() || null,
        website: input.website?.trim() || null,
        total_rooms: input.total_rooms || null,
        check_in_time: input.check_in_time || null,
        check_out_time: input.check_out_time || null,
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
    if (input.city_id) updateData.city_id = input.city_id;
    if (input.address !== undefined) updateData.address = input.address?.trim() || null;
    if (input.contact_phone !== undefined) updateData.contact_phone = input.contact_phone?.trim() || null;
    if (input.contact_email !== undefined) updateData.contact_email = input.contact_email?.trim() || null;
    if (input.website !== undefined) updateData.website = input.website?.trim() || null;
    if (input.total_rooms !== undefined) updateData.total_rooms = input.total_rooms;
    if (input.check_in_time !== undefined) updateData.check_in_time = input.check_in_time;
    if (input.check_out_time !== undefined) updateData.check_out_time = input.check_out_time;
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
        hall_type: input.hall_type,
        capacity: input.capacity || null,
        length: input.length || null,
        width: input.width || null,
        height: input.height || null,
        area: input.area || null,
        theater_capacity: input.theater_capacity || null,
        classroom_capacity: input.classroom_capacity || null,
        cocktail_capacity: input.cocktail_capacity || null,
        round_table_capacity: input.round_table_capacity || null,
        indoor_outdoor: input.indoor_outdoor || 'INDOOR',
        amenities: input.amenities || null,
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
    if (input.hall_type) updateData.hall_type = input.hall_type;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.length !== undefined) updateData.length = input.length;
    if (input.width !== undefined) updateData.width = input.width;
    if (input.height !== undefined) updateData.height = input.height;
    if (input.area !== undefined) updateData.area = input.area;
    if (input.theater_capacity !== undefined) updateData.theater_capacity = input.theater_capacity;
    if (input.classroom_capacity !== undefined) updateData.classroom_capacity = input.classroom_capacity;
    if (input.cocktail_capacity !== undefined) updateData.cocktail_capacity = input.cocktail_capacity;
    if (input.round_table_capacity !== undefined) updateData.round_table_capacity = input.round_table_capacity;
    if (input.indoor_outdoor) updateData.indoor_outdoor = input.indoor_outdoor;
    if (input.amenities !== undefined) updateData.amenities = input.amenities;
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
      .eq('hotel_id', hotelId)
      .order('room_type', { ascending: true });

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
        room_type: input.room_type,
        total_rooms: input.total_rooms,
        available_rooms: input.available_rooms || input.total_rooms,
        single_bed: input.single_bed || null,
        double_bed: input.double_bed || null,
        occupancy: input.occupancy,
        rate_per_night: input.rate_per_night || null,
        status: input.status || 'ACTIVE',
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
