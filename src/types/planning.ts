export interface AnnualCalendar {
  id: string;
  division_id: string;
  meeting_name: string;
  meeting_type_id: string;
  month: number;
  preferred_city_id: string;
  expected_pax: number;
  fiscal_year: string;
  status: 'DRAFT' | 'PUBLISHED';
  created_at: string;
  updated_at: string;

  // Joined references
  division?: { division_name: string; cluster_id?: string; cluster?: { cluster_name: string } };
  meeting_type?: { meeting_type_name: string };
  city?: { city_name: string };
}

export interface MonthlyPlan {
  id: string;
  annual_calendar_id: string;
  division_id: string;
  meeting_name: string;
  meeting_type_id: string;
  city_id: string;
  planned_month: number;
  expected_pax: number;
  status: 'DRAFT' | 'SHARED' | 'ACCEPTED' | 'CHANGE_REQUESTED' | 'APPROVED';
  proposed_start_date: string | null;
  proposed_end_date: string | null;
  shared_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined references
  annual_calendar?: Partial<AnnualCalendar>;
  division?: { division_name: string; cluster_id?: string; cluster?: { cluster_name: string } };
  meeting_type?: { meeting_type_name: string };
  city?: { city_name: string };
}

export interface MonthlyPlanReview {
  id: string;
  monthly_plan_id: string;
  reviewer_id: string;
  decision: 'ACCEPTED' | 'CHANGE_REQUESTED';
  remarks?: string;
  reviewed_at: string;
  created_at: string;
  
  // Joined references
  reviewer?: { employee_name: string; email: string };
}
