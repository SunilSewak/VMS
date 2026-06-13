/**
 * AVEMS Commercial Service — Phase 1
 *
 * CRUD over the approved_commercials table (the approved "expected commercial
 * truth" baseline per booking). Production-only: talks to Supabase directly.
 *
 * NOTE: The approved_commercials table is created by
 * `commercial_phase1_approved_commercials.sql`. Until that migration is applied,
 * the read/write functions will return a not-found / error from PostgREST.
 * The pure calculation helper (calculateExpectedCommercial) works without the DB.
 */

import { supabase } from '../lib/supabase';

// ── Domain contract (camelCase app model) ──────────────────────────────────
export interface ApprovedCommercial {
  id: string;
  bookingId: string;
  meetingRequestId: string | null;
  hotelId: string | null;

  roomRateSingle: number;
  roomRateDouble: number;
  roomRateTriple: number;
  roomRateQuad: number;

  foodRatePerPax: number;
  nrcFoodRatePerPax: number;

  hallRate: number;

  approvedBy: string | null;
  approvedAt: string | null;
  remarks: string | null;
}

export type ApprovedCommercialInput = Omit<ApprovedCommercial, 'id'>;

// ── DB row shape (snake_case, matches approved_commercials) ─────────────────
interface ApprovedCommercialRow {
  id: string;
  booking_id: string;
  meeting_request_id: string | null;
  hotel_id: string | null;
  room_rate_single: number | null;
  room_rate_double: number | null;
  room_rate_triple: number | null;
  room_rate_quad: number | null;
  food_rate_per_pax: number | null;
  nrc_food_rate_per_pax: number | null;
  hall_rate: number | null;
  approved_by: string | null;
  approved_at: string | null;
  remarks: string | null;
}

const SELECT_COLS =
  'id, booking_id, meeting_request_id, hotel_id, room_rate_single, room_rate_double, ' +
  'room_rate_triple, room_rate_quad, food_rate_per_pax, nrc_food_rate_per_pax, hall_rate, ' +
  'approved_by, approved_at, remarks';

const n = (v: number | null | undefined): number => (v == null ? 0 : Number(v));

function mapRowToModel(row: ApprovedCommercialRow): ApprovedCommercial {
  return {
    id: row.id,
    bookingId: row.booking_id,
    meetingRequestId: row.meeting_request_id,
    hotelId: row.hotel_id,
    roomRateSingle: n(row.room_rate_single),
    roomRateDouble: n(row.room_rate_double),
    roomRateTriple: n(row.room_rate_triple),
    roomRateQuad: n(row.room_rate_quad),
    foodRatePerPax: n(row.food_rate_per_pax),
    nrcFoodRatePerPax: n(row.nrc_food_rate_per_pax),
    hallRate: n(row.hall_rate),
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    remarks: row.remarks,
  };
}

function mapInputToRow(input: Partial<ApprovedCommercialInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.bookingId !== undefined) row.booking_id = input.bookingId;
  if (input.meetingRequestId !== undefined) row.meeting_request_id = input.meetingRequestId;
  if (input.hotelId !== undefined) row.hotel_id = input.hotelId;
  if (input.roomRateSingle !== undefined) row.room_rate_single = input.roomRateSingle;
  if (input.roomRateDouble !== undefined) row.room_rate_double = input.roomRateDouble;
  if (input.roomRateTriple !== undefined) row.room_rate_triple = input.roomRateTriple;
  if (input.roomRateQuad !== undefined) row.room_rate_quad = input.roomRateQuad;
  if (input.foodRatePerPax !== undefined) row.food_rate_per_pax = input.foodRatePerPax;
  if (input.nrcFoodRatePerPax !== undefined) row.nrc_food_rate_per_pax = input.nrcFoodRatePerPax;
  if (input.hallRate !== undefined) row.hall_rate = input.hallRate;
  if (input.approvedBy !== undefined) row.approved_by = input.approvedBy;
  if (input.approvedAt !== undefined) row.approved_at = input.approvedAt;
  if (input.remarks !== undefined) row.remarks = input.remarks;
  return row;
}

// ── CRUD ────────────────────────────────────────────────────────────────────

/** Returns the approved commercial baseline for a booking, or null if none. */
export async function getApprovedCommercial(bookingId: string): Promise<ApprovedCommercial | null> {
  const { data, error } = await (supabase as any)
    .from('approved_commercials')
    .select(SELECT_COLS)
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRowToModel(data as ApprovedCommercialRow) : null;
}

export async function createApprovedCommercial(input: ApprovedCommercialInput): Promise<ApprovedCommercial> {
  const { data, error } = await (supabase as any)
    .from('approved_commercials')
    .insert([mapInputToRow(input)])
    .select(SELECT_COLS)
    .single();

  if (error) throw new Error(error.message);
  return mapRowToModel(data as ApprovedCommercialRow);
}

export async function updateApprovedCommercial(
  id: string,
  input: Partial<ApprovedCommercialInput>
): Promise<ApprovedCommercial> {
  const { data, error } = await (supabase as any)
    .from('approved_commercials')
    .update({ ...mapInputToRow(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SELECT_COLS)
    .single();

  if (error) throw new Error(error.message);
  return mapRowToModel(data as ApprovedCommercialRow);
}

export async function deleteApprovedCommercial(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('approved_commercials')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Pure helper (no DB) ──────────────────────────────────────────────────────

import type { RoomTypeCount } from './roomInventoryService';
import {
  calculateExpectedRoomCharges,
  calculateExpectedFoodCharges,
  calculateExpectedNRCCharges,
  calculateExpectedHallCharges,
  calculateTotalExpectedAmount,
  type ExpectedChargeInputs,
  type ExpectedCommercialBreakdown,
} from './invoiceAuditCalculationService';

/**
 * Computes the full expected-commercial breakdown for a booking given its
 * approved rates and the quantity inputs (room inventory, pax, nights, halls).
 * Delegates the arithmetic to the audit calculation layer so there is a single
 * source of truth for the math.
 */
export function calculateExpectedCommercial(
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

export type { RoomTypeCount };
