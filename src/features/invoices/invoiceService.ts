/**
 * AVEMS Invoice Service — PRODUCTION ONLY
 *
 * This module operates exclusively against Supabase (tables: invoices,
 * invoice_variances, invoice_documents, bookings).
 * There is NO demo / mock / sample fallback. All records are live.
 */

import * as supabaseApi from './api';
import type {
  Invoice,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceQueryFilters,
  InvoiceValidationCheck,
  InvoiceDocument,
  InvoiceDocumentType,
} from './types';
import type { UserProfile } from '../../types';
import { validateInvoicePackage } from './invoiceValidationService';

function applyFilters(invoices: Invoice[], filters?: InvoiceQueryFilters): Invoice[] {
  if (!filters) {
    return invoices;
  }

  return invoices.filter((invoice) => {
    // Note: invoice.status is now correctly mapped from invoice_status in the database
    if (filters.status && invoice.status !== filters.status) return false;
    if (filters.bookingId && invoice.booking_id !== filters.bookingId) return false;
    if (filters.dateFrom && invoice.invoice_date < filters.dateFrom) return false;
    if (filters.dateTo && invoice.invoice_date > filters.dateTo) return false;
    return true;
  });
}

/**
 * Calculates invoice variances by running the validation engine against the
 * live invoice + booking records. Audit V1 (booking/date/pax/GST/total
 * arithmetic). Commercial rate rules are surfaced as PENDING COMMERCIAL MODULE.
 */
export async function calculateInvoiceVariances(invoice: Invoice): Promise<InvoiceValidationCheck[]> {
  const result = await validateInvoicePackage(invoice);
  return result.checks;
}

export const getInvoices = async (user: UserProfile, filters?: InvoiceQueryFilters): Promise<Invoice[]> => {
  const invoices = await supabaseApi.getInvoices(user);
  return applyFilters(invoices, filters);
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  return supabaseApi.getInvoiceById(id);
};

export const checkInvoiceExists = async (invoiceNumber: string, bookingId: string): Promise<boolean> => {
  return supabaseApi.checkInvoiceExists(invoiceNumber, bookingId);
};

export const createInvoice = async (input: InvoiceCreateInput, user: UserProfile): Promise<Invoice> => {
  return supabaseApi.createInvoice(input, user);
};

export const updateInvoice = async (id: string, input: InvoiceUpdateInput, user: UserProfile): Promise<Invoice> => {
  return supabaseApi.updateInvoice(id, input, user);
};

export const startVerification = async (id: string, user: UserProfile): Promise<Invoice> => {
  const invoice = await getInvoiceById(id);
  if (invoice.status !== 'RECEIVED') {
    throw new Error('Only invoices with status RECEIVED can start verification.');
  }
  return supabaseApi.startVerification(id, user);
};

export const verifyInvoice = async (id: string, user: UserProfile): Promise<Invoice> => {
  const invoice = await getInvoiceById(id);
  if (invoice.status !== 'UNDER_VERIFICATION') {
    throw new Error('Invoice must be under verification before it can be verified.');
  }
  return supabaseApi.verifyInvoice(id, user);
};

export const approveInvoice = async (id: string, user: UserProfile): Promise<Invoice> => {
  const invoice = await getInvoiceById(id);
  if (invoice.status !== 'VERIFIED') {
    throw new Error('Only verified invoices can be approved.');
  }
  return supabaseApi.approveInvoice(id, user);
};

export const rejectInvoice = async (id: string, reason: string, user: UserProfile): Promise<Invoice> => {
  const invoice = await getInvoiceById(id);
  if (invoice.status !== 'UNDER_VERIFICATION') {
    throw new Error('Only invoices under verification can be rejected.');
  }
  return supabaseApi.rejectInvoice(id, reason, user);
};

export const deleteInvoice = async (id: string, user: UserProfile): Promise<void> => {
  return supabaseApi.deleteInvoice(id, user);
};

export const getInvoiceDocuments = async (invoiceId: string): Promise<InvoiceDocument[]> => {
  return supabaseApi.getInvoiceDocuments(invoiceId);
};

export const downloadInvoiceDocument = async (document: InvoiceDocument): Promise<string> => {
  return supabaseApi.downloadInvoiceDocument(document);
};

export const uploadInvoiceDocument = async (
  invoiceId: string,
  file: File,
  documentType: InvoiceDocumentType,
  user: UserProfile
): Promise<InvoiceDocument> => {
  return supabaseApi.uploadInvoiceDocument(invoiceId, file, documentType, user);
};

export const deleteInvoiceDocument = async (documentId: string): Promise<void> => {
  return supabaseApi.deleteInvoiceDocument(documentId);
};

export const getInvoiceVariances = async (invoiceId: string): Promise<InvoiceValidationCheck[]> => {
  return supabaseApi.getInvoiceVariances(invoiceId);
};
