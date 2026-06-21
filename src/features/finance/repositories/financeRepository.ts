import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceAudit, InvoiceVariance, CommercialVersion } from "@/types/finance";
import { logEventActivity } from "@/lib/eventLogger";

export const financeRepository = {
  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>, userId: string, eventStatus: string) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    if (error) throw error;

    await this.updateEventStatus(invoice.event_id, 'INVOICE_RECEIVED');
    await logEventActivity(invoice.event_id, 'INVOICE_RECEIVED', userId, eventStatus, 'INVOICE_RECEIVED');
    
    return data as Invoice;
  },

  async getInvoice(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async getInvoicesByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Invoice[];
  },

  async getApprovedCommercial(hotelId: string) {
    const { data, error } = await supabase
      .from('approved_commercials')
      .select('id')
      .eq('hotel_id', hotelId)
      .single();
    if (error) return null;
    return data;
  },

  async getCommercialVersions(approvedCommercialId: string) {
    const { data, error } = await supabase
      .from('commercial_versions')
      .select('*')
      .eq('approved_commercial_id', approvedCommercialId)
      .order('version_number', { ascending: false });
    if (error) throw error;
    return data as CommercialVersion[];
  },

  async createAudit(audit: Omit<InvoiceAudit, 'id' | 'created_at'>, userId: string, eventStatus: string) {
    const { data, error } = await supabase
      .from('invoice_audits')
      .insert(audit)
      .select()
      .single();
    if (error) throw error;

    await this.updateEventStatus(audit.event_id, 'AUDITED');
    await logEventActivity(audit.event_id, 'AUDIT_COMPLETED', userId, eventStatus, 'AUDITED');

    return data as InvoiceAudit;
  },

  async createVariance(variance: Omit<InvoiceVariance, 'id'>) {
    const { data, error } = await supabase
      .from('invoice_variances')
      .insert(variance)
      .select()
      .single();
    if (error) throw error;
    return data as InvoiceVariance;
  },

  async updateEventStatus(eventId: string, status: string) {
    const { error } = await supabase
      .from('events')
      .update({ lifecycle_status: status })
      .eq('id', eventId);
    if (error) throw error;
  }
};
