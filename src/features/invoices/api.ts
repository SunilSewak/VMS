import { supabase } from '../../lib/supabase';
import type { Invoice, InvoiceCreateInput, InvoiceUpdateInput, InvoiceValidationCheck, InvoiceVarianceRecord, InvoiceVarianceCreateInput, InvoiceDocument, InvoiceDocumentType } from './types';
import type { UserProfile } from '../../types';
import { ROLES } from '../../auth/permissions';

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

export async function startVerification(id: string, user: UserProfile): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .update({
      status: 'UNDER_VERIFICATION',
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function getInvoiceDocuments(invoiceId: string): Promise<InvoiceDocument[]> {
  const { data, error } = await (supabase as any)
    .from('invoice_documents')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('uploaded_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as InvoiceDocument[];
}

export async function uploadInvoiceDocument(
  invoiceId: string,
  file: File,
  documentType: InvoiceDocumentType,
  user: UserProfile
): Promise<InvoiceDocument> {
  const filePath = `${invoiceId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('invoice-documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await (supabase as any)
    .from('invoice_documents')
    .insert([
      {
        invoice_id: invoiceId,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        file_path: filePath,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user.id,
      },
    ])
    .single();

  if (error) throw new Error(error.message);
  return data as InvoiceDocument;
}

export async function deleteInvoiceDocument(documentId: string): Promise<void> {
  const { data: existing, error: fetchError } = await (supabase as any)
    .from('invoice_documents')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  const filePath = existing?.file_path as string | undefined;
  if (filePath) {
    const { error: storageError } = await supabase.storage.from('invoice-documents').remove([filePath]);
    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await (supabase as any)
    .from('invoice_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw new Error(error.message);
}

export async function downloadInvoiceDocument(document: InvoiceDocument): Promise<string> {
  if (!document.file_path) {
    throw new Error('Invoice document path unavailable');
  }

  const { data, error } = await supabase.storage
    .from('invoice-documents')
    .createSignedUrl(document.file_path, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function createInvoice(input: InvoiceCreateInput, user: UserProfile): Promise<Invoice> {
  const payload = {
    ...input,
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

// ── Invoice Variances (approved schema table: `invoice_variances`) ──────────
// Persisted Audit Engine findings live here. Columns:
// id, invoice_id, variance_type, expected_amount, actual_amount, variance_amount, remarks

function mapRecordToCheck(rec: InvoiceVarianceRecord): InvoiceValidationCheck {
  return {
    id: rec.id,
    invoice_id: rec.invoice_id,
    check_type: (rec.variance_type as InvoiceValidationCheck['check_type']) ?? 'TOTAL_VARIANCE',
    expected_value: rec.expected_amount ?? '',
    actual_value: rec.actual_amount ?? '',
    variance_value: rec.variance_amount ?? '',
    severity: 'INFO',
    status: 'PASS',
    description: rec.remarks ?? '',
    remarks: rec.remarks ?? null,
    created_at: '',
  };
}

/** Raw persisted variance records, exactly as stored in `invoice_variances`. */
export async function getInvoiceVarianceRecords(invoiceId: string): Promise<InvoiceVarianceRecord[]> {
  const { data, error } = await (supabase as any)
    .from('invoice_variances')
    .select('id, invoice_id, variance_type, expected_amount, actual_amount, variance_amount, remarks')
    .eq('invoice_id', invoiceId);

  if (error) throw new Error(error.message);
  return (data ?? []) as InvoiceVarianceRecord[];
}

/** Backward-compatible read returning the validation-check view of persisted variances. */
export async function getInvoiceVariances(invoiceId: string): Promise<InvoiceValidationCheck[]> {
  const records = await getInvoiceVarianceRecords(invoiceId);
  return records.map(mapRecordToCheck);
}

/** Persist one Audit Engine variance finding to `invoice_variances`. */
export async function createInvoiceVariance(
  input: InvoiceVarianceCreateInput
): Promise<InvoiceVarianceRecord> {
  const { data, error } = await (supabase as any)
    .from('invoice_variances')
    .insert([input])
    .select('id, invoice_id, variance_type, expected_amount, actual_amount, variance_amount, remarks')
    .single();

  if (error) throw new Error(error.message);
  return data as InvoiceVarianceRecord;
}

/** Persist a batch of Audit Engine variance findings to `invoice_variances`. */
export async function createInvoiceVariances(
  invoiceId: string,
  records: Omit<InvoiceVarianceCreateInput, 'invoice_id'>[]
): Promise<InvoiceVarianceRecord[]> {
  const payload = records.map((r) => ({ ...r, invoice_id: invoiceId }));

  const { data, error } = await (supabase as any)
    .from('invoice_variances')
    .insert(payload)
    .select('id, invoice_id, variance_type, expected_amount, actual_amount, variance_amount, remarks');

  if (error) throw new Error(error.message);
  return (data ?? []) as InvoiceVarianceRecord[];
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
