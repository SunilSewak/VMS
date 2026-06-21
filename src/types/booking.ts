export interface Booking {
  id: string;
  event_id: string;
  hotel_id: string;
  hall_id: string;
  booking_reference?: string;
  booking_date?: string;
  booking_status: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface RoomRequirement {
  id: string;
  booking_id: string;
  so_count: number;
  dm_count: number;
  rsm_count: number;
  dsm_count: number;
  ch_count: number;
  ibh_count: number;
  nsm_count: number;
  triple_rooms: number;
  double_rooms: number;
  single_rooms: number;
  suites: number;
  created_at?: string;
  updated_at?: string;
}
