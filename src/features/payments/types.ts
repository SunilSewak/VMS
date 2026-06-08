import type { Invoice } from '../invoices/types';

export type PaymentStatus = 'RECEIVED' | 'VERIFIED' | 'APPROVED' | 'PAID';

export interface PaymentInvoiceSummary {
  id: string;
  invoice_number: string;
  invoice_amount: number;
  status: Invoice['status'];
  approved_at?: string | null;
  booking_id: string;
  bookings?: {
    booking_reference: string;
    hotel_id?: string;
    hotel_name?: string;
    division_name?: string;
  } | null;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_reference: string;
  payment_date: string;
  payment_amount: number;
  payment_mode: string;
  remarks?: string | null;
  status: PaymentStatus;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  is_deleted?: boolean;
  invoice?: PaymentInvoiceSummary | null;
}

export interface PaymentCreateInput {
  invoice_id: string;
  payment_reference: string;
  payment_date: string;
  payment_amount: number;
  payment_mode: string;
  remarks?: string | null;
}

export interface PaymentUpdateInput {
  payment_date?: string;
  payment_amount?: number;
  payment_reference?: string;
  payment_mode?: string;
  remarks?: string | null;
}

export interface PaymentQueryFilters {
  status?: PaymentStatus;
  hotelId?: string;
  divisionId?: string;
  invoiceNumber?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentSummary {
  totalPayments: number;
  pendingVerification: number;
  pendingApproval: number;
  pendingPayment: number;
  completedPayments: number;
  outstandingAmount: number;
}
