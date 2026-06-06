-- venue_bulk_import_migration.sql
-- Run this in Supabase SQL Editor
-- IMPORTANT: Atomic Import - Single Transaction for entire import

-- Step 1: Add columns to hotels table (including future vendor fields)
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS vendor_code TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS preferred_vendor_status TEXT CHECK (
  preferred_vendor_status IS NULL OR 
  preferred_vendor_status IN ('PREFERRED', 'APPROVED', 'UNDER_REVIEW', 'BLACKLISTED')
);

-- Step 2: Add columns to halls table
ALTER TABLE halls ADD COLUMN IF NOT EXISTS hall_type TEXT;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS theatre_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS u_shape_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS cluster_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS boardroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS reception_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- Step 3: Add unique constraints
ALTER TABLE hotels 
  ADD CONSTRAINT IF NOT EXISTS hotels_name_city_uk UNIQUE (hotel_name, city_id);

ALTER TABLE halls 
  ADD CONSTRAINT IF NOT EXISTS halls_hotel_name_uk UNIQUE (hotel_id, hall_name);

-- Step 4: Create import history table
CREATE TABLE IF NOT EXISTS venue_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_processed INTEGER NOT NULL,
  hotels_created INTEGER NOT NULL DEFAULT 0,
  hotels_updated INTEGER NOT NULL DEFAULT 0,
  halls_created INTEGER NOT NULL DEFAULT 0,
  halls_updated INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'VALIDATED', 'IMPORTING', 'SUCCESS', 'FAILED')),
  error_report_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_import_history_import_session_id ON venue_import_history(import_session_id);
CREATE INDEX IF NOT EXISTS idx_import_history_uploaded_by ON venue_import_history(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_import_history_uploaded_at ON venue_import_history(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON venue_import_history(status);

-- Step 6: RLS Policies (NO GRANT to authenticated)
-- Only SUPER_ADMIN and ADMIN can import venues via RLS policies
CREATE POLICY IF NOT EXISTS "Import venues by Super Admin and Admin"
  ON hotels FOR INSERT
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
    )
  );

CREATE POLICY IF NOT EXISTS "Import halls by Super Admin and Admin"
  ON halls FOR INSERT
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view import history"
  ON venue_import_history FOR SELECT
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
    )
  );