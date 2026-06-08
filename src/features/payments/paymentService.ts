import { isDemoModeActive } from '../../lib/demoMode';
import type { UserProfile } from '../../types';
import type { Payment, PaymentCreateInput, PaymentUpdateInput, PaymentQueryFilters, PaymentSummary, PaymentStatus } from './types';
import * as supabaseRepo from './paymentRepository';
import { getInvoiceById, getInvoices } from '../invoices/invoiceService';
import { demoRepository } from '../../demo/demoRepository';

async function convertDemoToPayment(data: any): Promise<Payment> {
  return {
    id: data.id,
    invoice_id: data.invoice_id,
    payment_reference: data.payment_reference ?? data.reference ?? '',
    payment_date: data.payment_date ?? data.paid_at ?? new Date().toISOString(),
    payment_amount: data.payment_amount ?? data.amount,
    payment_mode: data.payment_mode ?? data.payment_mode ?? 'OTHER',
    remarks: data.remarks ?? null,
    status: data.status as Payment['status'],
    created_at: data.created_at ?? new Date().toISOString(),
    created_by: data.created_by ?? null,
    updated_at: data.updated_at ?? null,
    updated_by: data.updated_by ?? null,
    deleted_at: data.deleted_at ?? null,
    deleted_by: data.deleted_by ?? null,
    is_deleted: data.is_deleted ?? false,
    invoice: data.invoice ? {
      id: data.invoice.id,
      invoice_number: data.invoice.invoice_number,
      invoice_amount: data.invoice.invoice_amount,
      status: data.invoice.status,
      approved_at: data.invoice.approved_at ?? null,
      booking_id: data.invoice.booking_id,
      bookings: data.invoice.bookings ? {
        booking_reference: data.invoice.bookings.booking_reference,
        hotel_id: data.invoice.bookings.hotel_id,
        hotel_name: data.invoice.bookings.hotel_name,
        division_name: data.invoice.bookings.division_name ?? undefined,
      } : null,
    } : null,
  };
}

function filterPayments(payments: Payment[], filters?: PaymentQueryFilters): Payment[] {
  if (!filters) return payments;

  return payments.filter((payment) => {
    if (filters.status && payment.status !== filters.status) return false;
    if (filters.invoiceNumber && !payment.invoice?.invoice_number.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
    if (filters.hotelId && payment.invoice?.bookings?.hotel_id !== filters.hotelId) return false;
    if (filters.divisionId && payment.invoice?.bookings?.division_name !== filters.divisionId) return false;
    if (filters.dateFrom && payment.payment_date < filters.dateFrom) return false;
    if (filters.dateTo && payment.payment_date > filters.dateTo) return false;
    return true;
  });
}

function buildSummary(payments: Payment[]): PaymentSummary {
  const totalPayments = payments.length;
  const pendingVerification = payments.filter((payment) => payment.status === 'RECEIVED').length;
  const pendingApproval = payments.filter((payment) => payment.status === 'VERIFIED').length;
  const pendingPayment = payments.filter((payment) => payment.status === 'APPROVED').length;
  const completedPayments = payments.filter((payment) => payment.status === 'PAID').length;
  const outstandingAmount = payments
    .filter((payment) => payment.status !== 'PAID')
    .reduce((sum, payment) => sum + payment.payment_amount, 0);

  return {
    totalPayments,
    pendingVerification,
    pendingApproval,
    pendingPayment,
    completedPayments,
    outstandingAmount,
  };
}

async function loadDemoPayments(): Promise<Payment[]> {
  const demoPayments = await demoRepository.getPayments();
  return Promise.all(
    demoPayments.map(async (payment) => {
      const invoiceRecord = await demoRepository.getInvoiceById(payment.invoice_id);
      return convertDemoToPayment({ ...payment, invoice: invoiceRecord });
    })
  );
}

export async function getPayments(user: UserProfile, filters?: PaymentQueryFilters): Promise<Payment[]> {
  if (isDemoModeActive()) {
    const payments = await loadDemoPayments();
    return filterPayments(payments, filters);
  }

  const payments = await supabaseRepo.getPayments(user);
  return filterPayments(payments, filters);
}

export async function getPaymentById(id: string): Promise<Payment> {
  if (isDemoModeActive()) {
    const payment = await loadDemoPayments().then((items) => items.find((item) => item.id === id));
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  return supabaseRepo.getPaymentById(id);
}

export function requiresAttention(payment: Payment): boolean {
  return payment.status !== 'PAID' && payment.status !== 'APPROVED' ? true : false;
}

export async function getApprovedInvoices(user: UserProfile) {
  return getInvoices(user, { status: 'APPROVED' });
}

export async function createPayment(input: PaymentCreateInput, user: UserProfile): Promise<Payment> {
  const invoice = await getInvoiceById(input.invoice_id);
  if (invoice.status !== 'APPROVED') {
    throw new Error('Payment can only be created for approved invoices.');
  }

  if (isDemoModeActive()) {
    const payment = await demoRepository.createPayment({
      ...input,
      status: 'RECEIVED',
      created_by: user.id,
      created_at: new Date().toISOString(),
      is_deleted: false,
    });
    return convertDemoToPayment(payment);
  }

  return supabaseRepo.createPayment(input, user);
}

export async function updatePayment(id: string, input: PaymentUpdateInput, user: UserProfile): Promise<Payment> {
  if (isDemoModeActive()) {
    const updated = await demoRepository.updatePayment(id, {
      ...input,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    });
    return convertDemoToPayment(updated);
  }
  return supabaseRepo.updatePayment(id, input, user);
}

async function ensureInvoiceApproved(invoiceId: string) {
  const invoice = await getInvoiceById(invoiceId);
  if (invoice.status !== 'APPROVED') {
    throw new Error('Payments can only be updated after the invoice has been approved.');
  }
}

export async function markPaymentVerified(id: string, user: UserProfile): Promise<Payment> {
  const payment = await getPaymentById(id);
  if (payment.status !== 'RECEIVED') {
    throw new Error('Only received payments can be verified.');
  }
  await ensureInvoiceApproved(payment.invoice_id);

  if (isDemoModeActive()) {
    const updated = await demoRepository.updatePayment(id, {
      status: 'VERIFIED',
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    } as any);
    return convertDemoToPayment(updated);
  }

  return supabaseRepo.markAsVerified(id, user);
}

export async function markPaymentApproved(id: string, user: UserProfile): Promise<Payment> {
  const payment = await getPaymentById(id);
  if (payment.status !== 'VERIFIED') {
    throw new Error('Only verified payments can be approved.');
  }
  await ensureInvoiceApproved(payment.invoice_id);

  if (isDemoModeActive()) {
    const updated = await demoRepository.updatePayment(id, {
      status: 'APPROVED',
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    } as any);
    return convertDemoToPayment(updated);
  }

  return supabaseRepo.markAsApproved(id, user);
}

export async function markPaymentPaid(id: string, user: UserProfile): Promise<Payment> {
  const payment = await getPaymentById(id);
  if (payment.status !== 'APPROVED') {
    throw new Error('Only approved payments can be marked paid.');
  }
  await ensureInvoiceApproved(payment.invoice_id);

  if (isDemoModeActive()) {
    const updated = await demoRepository.updatePayment(id, {
      status: 'PAID',
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    } as any);
    return convertDemoToPayment(updated);
  }

  return supabaseRepo.markAsPaid(id, user);
}

export function getPaymentSummary(payments: Payment[]): PaymentSummary {
  return buildSummary(payments);
}

export function getOutstandingPayments(payments: Payment[]): Payment[] {
  return payments.filter((payment) => payment.status !== 'PAID');
}

export function getPaymentsByStatus(payments: Payment[], status: PaymentStatus): Payment[] {
  return payments.filter((payment) => payment.status === status);
}

export function getDaysOutstanding(payment: Payment): number {
  const referenceDate = new Date(payment.payment_date || payment.created_at);
  const days = Math.floor((new Date().getTime() - referenceDate.getTime()) / 86400000);
  return Math.max(0, days);
}

export function isPaymentComplete(payment: Payment): boolean {
  return payment.status === 'PAID';
}
