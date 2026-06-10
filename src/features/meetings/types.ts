export type MeetingStatus =
  | 'DRAFT'
  | 'VENUES_SHORTLISTED'
  | 'SUBMITTED_TO_ADMIN'
  | 'AVAILABILITY_CHECK'
  | 'BOOKED'
  | 'COMPLETED'
  | 'CLOSED'
  // Compatibility fallbacks for legacy/seeded records:
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'VENUE_FINALIZED';

export interface MeetingRequest {
  id: string;
  request_number: string;
  meeting_name: string;
  division_id: string;
  meeting_type_id: string;
  city_id: string | null;
  zone: string;
  start_date: string;
  end_date: string;
  expected_pax: number;
  guaranteed_pax: number;
  residential_flag: boolean;
  rooms_required: number;
  halls_required: number;
  seating_style: string;
  av_requirements: string;
  food_requirements: string;
  transfer_requirements: string;
  status: MeetingStatus;
  created_at: string;
  created_by?: string;

  // Custom city fallback (when city not in known list)
  target_city_name?: string | null;

  // Joined fields for display
  divisions?: { division_name: string };
  meeting_types?: { meeting_type_name: string };
  cities?: { city_name: string };
}

export interface Division {
  id: string;
  division_name: string;
  active: boolean;
}

export interface City {
  id: string;
  city_name: string;
  state: string;
  tier?: string;
}

export interface MeetingType {
  id: string;
  meeting_type_name: string;
  active: boolean;
}
