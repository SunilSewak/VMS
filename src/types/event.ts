export type EventLifecycleStatus = 
  | 'DRAFT'
  | 'PLANNED'
  | 'VENUE_PROPOSED'
  | 'ALTERNATIVE_REQUESTED'
  | 'APPROVED'
  | 'BOOKED'
  | 'ROOMING_PENDING'
  | 'ROOMING_FINALIZED'
  | 'EXECUTED'
  | 'INVOICE_PENDING'
  | 'INVOICE_AUDIT'
  | 'PAYMENT_PENDING'
  | 'CLOSED'
  | 'CANCELLED';

export interface VmsEvent {
  id: string;
  event_code: string;
  event_name: string;
  division_id?: string;
  meeting_type_id?: string;
  city_id?: string;
  zone_id?: string;
  annual_calendar_id?: string;
  monthly_plan_id?: string;
  start_date?: string;
  end_date?: string;
  expected_pax?: number;
  guaranteed_pax?: number;
  residential_flag?: boolean;
  seating_style?: string;
  av_requirements?: string;
  food_requirements?: string;
  transfer_requirements?: string;
  lifecycle_status: EventLifecycleStatus;
  event_owner?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  division?: { division_name: string };
  meeting_type?: { meeting_type_name: string };
  city?: { city_name: string };
  event_owner_details?: { employee_name: string };
}

export interface EventActivityLog {
  id: string;
  event_id: string;
  action: string;
  old_status?: string;
  new_status?: string;
  performed_by: string;
  timestamp: string;
}
