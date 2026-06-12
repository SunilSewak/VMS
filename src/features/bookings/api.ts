import { supabase } from '../../lib/supabase';
import type { Booking, BookingCreateInput, BookingUpdateInput } from './types';
import type { UserProfile } from '../../types';
import { ROLES } from '../../auth/permissions';

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(1000 + Math.random() * 9000);
  return `BKG-${year}-${sequence}`;
}

export async function getBookings(user: UserProfile): Promise<Booking[]> {
  let query = (supabase as any)
    .from('bookings')
    .select(`*,
      meeting_requests ( request_number, meeting_name, status ),
      hotels ( hotel_name, city_id ),
      halls ( hall_name )
    `)
    .order('created_at', { ascending: false });

  if (user.role === ROLES.SALES_HEAD || user.role === ROLES.VIEWER) {
    query = query.eq('created_by', user.id);
  } else if (user.role === ROLES.FINANCE) {
    query = query.in('status', ['CONFIRMED', 'COMPLETED']);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

export async function getBookingById(id: string): Promise<Booking> {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .select(`*,
      meeting_requests ( 
        request_number, 
        meeting_name, 
        status,
        start_date,
        end_date,
        guaranteed_pax,
        residential_flag,
        rooms_required,
        halls_required,
        created_by,
        divisions ( division_name ),
        meeting_types ( meeting_type_name ),
        cities ( city_name )
      ),
      hotels ( hotel_name, city_id, city_name ),
      halls ( hall_name )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Booking not found');
  return data as Booking;
}

export async function createBooking(input: BookingCreateInput, user: UserProfile): Promise<Booking> {
  const payload = {
    ...input,
    request_id: input.meeting_request_id,
    booking_reference: generateBookingReference(),
    status: 'REQUESTED',
    created_by: user.id,
    created_at: new Date().toISOString(),
  } as const;


  const { data, error } = await (supabase as any)
    .from('bookings')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Booking was created but no data was returned. Please check the bookings list.');
  return data as Booking;
}

export async function updateBooking(id: string, input: BookingUpdateInput, user: UserProfile): Promise<Booking> {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update({ ...input, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Booking;
}

export async function confirmBooking(id: string, user: UserProfile): Promise<Booking> {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update({
      status: 'CONFIRMED',
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Booking;
}

export async function cancelBooking(id: string, user: UserProfile): Promise<Booking> {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update({
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Booking;
}
