export type BookingStatus = 'CONFIRMED' | 'ACTIVE' | 'INVOICE_PENDING' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED';

export type RoomingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type InvoiceStatusType = 'PENDING' | 'RECEIVED' | 'UNDER_VERIFICATION' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
export type PaymentStatusType = 'PENDING' | 'PARTIAL' | 'COMPLETED';

export interface Booking {
  id: string;
  booking_reference: string;
  meeting_request_id: string;
  hotel_id: string;
  hall_id?: string | null;
  status: BookingStatus;
  check_in_date: string;
  check_out_date: string;
  rooms_booked: number;
  halls_booked: number;
  expected_pax: number;
  special_requirements?: string | null;
  amount?: number | null;
  currency?: string | null;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  updated_by?: string | null;
  
  // Operational progress tracking
  rooming_status?: RoomingStatus | null;
  rooming_completed_at?: string | null;
  
  invoice_status?: InvoiceStatusType | null;
  invoice_count?: number;
  invoice_completed_at?: string | null;
  
  payment_status?: PaymentStatusType | null;
  payment_completed_at?: string | null;
  
  // Relations
  meeting_requests?: { request_number: string; meeting_name: string; status: string } | null;
  hotels?: { hotel_name: string; city_id?: string; city_name?: string } | null;
  halls?: { hall_name: string } | null;
}

export interface BookingCreateInput {
  meeting_request_id: string;
  hotel_id: string;
  hall_id?: string | null;
  check_in_date: string;
  check_out_date: string;
  rooms_booked: number;
  halls_booked: number;
  expected_pax: number;
  special_requirements?: string | null;
  amount?: number | null;
  currency?: string | null;
}

export type BookingUpdateInput = Partial<
  Omit<
    Booking,
    'id' | 'booking_reference' | 'created_by' | 'created_at' | 'updated_at' | 'updated_by' | 'confirmed_by' | 'confirmed_at'
  >
>;

export interface BookingQueryFilters {
  status?: BookingStatus;
  meetingRequestId?: string;
  hotelId?: string;
  createdBy?: string;
}
