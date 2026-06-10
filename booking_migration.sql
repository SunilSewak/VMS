-- booking_migration.sql
-- Run this in the Supabase SQL Editor or migration pipeline to create the bookings table and RLS policies.

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text NOT NULL UNIQUE,
  request_id uuid NOT NULL,
  meeting_request_id uuid NOT NULL,
  hotel_id uuid NOT NULL,
  hall_id uuid,
  status text NOT NULL CHECK (status IN ('REQUESTED', 'UNDER_REVIEW', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  rooms_booked integer NOT NULL DEFAULT 0,
  halls_booked integer NOT NULL DEFAULT 0,
  expected_pax integer NOT NULL DEFAULT 0,
  special_requirements text,
  confirmed_by uuid,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT bookings_request_fkey FOREIGN KEY (request_id) REFERENCES meeting_requests (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_meeting_request_fkey FOREIGN KEY (meeting_request_id) REFERENCES meeting_requests (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_hotel_fkey FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_hall_fkey FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS request_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_request_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hall_id uuid;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rooms_booked integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS halls_booked integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expected_pax integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requirements text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_by uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_by uuid;

CREATE INDEX IF NOT EXISTS idx_bookings_request_id ON bookings (request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_request_id ON bookings (request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_request_id ON bookings (meeting_request_id);

CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings (hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON bookings (created_by);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmed_by ON bookings (confirmed_by);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access
CREATE POLICY "Bookings full access for Super Admin" ON bookings
  FOR ALL
  USING (auth.role() = 'SUPER_ADMIN')
  WITH CHECK (auth.role() = 'SUPER_ADMIN');

-- Admin: full access for bookings
CREATE POLICY "Bookings full access for Admin" ON bookings
  FOR ALL
  USING (auth.role() = 'ADMIN')
  WITH CHECK (auth.role() = 'ADMIN');

-- Management: read-only access to all bookings
CREATE POLICY "Bookings read access for Management" ON bookings
  FOR SELECT
  USING (auth.role() = 'MANAGEMENT');

-- Sales Head: view bookings for their division via related meeting request
CREATE POLICY "Bookings select for Sales Head division" ON bookings
  FOR SELECT
  USING (
    auth.role() = 'SALES_HEAD'
    AND meeting_request_id IN (
      SELECT id FROM meeting_requests
      WHERE division_id = (
        SELECT division_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Sales Head: create booking requests
CREATE POLICY "Bookings insert for Sales Head" ON bookings
  FOR INSERT
  WITH CHECK (
    auth.role() = 'SALES_HEAD'
    AND created_by = auth.uid()
    AND status = 'REQUESTED'
  );

-- Sales Head: update own unconfirmed bookings
CREATE POLICY "Bookings update for Sales Head" ON bookings
  FOR UPDATE
  USING (
    auth.role() = 'SALES_HEAD'
    AND created_by = auth.uid()
    AND status NOT IN ('CONFIRMED', 'CANCELLED', 'COMPLETED')
  )
  WITH CHECK (
    auth.role() = 'SALES_HEAD'
    AND created_by = auth.uid()
    AND status NOT IN ('CONFIRMED', 'CANCELLED', 'COMPLETED')
  );

-- Sales Head: cannot delete bookings
CREATE POLICY "Bookings delete denied for Sales Head" ON bookings
  FOR DELETE
  USING (auth.role() = 'SUPER_ADMIN' OR auth.role() = 'ADMIN');
