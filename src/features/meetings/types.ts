export type MeetingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'QUOTATION_RECEIVED'
  | 'VENUE_FINALIZED'
  | 'BOOKED'
  | 'COMPLETED'
  | 'CLOSED';

export interface MeetingRequest {
  id: string;
  request_number: string;
  meeting_name: string;
  division_id: string;
  meeting_type_id: string;
  city_id: string;
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

  // Joined fields for display
  divisions?: { name: string };
  meeting_types?: { name: string };
  cities?: { name: string };
}

export interface Division {
  id: string;
  name: string;
  active: boolean;
}

export interface City {
  id: string;
  name: string;
  state: string;
  tier?: string;
}

export interface MeetingType {
  id: string;
  name: string;
  active: boolean;
}
