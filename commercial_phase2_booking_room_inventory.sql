-- ============================================================================
-- COMMERCIAL MANAGEMENT — PHASE 2
-- Table: booking_room_inventory
-- Purpose: Flexible per-booking room breakdown supporting arbitrary room types
--          (SINGLE/DOUBLE/TRIPLE/QUAD/DORMITORY/SUITE). Replaces the fixed
--          single/double/triple-only `rooming_summary` columns for new work.
-- Note:    `rooming_summary` is PRESERVED for backward compatibility (Phase 6
--          GCC seed + any existing readers). This table is additive.
-- Run in:  Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_room_inventory (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  room_type   text NOT NULL CHECK (room_type IN ('SINGLE','DOUBLE','TRIPLE','QUAD','DORMITORY','SUITE')),
  room_count  integer NOT NULL DEFAULT 0 CHECK (room_count >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES users (id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES users (id) ON DELETE SET NULL,

  -- One row per (booking, room_type)
  CONSTRAINT uq_booking_room_inventory UNIQUE (booking_id, room_type)
);

CREATE INDEX IF NOT EXISTS idx_booking_room_inventory_booking_id
  ON booking_room_inventory (booking_id);

COMMENT ON TABLE booking_room_inventory IS
  'Flexible per-booking room-type breakdown. Priced against approved_commercials room rates in Invoice Audit V2.';

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE booking_room_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_room_inventory_read" ON booking_room_inventory;
CREATE POLICY "booking_room_inventory_read"
  ON booking_room_inventory FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "booking_room_inventory_admin_write" ON booking_room_inventory;
CREATE POLICY "booking_room_inventory_admin_write"
  ON booking_room_inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.role_id IN (SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'))
    )
  );

-- ── OPTIONAL one-time backfill from existing rooming_summary ────────────────
-- Converts the legacy single/double/triple columns into rows. QUAD/DORMITORY/
-- SUITE are not present in rooming_summary and are left to be entered manually.
-- Uncomment to run.
--
-- INSERT INTO booking_room_inventory (booking_id, room_type, room_count)
-- SELECT booking_id, 'SINGLE', single_rooms FROM rooming_summary WHERE COALESCE(single_rooms,0) > 0
-- ON CONFLICT (booking_id, room_type) DO NOTHING;
-- INSERT INTO booking_room_inventory (booking_id, room_type, room_count)
-- SELECT booking_id, 'DOUBLE', double_rooms FROM rooming_summary WHERE COALESCE(double_rooms,0) > 0
-- ON CONFLICT (booking_id, room_type) DO NOTHING;
-- INSERT INTO booking_room_inventory (booking_id, room_type, room_count)
-- SELECT booking_id, 'TRIPLE', triple_rooms FROM rooming_summary WHERE COALESCE(triple_rooms,0) > 0
-- ON CONFLICT (booking_id, room_type) DO NOTHING;
