/**
 * AVEMS Commercial Audit V2 — orchestrator
 *
 * Compares the APPROVED COMMERCIAL baseline (approved_commercials) against the
 * ACTUAL vendor invoice, using booking_room_inventory for quantities and the
 * pure calculation engine for expected amounts, then PERSISTS the findings to
 * invoice_variances.
 *
 *   Invoice → Booking → Approved Commercial → Room Inventory
 *           → Expected Commercial Calculation → Variance Generation → invoice_variances
 *
 * No OCR, no demo dependencies — production data only.
 */

import { getInvoiceById } from '../features/invoices/invoiceService';
import { getBookingById } from '../features/bookings/bookingService';
import { getApprovedCommercial } from './commercialService';
import { getRoomInventory } from './roomInventoryService';
import {
  calculateExpectedRoomCharges,
  calculateExpectedFoodCharges,
  calculateExpectedNRCCharges,
  calculateExpectedHallCharges,
  buildAuditVariance,
  toInvoiceVarianceInput,
  classifyVarianceSeverity,
  variancePercent,
  interpretVariance,
  rollUpAuditStatus,
  type AuditVariance,
  type VarianceSeverity,
  type OverallAuditStatus,
} from './invoiceAuditCalculationService';
import {
  createInvoiceVariances,
  deleteInvoiceVariances,
  getInvoiceVarianceRecords,
} from '../features/invoices/api';
import type { InvoiceVarianceRecord } from '../features/invoices/types';

export interface CommercialAuditSummary {
  overallStatus: OverallAuditStatus;
  totalExpected: number;
  totalActual: number;
  netVariance: number;
  criticalCount: number;
  warningCount: number;
}

export interface CommercialAuditResult {
  invoiceId: string;
  bookingId: string;
  nights: number;
  expected: {
    room: number;
    food: number;
    nrc: number;
    hall: number;
    total: number;
  };
  actual: {
    room: number;
    food: number;
    nrc: number;
    hall: number;
    total: number;
  };
  variances: AuditVariance[];
  summary: CommercialAuditSummary;
  persisted: InvoiceVarianceRecord[];
}

function nightsBetween(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

/**
 * Runs the commercial audit for an invoice and persists the variance findings.
 * Re-running replaces the previously persisted variances for the invoice.
 */
export async function runCommercialAudit(invoiceId: string): Promise<CommercialAuditResult> {
  // 1. Invoice (actuals)
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice.booking_id) throw new Error('Invoice has no linked booking.');

  // 2. Booking (quantities/context)
  const booking = await getBookingById(invoice.booking_id);

  // 3. Approved commercial baseline (expected rates)
  const commercial = await getApprovedCommercial(invoice.booking_id);
  if (!commercial) {
    throw new Error('No approved commercial baseline exists for this booking. Add one before running the commercial audit.');
  }

  // 4. Room inventory (occupancy quantities)
  const roomInventory = await getRoomInventory(invoice.booking_id);

  // ── Expected calculation ──
  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const foodPax = booking.expected_pax || 0;
  const hallCount = booking.halls_booked || 0;

  const expectedRoom = calculateExpectedRoomCharges(commercial, roomInventory, nights);
  const expectedFood = calculateExpectedFoodCharges(commercial, foodPax, nights);
  const expectedNrc = calculateExpectedNRCCharges(commercial, 0, 0); // no stored NRC qty → 0 baseline
  const expectedHall = calculateExpectedHallCharges(commercial, hallCount, nights);
  const expectedTotal = round2(expectedRoom + expectedFood + expectedNrc + expectedHall);

  // ── Actuals (from invoice) ──
  const actualRoom = invoice.room_charges ?? 0;
  const actualFood = invoice.food_charges ?? 0;
  const actualNrc = 0; // NRC not stored as a separate invoice column
  const actualHall = invoice.hall_charges ?? 0;
  const actualTotal =
    invoice.subtotal_amount ?? round2(actualRoom + actualFood + actualHall + (invoice.other_charges ?? 0));

  // ── Variance generation (Phase 2 categories) with interpretation remarks ──
  const variances: AuditVariance[] = [
    buildAuditVariance('ROOM_VARIANCE', expectedRoom, actualRoom, interpretVariance('ROOM_VARIANCE', expectedRoom, actualRoom)),
    buildAuditVariance('FOOD_VARIANCE', expectedFood, actualFood, interpretVariance('FOOD_VARIANCE', expectedFood, actualFood)),
    buildAuditVariance('NRC_VARIANCE', expectedNrc, actualNrc, interpretVariance('NRC_VARIANCE', expectedNrc, actualNrc)),
    buildAuditVariance('HALL_VARIANCE', expectedHall, actualHall, interpretVariance('HALL_VARIANCE', expectedHall, actualHall)),
    buildAuditVariance('TOTAL_VARIANCE', expectedTotal, actualTotal, interpretVariance('TOTAL_VARIANCE', expectedTotal, actualTotal)),
  ];

  // ── Severity classification + summary (in-memory only) ──
  const severities: VarianceSeverity[] = variances.map((v) =>
    classifyVarianceSeverity(v.varianceType, v.expectedAmount, v.actualAmount)
  );
  // TOTAL_VARIANCE is a roll-up; exclude it from the status roll-up to avoid double-counting.
  const categorySeverities = severities.slice(0, 4);
  const summary: CommercialAuditSummary = {
    overallStatus: rollUpAuditStatus(categorySeverities),
    totalExpected: expectedTotal,
    totalActual: actualTotal,
    netVariance: round2(actualTotal - expectedTotal),
    criticalCount: categorySeverities.filter((s) => s === 'CRITICAL').length,
    warningCount: categorySeverities.filter((s) => s === 'WARNING').length,
  };

  // ── Persist (replace prior run) ──
  await deleteInvoiceVariances(invoiceId);
  const persisted = await createInvoiceVariances(
    invoiceId,
    variances.map((v) => {
      const { invoice_id, ...rest } = toInvoiceVarianceInput(invoiceId, v);
      return rest;
    })
  );

  return {
    invoiceId,
    bookingId: invoice.booking_id,
    nights,
    expected: { room: expectedRoom, food: expectedFood, nrc: expectedNrc, hall: expectedHall, total: expectedTotal },
    actual: { room: actualRoom, food: actualFood, nrc: actualNrc, hall: actualHall, total: actualTotal },
    variances,
    summary,
    persisted,
  };
}

// Avoid unused-import lint on variancePercent in environments that tree-shake;
// it's part of the public calc API used by the UI.
void variancePercent;

/** Reads the persisted commercial variances for an invoice (UI source of truth). */
export async function getPersistedVariances(invoiceId: string): Promise<InvoiceVarianceRecord[]> {
  return getInvoiceVarianceRecords(invoiceId);
}

function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
