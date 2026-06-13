-- ============================================================================
-- COMMERCIAL MANAGEMENT — PHASE 1
-- Table: approved_commercials
-- Purpose: Authoritative "expected commercial truth" per booking. This is the
--          baseline the future Invoice Audit V2 compares vendor invoices against.
-- Run in: Supabase SQL Editor (executes as service role; bypasses RLS).
-- Idempotent: safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS approved_commercials (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            uuid NOT NULL UNIQUE REFERENCES bookings (id) ON DELETE CASCADE,

  -- Denormalised analytics keys (avoid 3-table joins for commercial reporting:
  -- avg room/food rate by hotel, rate comparison across bookings, venue history)
  meeting_request_id    uuid REFERENCES meeting_requests (id) ON DELETE SET NULL,
  hotel_id              uuid REFERENCES hotels (id) ON DELETE SET NULL,

  -- Room rates (per night, per room) by occupancy type
  room_rate_single      numeric(12,2),
  room_rate_double      numeric(12,2),
  room_rate_triple      numeric(12,2),
  room_rate_quad        numeric(12,2),

  -- Food rates (per pax)
  food_rate_per_pax     numeric(12,2),
  nrc_food_rate_per_pax numeric(12,2),

  -- Hall rate (per hall, per day)
  hall_rate             numeric(12,2),

  -- Approval metadata
  approved_by           uuid REFERENCES users (id) ON DELETE SET NULL,
  approved_at           timestamptz,
  remarks               text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES users (id) ON DELETE SET NULL,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  updated_by            uuid REFERENCES users (id) ON DELETE SET NULL
);

-- Re-runnable column guards (in case the table pre-exists in a partial form)
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS meeting_request_id    uuid;
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS hotel_id              uuid;
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS room_rate_single      numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS room_rate_double      numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS room_rate_triple      numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS room_rate_quad        numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS food_rate_per_pax     numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS nrc_food_rate_per_pax numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS hall_rate             numeric(12,2);
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS approved_by           uuid;
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS approved_at           timestamptz;
ALTER TABLE approved_commercials ADD COLUMN IF NOT EXISTS remarks               text;

CREATE INDEX IF NOT EXISTS idx_approved_commercials_booking_id
  ON approved_commercials (booking_id);
CREATE INDEX IF NOT EXISTS idx_approved_commercials_hotel_id
  ON approved_commercials (hotel_id);
CREATE INDEX IF NOT EXISTS idx_approved_commercials_meeting_request_id
  ON approved_commercials (meeting_request_id);

COMMENT ON TABLE approved_commercials IS
  'Approved commercial baseline (expected rates) per booking. Source of expected_amount for Invoice Audit V2.';

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE approved_commercials ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated app user may read the baseline
DROP POLICY IF EXISTS "approved_commercials_read" ON approved_commercials;
CREATE POLICY "approved_commercials_read"
  ON approved_commercials FOR SELECT
  USING (true);

-- Write: Admin / Super Admin only (mirrors venue-master admin policy)
DROP POLICY IF EXISTS "approved_commercials_admin_write" ON approved_commercials;
CREATE POLICY "approved_commercials_admin_write"
  ON approved_commercials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.role_id IN (SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'))
    )
  );

-- ── Verification ────────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'approved_commercials' ORDER BY ordinal_position;
