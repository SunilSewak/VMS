export type AccommodationPlanStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'APPROVED'
  | 'EXECUTED'
  | 'RECONCILED'
  | 'CLOSED';

export interface AccommodationFilters {
  bookingId?: string;
  hotelId?: string;
  status?: AccommodationPlanStatus;
}

export interface AccommodationUtilization {
  single_rooms_actual: number;
  double_rooms_actual: number;
  triple_rooms_actual: number;
  actual_pax: number;
  remarks?: string | null;
}

export interface AccommodationPlan {
  id: string;
  booking_id: string;
  status: AccommodationPlanStatus;
  expected_pax: number;
  single_rooms_planned: number;
  double_rooms_planned: number;
  triple_rooms_planned: number;
  remarks?: string | null;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  booking?: {
    booking_reference: string;
    hotels?: { hotel_name: string; city_name?: string };
    meeting_requests?: { meeting_name: string; request_number?: string };
  };
  utilization?: AccommodationUtilization;
}

export interface AccommodationPlanCreateInput {
  booking_id: string;
  status: AccommodationPlanStatus;
  expected_pax: number;
  single_rooms_planned: number;
  double_rooms_planned: number;
  triple_rooms_planned: number;
  remarks?: string | null;
}

export type AccommodationPlanUpdateInput = Partial<
  Omit<AccommodationPlan, 'id' | 'booking_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'booking' | 'utilization'>
>;

export interface AccommodationUtilizationUpdateInput {
  plan_id: string;
  single_rooms_actual: number;
  double_rooms_actual: number;
  triple_rooms_actual: number;
  actual_pax: number;
  remarks?: string | null;
}
