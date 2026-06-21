export type SapPaymentStatus = 'PENDING' | 'PROCESSED' | 'PAID';
export type SapClosureStatus = 'OPEN' | 'CLOSED';

export interface SapClosure {
  id: string;
  event_id: string;
  invoice_id: string;
  sap_reference: string;
  upload_date: string;
  payment_status: SapPaymentStatus;
  closure_status: SapClosureStatus;
  created_at?: string;
  updated_at?: string;
}
