import { Hotel, Hall } from './master';

export interface VenueCalendar {
  id: string;
  hotel_id: string;
  hall_id: string;
  event_id: string;
  start_date: string;
  end_date: string;
  status: 'Reserved' | 'Booked' | 'Blocked' | 'Cancelled';
  created_at?: string;
}

export interface VenueAllocation {
  id: string;
  event_id: string;
  hotel_id: string;
  hall_id: string;
  proposed_dates?: string;
  status: 'Proposed' | 'Approved' | 'Rejected';
  allocated_by?: string;
  created_at?: string;
  updated_at?: string;

  // Relations
  hotel?: Hotel;
  hall?: Hall;
}
