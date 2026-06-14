export type InvoiceStatus = 'RECEIVED' | 'UNDER_VERIFICATION' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'PAYMENT_PENDING' | 'PAID';

export type AuditStatus = 'NOT_AUDITED' | 'PASSED' | 'FAILED' | 'REVIEW_REQUIRED';

export type VarianceSeverity = 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL';

export type InvoiceDocumentType =
  | 'PRIMARY_INVOICE'
  | 'COVER_LETTER'
  | 'OCCUPANCY_REPORT'
  | 'ROOMING_REPORT'
  | 'NRC_LIST'
  | 'BANQUET_BILL'
  | 'GUEST_BILL'
  | 'GST_INVOICE'
  | 'OTHER';

export type ValidationCheckType =
  | 'DATE_VARIANCE'
  | 'NIGHT_VARIANCE'
  | 'HOTEL_MISMATCH'
  | 'HALL_MISMATCH'
  | 'PAX_VARIANCE'
  | 'ROOM_VARIANCE'
  | 'ROOM_RATE_VARIANCE'
  | 'ROOM_TOTAL_VARIANCE'
  | 'FOOD_VARIANCE'
  | 'HALL_CHARGE_VARIANCE'
  | 'GST_VARIANCE'
  | 'TOTAL_VARIANCE'
  | 'CATEGORY_RECONCILIATION'
  | 'GST_RECONCILIATION'
  | 'GRAND_TOTAL_RECONCILIATION';

export interface InvoiceDocument {
  id: string;
  invoice_id: string;
  document_type: InvoiceDocumentType;
  file_name: string;
  file_size: number;
  file_path: string;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
  file_data?: string | null;
}

export interface InvoiceValidationCheck {
  id: string;
  invoice_id: string;
  check_type: ValidationCheckType;
  expected_value: number | string;
  actual_value: number | string;
  variance_value: number | string;
  variance_percentage?: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'PASS' | 'FAIL';
  description: string;
  remarks?: string | null;
  created_at: string;
}

export interface InvoiceVariance extends InvoiceValidationCheck {
  // Alias for backward compatibility
}

/**
 * Persisted variance record — matches the live `invoice_variances` table exactly.
 * This is the single approved storage shape for Audit Engine findings.
 */
export interface InvoiceVarianceRecord {
  id: string;
  invoice_id: string;
  variance_type: string;
  expected_amount: number | null;
  actual_amount: number | null;
  variance_amount: number | null;
  remarks: string | null;
}

export type InvoiceVarianceCreateInput = Omit<InvoiceVarianceRecord, 'id'>;

export interface Invoice {
  id: string;
  booking_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: number;
  room_charges: number;
  hall_charges: number;
  food_charges: number;
  tax_amount: number;
  pax_billed: number;
  // Phase-3 financial breakdown columns (nullable for legacy invoices)
  subtotal_amount?: number | null;
  other_charges?: number | null;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  document_url?: string | null;
  remarks?: string | null;
  status: InvoiceStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;

  // Joined fields
  bookings?: {
    booking_reference: string;
    check_in_date: string;
    check_out_date: string;
    rooms_booked: number;
    halls_booked: number;
    expected_pax: number;
    hotels?: {
      hotel_name: string;
    } | null;
    meeting_requests?: {
      meeting_name: string;
      start_date: string;
      end_date: string;
    } | null;
  } | null;

  // Audit and variance fields (computed from validation checks)
  audit_status?: AuditStatus;
  variance_severity?: VarianceSeverity;
}

export interface InvoiceCreateInput {
  booking_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: number;
  room_charges: number;
  hall_charges: number;
  food_charges: number;
  tax_amount: number;
  pax_billed: number;
  subtotal_amount?: number | null;
  other_charges?: number | null;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  document_url?: string | null;
  remarks?: string | null;
}

export interface InvoiceQueryFilters {
  status?: InvoiceStatus;
  bookingId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type InvoiceUpdateInput = Partial<
  Omit<Invoice, 'id' | 'invoice_number' | 'status' | 'created_by' | 'created_at' | 'updated_at' | 'updated_by' | 'verified_by' | 'verified_at' | 'approved_by' | 'approved_at' | 'is_deleted' | 'deleted_at' | 'deleted_by'>
>;

export interface InvoiceValidationResult {
  isValid: boolean;
  checks: InvoiceValidationCheck[];
  criticalCount: number;
  warningCount: number;
  passCount: number;
}

export interface InvoicePackage extends Invoice {
  // Invoice package = Invoice + all supporting documents + all validation checks
  documents?: InvoiceDocument[];
  validation_checks?: InvoiceValidationCheck[];
}

