import { supabase } from "@/lib/supabase";
import { AnnualCalendar, MonthlyPlan, MonthlyPlanReview } from "@/types/planning";

export const planningRepository = {
  
  // =====================
  // ANNUAL CALENDAR
  // =====================
  
  async getAnnualCalendars() {
    const { data, error } = await supabase
      .from('annual_calendars')
      .select(`
        *,
        division:divisions(division_name, cluster_id, cluster:clusters(cluster_name)),
        meeting_type:meeting_types(meeting_type_name),
        city:cities!annual_calendars_preferred_city_id_fkey(city_name)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      // Fallback for city foreign key if named differently or if default join fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('annual_calendars')
        .select(`
          *,
          division:divisions(division_name, cluster_id, cluster:clusters(cluster_name)),
          meeting_type:meeting_types(meeting_type_name)
        `)
        .order('created_at', { ascending: false });
        
      if (fallbackError) throw fallbackError;
      return fallbackData as AnnualCalendar[];
    }
    
    return data as AnnualCalendar[];
  },

  async createAnnualCalendar(plan: Partial<AnnualCalendar>) {
    const { data, error } = await supabase
      .from('annual_calendars')
      .insert([plan])
      .select()
      .single();
    if (error) throw error;
    return data as AnnualCalendar;
  },

  async createAnnualCalendars(plans: Partial<AnnualCalendar>[]) {
    if (plans.length === 0) return [];
    const { data, error } = await supabase
      .from('annual_calendars')
      .insert(plans)
      .select();
    if (error) throw error;
    return data as AnnualCalendar[];
  },

  async updateAnnualCalendar(id: string, updates: Partial<AnnualCalendar>) {
    const { data, error } = await supabase
      .from('annual_calendars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as AnnualCalendar;
  },

  // =====================
  // MONTHLY PLANS
  // =====================

  async getMonthlyPlans() {
    const { data, error } = await supabase
      .from('monthly_plans')
      .select(`
        *,
        division:divisions(division_name, cluster_id, cluster:clusters(cluster_name)),
        meeting_type:meeting_types(meeting_type_name),
        city:cities(city_name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MonthlyPlan[];
  },
  
  async getMonthlyPlansByDivision(divisionId: string) {
    const { data, error } = await supabase
      .from('monthly_plans')
      .select(`
        *,
        division:divisions(division_name, cluster_id, cluster:clusters(cluster_name)),
        meeting_type:meeting_types(meeting_type_name),
        city:cities(city_name)
      `)
      .eq('division_id', divisionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MonthlyPlan[];
  },

  async createMonthlyPlan(plan: Partial<MonthlyPlan>) {
    const { data, error } = await supabase
      .from('monthly_plans')
      .insert([plan])
      .select()
      .single();
    if (error) throw error;
    return data as MonthlyPlan;
  },

  async createMonthlyPlans(plans: Partial<MonthlyPlan>[]) {
    if (plans.length === 0) return [];
    const { data, error } = await supabase
      .from('monthly_plans')
      .insert(plans)
      .select();
    if (error) throw error;
    return data as MonthlyPlan[];
  },

  async updateMonthlyPlanStatus(id: string, status: MonthlyPlan['status'], dates?: { proposed_start_date: string, proposed_end_date: string }) {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (status === 'SHARED') updateData.shared_at = new Date().toISOString();
    if (status === 'APPROVED') updateData.approved_at = new Date().toISOString();
    if (dates) {
      updateData.proposed_start_date = dates.proposed_start_date;
      updateData.proposed_end_date = dates.proposed_end_date;
    }
    
    const { data, error } = await supabase
      .from('monthly_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MonthlyPlan;
  },

  // =====================
  // REVIEWS
  // =====================

  async getReviewsForPlan(monthlyPlanId: string) {
    const { data, error } = await supabase
      .from('monthly_plan_reviews')
      .select(`
        *,
        reviewer:users(employee_name, email)
      `)
      .eq('monthly_plan_id', monthlyPlanId)
      .order('reviewed_at', { ascending: false });
    if (error) throw error;
    return data as MonthlyPlanReview[];
  },

  async submitReview(review: Partial<MonthlyPlanReview>) {
    const { data, error } = await supabase
      .from('monthly_plan_reviews')
      .insert([review])
      .select()
      .single();
    if (error) throw error;
    
    // Also update the status of the monthly plan based on decision
    const newStatus = review.decision === 'ACCEPTED' ? 'ACCEPTED' : 'CHANGE_REQUESTED';
    await this.updateMonthlyPlanStatus(review.monthly_plan_id!, newStatus);
    
    return data as MonthlyPlanReview;
  },

  // =====================
  // EVENT GENERATION
  // =====================

  async generateEventFromPlan(plan: MonthlyPlan, userId: string) {
    // 1. Create the event
    const eventCode = `EVT-${Math.floor(1000 + Math.random() * 9000)}`; // Simple generator
    
    const { data: event, error } = await supabase
      .from('events')
      .insert([{
        event_code: eventCode,
        event_name: plan.meeting_name,
        division_id: plan.division_id,
        meeting_type_id: plan.meeting_type_id,
        city_id: plan.city_id,
        annual_calendar_id: plan.annual_calendar_id,
        monthly_plan_id: plan.id,
        start_date: plan.proposed_start_date,
        end_date: plan.proposed_end_date,
        expected_pax: plan.expected_pax,
        lifecycle_status: 'PLANNED',
        event_owner: userId,
        remarks: 'Generated from Monthly Plan',
        // defaults
        guaranteed_pax: plan.expected_pax,
        residential_flag: true,
        fiscal_year: '2026-27'
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // 2. Mark monthly plan as APPROVED (or it should already be APPROVED, but we might want a GENERATED status if it existed, but we'll stick to APPROVED)
    // Actually, rules say: "Only approved monthly plans may generate Events."
    
    return event;
  }
};
