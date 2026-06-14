/**
 * AVEMS Room Inventory Service — Phase 2
 *
 * CRUD over the booking_room_inventory table (flexible per-booking room-type
 * breakdown). Production-only: talks to Supabase directly.
 *
 * NOTE: The booking_room_inventory table is created by
 * `commercial_phase2_booking_room_inventory.sql`. Until applied, reads/writes
 * return PostgREST errors. The pure helpers (calculateTotalRooms,
 * calculateExpectedRoomCost) work without the DB.
 */

import { supabase } from '../lib/supabase';
import type { ApprovedCommercial } from './commercialService';

export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD' | 'DORMITORY' | 'SUITE';

export const ROOM_TYPES: RoomType[] = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY', 'SUITE'];

export interface RoomTypeCount {
  roomType: RoomType;
  roomCount: number;
  /** Billable occupants for this room type. Room rent is priced per occupant. */
  occupancyCount: number;
}

export interface BookingRoomInventoryItem extends RoomTypeCount {
  id: string;
  bookingId: string;
}

interface RoomInventoryRow {
  id: string;
  booking_id: string;
  room_type: RoomType;
  room_count: number;
  occupancy_count: number;
}

const SELECT_COLS = 'id, booking_id, room_type, room_count, occupancy_count';

function mapRow(row: RoomInventoryRow): BookingRoomInventoryItem {
  return {
    id: row.id,
    bookingId: row.booking_id,
    roomType: row.room_type,
    roomCount: Number(row.room_count) || 0,
    occupancyCount: Number(row.occupancy_count) || 0,
  };
}

// ── CRUD ────────────────────────────────────────────────────────────────────

/** Returns the room-type breakdown rows for a booking. */
export async function getRoomInventory(bookingId: string): Promise<BookingRoomInventoryItem[]> {
  const { data, error } = await (supabase as any)
    .from('booking_room_inventory')
    .select(SELECT_COLS)
    .eq('booking_id', bookingId);

  if (error) throw new Error(error.message);
  return ((data ?? []) as RoomInventoryRow[]).map(mapRow);
}

/**
 * Replaces the full room inventory for a booking with the provided set.
 * Uses upsert on (booking_id, room_type) and removes any types not supplied.
 */
export async function saveRoomInventory(
  bookingId: string,
  items: RoomTypeCount[]
): Promise<BookingRoomInventoryItem[]> {
  const sanitized = items.filter((i) => ROOM_TYPES.includes(i.roomType));

  // Upsert supplied room types
  if (sanitized.length > 0) {
    const payload = sanitized.map((i) => ({
      booking_id: bookingId,
      room_type: i.roomType,
      room_count: Math.max(0, Math.round(i.roomCount)),
      occupancy_count: Math.max(0, Math.round(i.occupancyCount)),
      updated_at: new Date().toISOString(),
    }));
    const { error: upsertError } = await (supabase as any)
      .from('booking_room_inventory')
      .upsert(payload, { onConflict: 'booking_id,room_type' });
    if (upsertError) throw new Error(upsertError.message);
  }

  // Remove room types no longer present
  const keep = sanitized.map((i) => i.roomType);
  let deleteQuery = (supabase as any).from('booking_room_inventory').delete().eq('booking_id', bookingId);
  if (keep.length > 0) {
    deleteQuery = deleteQuery.not('room_type', 'in', `(${keep.join(',')})`);
  }
  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw new Error(deleteError.message);

  return getRoomInventory(bookingId);
}

// ── Pure helpers (no DB) ─────────────────────────────────────────────────────

/** Total number of rooms across all room types. */
export function calculateTotalRooms(items: RoomTypeCount[]): number {
  return items.reduce((sum, i) => sum + (Number(i.roomCount) || 0), 0);
}

/**
 * Expected room cost for ONE night = Σ (occupancyCount × per-occupant rate).
 * Room rent is billed PER OCCUPANT PER NIGHT, so we price on occupancy_count,
 * not room_count. DORMITORY and SUITE have no approved rate in the Phase-1
 * contract yet, so they contribute 0 until rate fields exist.
 */
export function calculateExpectedRoomCost(
  items: RoomTypeCount[],
  commercial: Pick<ApprovedCommercial, 'roomRateSingle' | 'roomRateDouble' | 'roomRateTriple' | 'roomRateQuad'>,
  nights = 1
): number {
  const rateFor = (t: RoomType): number => {
    switch (t) {
      case 'SINGLE': return commercial.roomRateSingle;
      case 'DOUBLE': return commercial.roomRateDouble;
      case 'TRIPLE': return commercial.roomRateTriple;
      case 'QUAD': return commercial.roomRateQuad;
      default: return 0; // DORMITORY / SUITE: no approved rate yet
    }
  };
  const perNight = items.reduce((sum, i) => sum + (Number(i.occupancyCount) || 0) * rateFor(i.roomType), 0);
  return perNight * Math.max(0, nights);
}
