/**
 * AVEMS Invoice Audit Calculation Service — Phase 3 (Audit V2 math core)
 *
 * Pure, side-effect-free calculation engine for EXPECTED commercial amounts.
 * No database access — all inputs are passed in. This lets GCC Club audit logic
 * be completed and unit-tested before the Commercial Management schema is
 * deployed. Database wiring happens later in Feature Wiring.
 */

import type { ApprovedCommercial } from './commercialService';
import type { RoomType, RoomTypeCount } from './roomInventoryService';
import type { InvoiceVarianceCreateInput } from '../features/invoices/types';

// ── Inputs / outputs ─────────────────────────────────────────────────────────

export interface ExpectedChargeInputs {
  /** Room-type breakdown for the booking. */
  roomInventory: RoomTypeCount[];
  /** Number of room-nights multiplier. */
  nights: number;
  /** Pax charged at standard food rate. */
  foodPax: number;
  /** Number of food days (meal-days) at standard rate. */
  foodDays: number;
  /** Pax charged at NRC (non-residential conference) food rate. */
  nrcPax: number;
  /** Number of NRC food days. */
  nrcDays: number;
  /** Number of halls. */
  hallCount: number;
  /** Number of hall days. */
  hallDays: number;
}

export interface ExpectedCommercialBreakdown {
  roomCharges: number;
  foodCharges: number;
  nrcCharges: number;
  hallCharges: number;
  totalExpected: number;
}

type RoomRates = Pick<
  ApprovedCommercial,
  'roomRateSingle' | 'roomRateDouble' | 'roomRateTriple' | 'roomRateQuad'
>;

function rateForRoomType(commercial: RoomRates, type: RoomType): number {
  switch (type) {
    case 'SINGLE': return commercial.roomRateSingle;
    case 'DOUBLE': return commercial.roomRateDouble;
    case 'TRIPLE': return commercial.roomRateTriple;
    case 'QUAD': return commercial.roomRateQuad;
    // DORMITORY / SUITE have no approved rate in the Phase-1 contract → 0.
    default: return 0;
  }
}

// ── Expected charge calculations ─────────────────────────────────────────────

/** Expected room charges = Σ (occupancyCount × per-occupant rate) × nights. */
export function calculateExpectedRoomCharges(
  commercial: RoomRates,
  roomInventory: RoomTypeCount[],
  nights: number
): number {
  const perNight = roomInventory.reduce(
    (sum, item) => sum + (Number(item.occupancyCount) || 0) * rateForRoomType(commercial, item.roomType),
    0
  );
  return round2(perNight * Math.max(0, nights));
}

/** Expected food charges = pax × foodRatePerPax × days. */
export function calculateExpectedFoodCharges(
  commercial: Pick<ApprovedCommercial, 'foodRatePerPax'>,
  pax: number,
  days: number
): number {
  return round2(Math.max(0, pax) * commercial.foodRatePerPax * Math.max(0, days));
}

/** Expected NRC food charges = nrcPax × nrcFoodRatePerPax × nrcDays. */
export function calculateExpectedNRCCharges(
  commercial: Pick<ApprovedCommercial, 'nrcFoodRatePerPax'>,
  nrcPax: number,
  nrcDays: number
): number {
  return round2(Math.max(0, nrcPax) * commercial.nrcFoodRatePerPax * Math.max(0, nrcDays));
}

/** Expected hall charges = hallRate × hallCount × hallDays. */
export function calculateExpectedHallCharges(
  commercial: Pick<ApprovedCommercial, 'hallRate'>,
  hallCount: number,
  hallDays: number
): number {
  return round2(commercial.hallRate * Math.max(0, hallCount) * Math.max(0, hallDays));
}

/** Grand total of all expected components. */
export function calculateTotalExpectedAmount(
  commercial: ApprovedCommercial,
  inputs: ExpectedChargeInputs
): number {
  return round2(
    calculateExpectedRoomCharges(commercial, inputs.roomInventory, inputs.nights) +
      calculateExpectedFoodCharges(commercial, inputs.foodPax, inputs.foodDays) +
      calculateExpectedNRCCharges(commercial, inputs.nrcPax, inputs.nrcDays) +
      calculateExpectedHallCharges(commercial, inputs.hallCount, inputs.hallDays)
  );
}

/** Convenience: full breakdown in one call. */
export function calculateExpectedBreakdown(
  commercial: ApprovedCommercial,
  inputs: ExpectedChargeInputs
): ExpectedCommercialBreakdown {
  return {
    roomCharges: calculateExpectedRoomCharges(commercial, inputs.roomInventory, inputs.nights),
    foodCharges: calculateExpectedFoodCharges(commercial, inputs.foodPax, inputs.foodDays),
    nrcCharges: calculateExpectedNRCCharges(commercial, inputs.nrcPax, inputs.nrcDays),
    hallCharges: calculateExpectedHallCharges(commercial, inputs.hallCount, inputs.hallDays),
    totalExpected: calculateTotalExpectedAmount(commercial, inputs),
  };
}

// ── Phase 4: Audit V2 variance contract ──────────────────────────────────────
// AuditVariance maps 1:1 onto the invoice_variances table with NO transformation
// layer — see toInvoiceVarianceInput().

export type VarianceSeverity = 'PASS' | 'INFO' | 'REVIEW_REQUIRED' | 'WARNING' | 'CRITICAL';

export interface AuditVariance {
  varianceType: string;
  expectedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  remarks: string;
}

/**
 * Variance categories whose expected value is currently derived from a
 * limited data model (room = representative occupancy snapshot; food = lumped
 * with NRC/extra-meals on the invoice). A non-trivial variance here is more
 * likely a data-granularity artifact than a commercial exception, so it is
 * surfaced as REVIEW_REQUIRED rather than WARNING/CRITICAL.
 */
const MODEL_LIMITED_TYPES = new Set(['ROOM_VARIANCE', 'FOOD_VARIANCE']);

/**
 * Severity from the percentage deviation of actual vs expected (in-memory only).
 *   PASS      variance == 0
 *   INFO      |%| <= 2
 *   WARNING   2 < |%| <= 5
 *   CRITICAL  |%| > 5
 * When expected is 0 but actual is not, treat as CRITICAL (unbudgeted charge).
 * For model-limited categories, a WARNING/CRITICAL result is downgraded to
 * REVIEW_REQUIRED (genuine commercial exceptions can't be distinguished from
 * data-granularity gaps until daily/line-level data exists).
 */
export function classifyVarianceSeverity(varianceType: string, expected: number, actual: number): VarianceSeverity {
  const variance = round2(actual - expected);
  if (Math.abs(variance) < 0.005) return 'PASS';

  let base: VarianceSeverity;
  if (expected === 0) {
    base = 'CRITICAL';
  } else {
    const pct = Math.abs((variance / expected) * 100);
    if (pct <= 2) base = 'INFO';
    else if (pct <= 5) base = 'WARNING';
    else base = 'CRITICAL';
  }

  if (MODEL_LIMITED_TYPES.has(varianceType) && (base === 'WARNING' || base === 'CRITICAL')) {
    return 'REVIEW_REQUIRED';
  }
  return base;
}

/** Percentage deviation of actual vs expected (signed). */
export function variancePercent(expected: number, actual: number): number {
  if (expected === 0) return actual === 0 ? 0 : 100;
  return round2(((actual - expected) / expected) * 100);
}

/** Human-readable interpretation for a finance reviewer. */
export function interpretVariance(varianceType: string, expected: number, actual: number): string {
  const variance = round2(actual - expected);
  if (Math.abs(variance) < 0.005) {
    return 'Actual billing matches the approved commercial baseline.';
  }
  const direction = variance > 0 ? 'exceeds' : 'is lower than';
  const label = varianceType.replace(/_VARIANCE$/, '').replace(/_/g, ' ').toLowerCase();

  switch (varianceType) {
    case 'ROOM_VARIANCE':
      return 'Expected room cost is based on representative occupancy rather than daily occupancy. Variance may reflect occupancy fluctuation rather than commercial deviation.';
    case 'FOOD_VARIANCE':
      return 'Invoice food charges may include NRC and extra-meal components. Review detailed billing before treating as a commercial exception.';
    case 'NRC_VARIANCE':
      return variance > 0
        ? 'NRC food billing exceeds baseline. Confirm non-residential guest counts.'
        : 'NRC food billing is within or below baseline.';
    case 'HALL_VARIANCE':
      return variance > 0
        ? 'Hall billing exceeds approved baseline. Verify contracted hall rate and days.'
        : 'Hall billing is lower than the approved baseline.';
    case 'TOTAL_VARIANCE':
      return variance > 0
        ? 'Total invoice exceeds the approved commercial baseline. Investigate category-level variances.'
        : 'Total invoice is lower than the approved commercial baseline.';
    default:
      return `Actual ${label} ${direction} the approved baseline.`;
  }
}

export type OverallAuditStatus = 'PASS' | 'INFO' | 'REVIEW_REQUIRED' | 'WARNING' | 'CRITICAL';

/**
 * Roll-up priority: CRITICAL > WARNING > REVIEW_REQUIRED > INFO > PASS.
 */
export function rollUpAuditStatus(severities: VarianceSeverity[]): OverallAuditStatus {
  if (severities.some((s) => s === 'CRITICAL')) return 'CRITICAL';
  if (severities.some((s) => s === 'WARNING')) return 'WARNING';
  if (severities.some((s) => s === 'REVIEW_REQUIRED')) return 'REVIEW_REQUIRED';
  if (severities.some((s) => s === 'INFO')) return 'INFO';
  return 'PASS';
}

/** Build a variance finding from an expected/actual pair. */
export function buildAuditVariance(
  varianceType: string,
  expectedAmount: number,
  actualAmount: number,
  remarks = ''
): AuditVariance {
  return {
    varianceType,
    expectedAmount: round2(expectedAmount),
    actualAmount: round2(actualAmount),
    varianceAmount: round2(actualAmount - expectedAmount),
    remarks,
  };
}

/** Map an AuditVariance directly to an invoice_variances insert payload. */
export function toInvoiceVarianceInput(invoiceId: string, v: AuditVariance): InvoiceVarianceCreateInput {
  return {
    invoice_id: invoiceId,
    variance_type: v.varianceType,
    expected_amount: v.expectedAmount,
    actual_amount: v.actualAmount,
    variance_amount: v.varianceAmount,
    remarks: v.remarks || null,
  };
}

function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
