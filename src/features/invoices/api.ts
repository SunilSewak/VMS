import { supabase } from '../../lib/supabase';
import type { Invoice, InvoiceCreateInput, InvoiceUpdateInput, InvoiceValidationCheck } from './types';
import type { UserProfile } from '../../types';
import { ROLES } from '../../auth/permissions';

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${sequence}`;
}

export async function getInvoices(user: UserProfile): Promise<Invoice[]> {
  let query = (supabase as any)
    .from('invoices')
    .select(`*,
      bookings ( booking_reference, check_in_date, check_out_date, rooms_booked, halls_booked, expected_pax )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (user.role === ROLES.SALES_HEAD || user.role === ROLES.VIEWER) {
    query = query.eq('created_by', user.id);
  } else if (user.role === ROLES.FINANCE) {
    query = query.in('status', ['VERIFIED', 'APPROVED']);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Invoice[];
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select(`*,
      bookings ( booking_reference, check_in_date, check_out_date, rooms_booked, halls_booked, expected_pax )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Invoice not found');
  return data as Invoice;
}

export async function createInvoice(input: InvoiceCreateInput, user: UserProfile): Promise<Invoice> {
  const payload = {
    ...input,
    invoice_number: generateInvoiceNumber(),
    status: 'RECEIVED',
    created_by: user.id,
    created_at: new Date().toISOString(),
    is_deleted: false,
  } as const;

  const { data, error } = await (supabase as any)
    .from('invoices')
    .insert([payload])
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function updateInvoice(id: string, input: InvoiceUpdateInput, user: UserProfile): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .update({ ...input, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function verifyInvoice(id: string, user: UserProfile): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .update({
      status: 'VERIFIED',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function approveInvoice(id: string, user: UserProfile): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .update({
      status: 'APPROVED',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function rejectInvoice(id: string, reason: string, user: UserProfile): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .update({
      status: 'REJECTED',
      rejection_reason: reason,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function getInvoiceVariances(invoiceId: string): Promise<InvoiceValidationCheck[]> {
  const { data, error } = await (supabase as any)
    .from('invoice_validation_checks')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as InvoiceValidationCheck[];
}

export async function createInvoiceValidationChecks(
  invoiceId: string,
  checks: Omit<InvoiceValidationCheck, 'id' | 'created_at'>[]
): Promise<InvoiceValidationCheck[]> {
  const payload = checks.map((c) => ({
    ...c,
    invoice_id: invoiceId,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await (supabase as any)
    .from('invoice_validation_checks')
    .insert(payload);

  if (error) throw new Error(error.message);
  return (data ?? []) as InvoiceValidationCheck[];
}

export async function deleteInvoice(id: string, user: UserProfile): Promise<void> {
  const { error } = await (supabase as any)
    .from('invoices')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
