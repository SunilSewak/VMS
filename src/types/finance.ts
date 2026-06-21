export interface Invoice {
  id: string;
  event_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: number;
  invoice_status: string;
  created_at?: string;
}

export interface InvoiceAudit {
  id: string;
  event_id: string;
  invoice_id: string;
  expected_cost: number;
  actual_cost: number;
  variance_amount: number;
  audit_status: 'Pass' | 'Review Required' | 'Warning' | 'Critical';
  created_at?: string;
}

export interface InvoiceVariance {
  id: string;
  audit_id: string;
  variance_type: 'Room Variance' | 'Food Variance' | 'Hall Variance' | 'NRC Variance' | 'Total Variance';
  expected_amount: number;
  actual_amount: number;
  variance_amount: number;
  severity: string;
}

export interface CommercialVersion {
  id: string;
  approved_commercial_id: string;
  room_rate: number;
  food_rate: number;
  hall_rate: number;
  effective_from: string;
  effective_to: string;
  version_number: number;
  status: string;
}

export interface AuditSummary {
  expectedRoomCost: number;
  expectedFoodCost: number;
  expectedHallCost: number;
  expectedNRCCost: number;

  expectedTotalCost: number;
  actualTotalCost: number;

  varianceAmount: number;

  auditStatus: 'Pass' | 'Review Required' | 'Warning' | 'Critical';
}
