import { supabase } from "@/lib/supabase";
import { SapClosure, SapPaymentStatus } from "@/types/sap";
import { logEventActivity } from "@/lib/eventLogger";

export const sapRepository = {
  async createSapClosure(closure: Omit<SapClosure, 'id' | 'created_at' | 'updated_at'>, userId: string, eventStatus: string) {
    const { data, error } = await supabase
      .from('sap_closures')
      .insert(closure)
      .select()
      .single();
    if (error) throw error;

    await this.updateEventStatus(closure.event_id, 'SAP_UPLOADED');
    await logEventActivity(closure.event_id, 'SAP_UPLOADED', userId, eventStatus, 'SAP_UPLOADED');
    
    return data as SapClosure;
  },

  async getSapClosureByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('sap_closures')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();
    if (error) throw error;
    return data as SapClosure | null;
  },

  async updatePaymentStatus(closureId: string, eventId: string, paymentStatus: SapPaymentStatus, userId: string, eventStatus: string) {
    const { error } = await supabase
      .from('sap_closures')
      .update({ payment_status: paymentStatus })
      .eq('id', closureId);
    if (error) throw error;

    await logEventActivity(eventId, 'PAYMENT_STATUS_UPDATED', userId, eventStatus, eventStatus);
  },

  async closeEvent(eventId: string, closureId: string, userId: string, eventStatus: string) {
    const { error: sapErr } = await supabase
      .from('sap_closures')
      .update({ closure_status: 'CLOSED' })
      .eq('id', closureId);
    if (sapErr) throw sapErr;

    await this.updateEventStatus(eventId, 'CLOSED');
    await logEventActivity(eventId, 'EVENT_CLOSED', userId, eventStatus, 'CLOSED');
  },

  async updateEventStatus(eventId: string, status: string) {
    const { error } = await supabase
      .from('events')
      .update({ lifecycle_status: status })
      .eq('id', eventId);
    if (error) throw error;
  }
};
