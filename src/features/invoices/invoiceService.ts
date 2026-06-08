import { isDemoModeActive } from '../../lib/demoMode';
import * as supabaseApi from './api';
import { demoRepository, DemoInvoice } from '../../demo/demoRepository';
import type {
  Invoice,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceQueryFilters,
  InvoiceValidationCheck,
} from './types';
import type { UserProfile } from '../../types';
import { validateInvoicePackage } from './invoiceValidationService';


async function convertDemoToInvoice(data: DemoInvoice): Promise<Invoice> {
  return {
    id: data.id,
    booking_id: data.booking_id,
    invoice_number: data.invoice_number,
    invoice_date: data.invoice_date,
    invoice_amount: data.invoice_amount,
    room_charges: data.room_charges,
    hall_charges: data.hall_charges,
    food_charges: data.food_charges,
    tax_amount: data.tax_amount,
    pax_billed: data.pax_billed,
    remarks: data.remarks ?? null,
    status: data.status as Invoice['status'],
    verified_by: data.verified_by ?? null,
    verified_at: data.verified_at ?? null,
    approved_by: data.approved_by ?? null,
    approved_at: data.approved_at ?? null,
    rejection_reason: data.rejection_reason ?? null,
    created_by: data.created_by ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at ?? null,
    updated_by: data.updated_by ?? null,
    is_deleted: data.is_deleted ?? false,
    deleted_at: data.deleted_at ?? null,
    deleted_by: data.deleted_by ?? null,
    bookings: null,
  };
}

const supabaseRepo = {
  getInvoices: supabaseApi.getInvoices,
  getInvoiceById: supabaseApi.getInvoiceById,
  createInvoice: supabaseApi.createInvoice,
  updateInvoice: supabaseApi.updateInvoice,
  verifyInvoice: supabaseApi.verifyInvoice,
  approveInvoice: supabaseApi.approveInvoice,
  rejectInvoice: supabaseApi.rejectInvoice,
  getInvoiceVariances: supabaseApi.getInvoiceVariances,
  createInvoiceValidationChecks: supabaseApi.createInvoiceValidationChecks,
  deleteInvoice: supabaseApi.deleteInvoice,
};

const demoRepo = {
  getInvoices: async (userId: string, role: string) => {
    const invoices = await demoRepository.getInvoices();
    if (role === 'SALES_HEAD' || role === 'VIEWER') {
      return invoices.filter((invoice) => invoice.created_by === userId);
    }
    if (role === 'FINANCE') {
      return invoices.filter((invoice) => invoice.status === 'VERIFIED' || invoice.status === 'APPROVED');
    }
    return invoices;
  },
  getInvoiceById: demoRepository.getInvoiceById,
  createInvoice: (input: any, userId: string) =>
    demoRepository.createInvoice({
      ...input,
      status: 'RECEIVED',
      created_by: userId,
      created_at: new Date().toISOString(),
    }),
  updateInvoice: (id: string, input: any, userId: string) =>
    demoRepository.updateInvoice(id, {
      ...input,
      updated_by: userId,
    }),
  verifyInvoice: (id: string, userId: string) => demoRepository.verifyInvoice(id, userId),
  approveInvoice: (id: string, userId: string) => demoRepository.approveInvoice(id, userId),
  rejectInvoice: (id: string, reason: string) => demoRepository.rejectInvoice(id, reason),
  getInvoiceVariances: demoRepository.getInvoiceVariances,
};

function applyFilters(invoices: Invoice[], filters?: InvoiceQueryFilters): Invoice[] {
  if (!filters) {
    return invoices;
  }

  return invoices.filter((invoice) => {
    if (filters.status && invoice.status !== filters.status) return false;
    if (filters.bookingId && invoice.booking_id !== filters.bookingId) return false;
    if (filters.dateFrom && invoice.invoice_date < filters.dateFrom) return false;
    if (filters.dateTo && invoice.invoice_date > filters.dateTo) return false;
    return true;
  });
}

/**
 * Calculates invoice variances by running validation engine.
 * This function is called when generating variance reports.
 */
export async function calculateInvoiceVariances(invoice: Invoice): Promise<InvoiceValidationCheck[]> {
  const result = await validateInvoicePackage(invoice);
  return result.checks;
}


export const getInvoices = async (user: UserProfile, filters?: InvoiceQueryFilters): Promise<Invoice[]> => {
  if (isDemoModeActive()) {
    const invoices = await demoRepo.getInvoices(user.id, user.role);
    const enriched = await Promise.all(invoices.map(convertDemoToInvoice));
    return applyFilters(enriched, filters);
  }

  const invoices = await supabaseRepo.getInvoices(user);
  return applyFilters(invoices, filters);
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  if (isDemoModeActive()) {
    const invoice = await demoRepo.getInvoiceById(id);
    return convertDemoToInvoice(invoice);
  }

  return supabaseRepo.getInvoiceById(id);
};

export const createInvoice = async (input: InvoiceCreateInput, user: UserProfile): Promise<Invoice> => {
  if (isDemoModeActive()) {
    const invoice = await demoRepo.createInvoice(input, user.id);
    return convertDemoToInvoice(invoice);
  }

  return supabaseRepo.createInvoice(input, user);
};

export const updateInvoice = async (id: string, input: InvoiceUpdateInput, user: UserProfile): Promise<Invoice> => {
  if (isDemoModeActive()) {
    const invoice = await demoRepo.updateInvoice(id, input, user.id);
    return convertDemoToInvoice(invoice);
  }

  return supabaseRepo.updateInvoice(id, input, user);
};

export const verifyInvoice = async (id: string, user: UserProfile): Promise<Invoice> => {
  if (isDemoModeActive()) {
    const invoice = await demoRepo.verifyInvoice(id, user.id);
    return convertDemoToInvoice(invoice);
  }

  return supabaseRepo.verifyInvoice(id, user);
};

export const approveInvoice = async (id: string, user: UserProfile): Promise<Invoice> => {
  if (isDemoModeActive()) {
    const invoice = await demoRepo.approveInvoice(id, user.id);
    return convertDemoToInvoice(invoice);
  }

  return supabaseRepo.approveInvoice(id, user);
};

export const rejectInvoice = async (id: string, reason: string, user: UserProfile): Promise<Invoice> => {
  if (isDemoModeActive()) {
    const invoice = await demoRepo.rejectInvoice(id, reason);
    return convertDemoToInvoice(invoice);
  }

  return supabaseRepo.rejectInvoice(id, reason, user);
};

export const getInvoiceVariances = async (invoiceId: string): Promise<InvoiceValidationCheck[]> => {
  if (isDemoModeActive()) {
    const demoVariances = await demoRepo.getInvoiceVariances(invoiceId);
    return demoVariances.map((v: any) => ({
      ...v,
      check_type: v.check_type || 'TOTAL_VARIANCE',
      severity: (v.severity || 'INFO') as 'INFO' | 'WARNING' | 'CRITICAL',
      status: (v.status || 'PASS') as 'PASS' | 'FAIL',
    } as InvoiceValidationCheck));
  }

  return supabaseRepo.getInvoiceVariances(invoiceId);
};
