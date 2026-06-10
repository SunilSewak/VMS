import { supabase } from '../../lib/supabase';
import { MeetingRequest, Division, City, MeetingType, MeetingStatus } from './types';
import { UserProfile } from '../../types';
import { ROLES } from '../../auth/permissions';

// Fetch all active divisions
export async function getDivisions(): Promise<Division[]> {
  const { data, error } = await (supabase as any)
    .from('divisions')
    .select('*')
    .order('division_name', { ascending: true });

  if (error) throw new Error(error.message);
  console.log('Supabase Divisions data:', data);
  return data || [];
}

// Fetch all cities
export async function getCities(): Promise<City[]> {
  const { data, error } = await (supabase as any)
    .from('cities')
    .select('*')
    .order('city_name', { ascending: true });

  if (error) throw new Error(error.message);
  console.log('Supabase Cities data:', data);
  return data || [];
}

// Fetch all active meeting types
export async function getMeetingTypes(): Promise<MeetingType[]> {
  const { data, error } = await (supabase as any)
    .from('meeting_types')
    .select('*')
    .order('meeting_type_name', { ascending: true });

  if (error) throw new Error(error.message);
  console.log('Supabase Meeting Types data:', data);
  return data || [];
}

// Fetch meeting requests based on role
export async function getMeetingRequests(user: UserProfile): Promise<MeetingRequest[]> {
  let query = (supabase as any)
    .from('meeting_requests')
    .select(`
      id, request_number, meeting_name, division_id, meeting_type_id,
      city_id, zone, start_date, end_date, expected_pax, guaranteed_pax,
      residential_flag, rooms_required, halls_required, seating_style,
      av_requirements, food_requirements, transfer_requirements, status,
      created_at, created_by,
      divisions ( division_name ),
      meeting_types ( meeting_type_name ),
      cities ( city_name )
    `);

  // Role-based access logic:
  // SALES_HEAD: only see their own requests or division requests.
  // We check if created_by is user.id.
  if (user.role === ROLES.SALES_HEAD) {
    query = query.eq('created_by', user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// Fetch a single meeting request by ID
export async function getMeetingRequestById(id: string): Promise<MeetingRequest> {
  const { data, error } = await (supabase as any)
    .from('meeting_requests')
    .select(`
      *,
      divisions ( division_name ),
      meeting_types ( meeting_type_name ),
      cities ( city_name )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Meeting request not found');
  return data;
}

// Helper to generate a temp request number if db doesn't handle it
function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${rand}`;
}

// Create a new meeting request
export async function createMeetingRequest(
  input: Omit<MeetingRequest, 'id' | 'request_number' | 'status' | 'created_at' | 'created_by'>,
  user: UserProfile,
  status: MeetingStatus = 'DRAFT'
): Promise<MeetingRequest> {
  const reqNum = generateRequestNumber();
  const payload = {
    ...input,
    request_number: reqNum,
    status,
    created_by: user.id
  };

  // Debug: Log the payload before insert
  console.log('Meeting Request Payload', payload);

  const { data, error } = await (supabase as any)
    .from('meeting_requests')
    .insert([payload])
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Update an existing draft or submit it
export async function updateMeetingRequest(
  id: string,
  input: Partial<Omit<MeetingRequest, 'id' | 'request_number' | 'created_at' | 'created_by'>>,
  status?: MeetingStatus
): Promise<MeetingRequest> {
  const payload = { ...input };
  if (status) {
    payload.status = status;
  }

  const { data, error } = await (supabase as any)
    .from('meeting_requests')
    .update(payload)
    .eq('id', id)
    .select(`
      *,
      divisions ( division_name ),
      meeting_types ( meeting_type_name ),
      cities ( city_name )
    `)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Delete a draft request
export async function deleteMeetingRequest(id: string): Promise<void> {
  // RLS or database constraints will prevent deletion of non-draft if configured, 
  // but let's handle the direct delete query here.
  const { error } = await (supabase as any)
    .from('meeting_requests')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
