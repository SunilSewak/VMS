import type { InvoiceDocument, InvoiceDocumentType } from './types';
import type { UserProfile } from '../../types';
import * as invoiceService from './invoiceService';

const ALLOWED_DOCUMENT_TYPES: InvoiceDocumentType[] = [
  'PRIMARY_INVOICE',
  'GST_INVOICE',
  'COVER_LETTER',
  'OCCUPANCY_REPORT',
  'ROOMING_REPORT',
  'NRC_LIST',
  'BANQUET_BILL',
  'GUEST_BILL',
  'OTHER',
];

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export async function getInvoiceDocuments(invoiceId: string): Promise<InvoiceDocument[]> {
  return invoiceService.getInvoiceDocuments(invoiceId);
}

export async function uploadInvoiceDocument(
  invoiceId: string,
  documentType: InvoiceDocumentType,
  file: File,
  user: UserProfile
): Promise<InvoiceDocument> {
  if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
    throw new Error('Invalid document type selected.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Upload PDF, JPG, JPEG or PNG files only.');
  }

  return invoiceService.uploadInvoiceDocument(invoiceId, file, documentType, user);
}

export async function deleteInvoiceDocument(documentId: string): Promise<void> {
  return invoiceService.deleteInvoiceDocument(documentId);
}

export async function downloadInvoiceDocument(document: InvoiceDocument): Promise<string> {
  return invoiceService.downloadInvoiceDocument(document);
}
