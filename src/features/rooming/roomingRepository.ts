import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';
import type {
  AccommodationFilters,
  AccommodationPlan,
  AccommodationPlanCreateInput,
  AccommodationPlanUpdateInput,
  AccommodationUtilizationUpdateInput,
} from './types';

const TABLE = 'accommodation_plans';

function mapPlanRecordToAccommodationPlan(record: any): AccommodationPlan {
  return {
    ...record,
    utilization: {
      single_rooms_actual: record.single_rooms_actual ?? 0,
      double_rooms_actual: record.double_rooms_actual ?? 0,
      triple_rooms_actual: record.triple_rooms_actual ?? 0,
      actual_pax: record.actual_pax ?? 0,
      remarks: record.utilization_remarks ?? null,
    },
  };
}

export async function getAccommodationPlans(_user: UserProfile, filters?: AccommodationFilters): Promise<AccommodationPlan[]> {
  const query = (supabase as any)
    .from(TABLE)
    .select('*, bookings!inner(booking_reference, hotel_id, meeting_request_id)');

  if (filters?.status) {
    query.eq('status', filters.status);
  }
  if (filters?.bookingId) {
    query.eq('booking_id', filters.bookingId);
  }
  if (filters?.hotelId) {
    query.eq('bookings.hotel_id', filters.hotelId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message || 'Failed to fetch accommodation plans');
  }

  return (data ?? []).map(mapPlanRecordToAccommodationPlan);
}

export async function getAccommodationPlanById(id: string): Promise<AccommodationPlan> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('*, bookings!inner(booking_reference, hotel_id, meeting_request_id)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message || 'Accommodation plan not found');
  }

  return mapPlanRecordToAccommodationPlan(data);
}

export async function createAccommodationPlan(input: AccommodationPlanCreateInput, user: UserProfile): Promise<AccommodationPlan> {
  const payload = {
    ...input,
    single_rooms_actual: 0,
    double_rooms_actual: 0,
    triple_rooms_actual: 0,
    actual_pax: 0,
    utilization_remarks: null,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data, error } = await (supabase as any)
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create accommodation plan');
  }

  return mapPlanRecordToAccommodationPlan(data);
}

export async function updateAccommodationPlan(id: string, input: AccommodationPlanUpdateInput, user: UserProfile): Promise<AccommodationPlan> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .update({ ...input, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update accommodation plan');
  }

  return mapPlanRecordToAccommodationPlan(data);
}

export async function updateAccommodationUtilization(
  id: string,
  input: AccommodationUtilizationUpdateInput
): Promise<AccommodationPlan> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .update({
      single_rooms_actual: input.single_rooms_actual,
      double_rooms_actual: input.double_rooms_actual,
      triple_rooms_actual: input.triple_rooms_actual,
      actual_pax: input.actual_pax,
      utilization_remarks: input.remarks ?? null,
      updated_by: input.plan_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update accommodation utilization');
  }

  return mapPlanRecordToAccommodationPlan(data);
}

export async function deleteAccommodationPlan(id: string): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).delete().eq('id', id);
  if (error) {
    throw new Error(error.message || 'Failed to delete accommodation plan');
  }
}

export async function getAccommodationPlanByBookingId(bookingId: string): Promise<AccommodationPlan | null> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('*, bookings!inner(booking_reference, hotel_id, meeting_request_id)')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapPlanRecordToAccommodationPlan(data);
}
