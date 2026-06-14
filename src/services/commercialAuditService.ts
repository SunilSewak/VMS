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
  buildAuditEvidence,
  type AuditVariance,
  type AuditEvidence,
  type EvidenceInputs,
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
  evidence: AuditEvidence[];
  persisted: InvoiceVarianceRecord[];
}

function nightsBetween(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

interface AuditContext {
  bookingId: string;
  nights: number;
  foodPax: number;
  hallCount: number;
  expected: { room: number; food: number; nrc: number; hall: number; total: number };
  actual: { room: number; food: number; nrc: number; hall: number; total: number };
  evidenceInputs: EvidenceInputs;
}

/**
 * Loads invoice + booking + approved commercial + room inventory and computes
 * the expected/actual breakdown. Shared by runCommercialAudit and
 * getAuditEvidence so the numbers always reconcile. No persistence here.
 */
async function loadAuditContext(invoiceId: string): Promise<AuditContext> {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice.booking_id) throw new Error('Invoice has no linked booking.');

  const booking = await getBookingById(invoice.booking_id);

  const commercial = await getApprovedCommercial(invoice.booking_id);
  if (!commercial) {
    throw new Error('No approved commercial baseline exists for this booking. Add one before running the commercial audit.');
  }

  const roomInventory = await getRoomInventory(invoice.booking_id);

  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const foodPax = booking.expected_pax || 0;
  const hallCount = booking.halls_booked || 0;

  const expectedRoom = calculateExpectedRoomCharges(commercial, roomInventory, nights);
  const expectedFood = calculateExpectedFoodCharges(commercial, foodPax, nights);
  const expectedNrc = calculateExpectedNRCCharges(commercial, 0, 0);
  const expectedHall = calculateExpectedHallCharges(commercial, hallCount, nights);
  const expectedTotal = round2(expectedRoom + expectedFood + expectedNrc + expectedHall);

  const actualRoom = invoice.room_charges ?? 0;
  const actualFood = invoice.food_charges ?? 0;
  const actualNrc = 0;
  const actualHall = invoice.hall_charges ?? 0;
  const actualTotal = invoice.subtotal_amount ?? round2(actualRoom + actualFood + actualHall + (invoice.other_charges ?? 0));

  const expected = { room: expectedRoom, food: expectedFood, nrc: expectedNrc, hall: expectedHall, total: expectedTotal };

  return {
    bookingId: invoice.booking_id,
    nights,
    foodPax,
    hallCount,
    expected,
    actual: { room: actualRoom, food: actualFood, nrc: actualNrc, hall: actualHall, total: actualTotal },
    evidenceInputs: {
      commercial, roomInventory, nights,
      foodPax, foodDays: nights, nrcPax: 0, nrcDays: 0, hallCount, hallDays: nights,
      expected,
    },
  };
}

const VARIANCE_TYPES = ['ROOM_VARIANCE', 'FOOD_VARIANCE', 'NRC_VARIANCE', 'HALL_VARIANCE', 'TOTAL_VARIANCE'] as const;

function actualFor(type: string, actual: AuditContext['actual']): number {
  switch (type) {
    case 'ROOM_VARIANCE': return actual.room;
    case 'FOOD_VARIANCE': return actual.food;
    case 'NRC_VARIANCE': return actual.nrc;
    case 'HALL_VARIANCE': return actual.hall;
    case 'TOTAL_VARIANCE': return actual.total;
    default: return 0;
  }
}

function expectedFor(type: string, expected: AuditContext['expected']): number {
  switch (type) {
    case 'ROOM_VARIANCE': return expected.room;
    case 'FOOD_VARIANCE': return expected.food;
    case 'NRC_VARIANCE': return expected.nrc;
    case 'HALL_VARIANCE': return expected.hall;
    case 'TOTAL_VARIANCE': return expected.total;
    default: return 0;
  }
}

/**
 * Runs the commercial audit for an invoice and persists the variance findings.
 * Re-running replaces the previously persisted variances for the invoice.
 */
export async function runCommercialAudit(invoiceId: string): Promise<CommercialAuditResult> {
  const ctx = await loadAuditContext(invoiceId);
  const { expected, actual } = ctx;

  const variances: AuditVariance[] = VARIANCE_TYPES.map((type) =>
    buildAuditVariance(type, expectedFor(type, expected), actualFor(type, actual), interpretVariance(type, expectedFor(type, expected), actualFor(type, actual)))
  );

  const severities: VarianceSeverity[] = variances.map((v) =>
    classifyVarianceSeverity(v.varianceType, v.expectedAmount, v.actualAmount)
  );
  // TOTAL_VARIANCE is a roll-up; exclude it from the status roll-up.
  const categorySeverities = severities.slice(0, 4);
  const summary: CommercialAuditSummary = {
    overallStatus: rollUpAuditStatus(categorySeverities),
    totalExpected: expected.total,
    totalActual: actual.total,
    netVariance: round2(actual.total - expected.total),
    criticalCount: categorySeverities.filter((s) => s === 'CRITICAL').length,
    warningCount: categorySeverities.filter((s) => s === 'WARNING').length,
  };

  await deleteInvoiceVariances(invoiceId);
  const persisted = await createInvoiceVariances(
    invoiceId,
    variances.map((v) => {
      const { invoice_id, ...rest } = toInvoiceVarianceInput(invoiceId, v);
      return rest;
    })
  );

  const evidence: AuditEvidence[] = VARIANCE_TYPES.map((type) => buildAuditEvidence(type, ctx.evidenceInputs));

  return {
    invoiceId,
    bookingId: ctx.bookingId,
    nights: ctx.nights,
    expected,
    actual,
    variances,
    summary,
    evidence,
    persisted,
  };
}

// variancePercent is part of the public calc API used elsewhere.
void variancePercent;

/**
 * Regenerates evidence dynamically (no persistence) for viewing audit results
 * after reload — sourced from approved_commercials + booking_room_inventory +
 * invoice values. Returns a map keyed by variance type.
 */
export async function getAuditEvidence(invoiceId: string): Promise<Record<string, AuditEvidence>> {
  const ctx = await loadAuditContext(invoiceId);
  const map: Record<string, AuditEvidence> = {};
  for (const type of VARIANCE_TYPES) {
    map[type] = buildAuditEvidence(type, ctx.evidenceInputs);
  }
  return map;
}

/** Reads the persisted commercial variances for an invoice (UI source of truth). */
export async function getPersistedVariances(invoiceId: string): Promise<InvoiceVarianceRecord[]> {
  return getInvoiceVarianceRecords(invoiceId);
}

function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
