import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';
import type { Payment, PaymentCreateInput, PaymentUpdateInput } from './types';

const paymentsSelect = `*,
  invoices ( id, invoice_number, invoice_amount, status, approved_at, booking_id,
    bookings ( booking_reference, hotel_id, hotel_name )
  )
`;

export async function getPayments(user: UserProfile): Promise<Payment[]> {
  void user;
  const { data, error } = await (supabase as any)
    .from('payments')
    .select(paymentsSelect)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export async function getPaymentById(id: string): Promise<Payment> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .select(paymentsSelect)
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Payment not found');
  return data as Payment;
}

export async function createPayment(input: PaymentCreateInput, user: UserProfile): Promise<Payment> {
  const payload = {
    ...input,
    status: 'RECEIVED',
    created_by: user.id,
    created_at: new Date().toISOString(),
    is_deleted: false,
  } as const;

  const { data, error } = await (supabase as any)
    .from('payments')
    .insert([payload])
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function updatePayment(id: string, input: PaymentUpdateInput, user: UserProfile): Promise<Payment> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .update({ ...input, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function markAsReceived(id: string, user: UserProfile): Promise<Payment> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .update({ status: 'RECEIVED', updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function markAsVerified(id: string, user: UserProfile): Promise<Payment> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .update({ status: 'VERIFIED', updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function markAsApproved(id: string, user: UserProfile): Promise<Payment> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .update({ status: 'APPROVED', updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function markAsPaid(id: string, user: UserProfile): Promise<Payment> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .update({ status: 'PAID', updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function deletePayment(id: string, user: UserProfile): Promise<void> {
  const { error } = await (supabase as any)
    .from('payments')
    .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
