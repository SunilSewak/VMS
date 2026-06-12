-- =====================================================================
-- PARTICIPANT MIX & AUTOMATIC ROOM ESTIMATION MIGRATION
-- =====================================================================
-- Purpose: Transform room requirement from manual entry to automatic
--          calculation based on participant designation mix
-- 
-- Changes:
-- 1. Add participant mix columns to meeting_requests
-- 2. Create hotel occupancy rules table
-- 3. Create default occupancy rules reference
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- STEP 1: Add Participant Mix Columns to Meeting Requests
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE meeting_requests
ADD COLUMN IF NOT EXISTS participant_so INTEGER DEFAULT 0 CHECK (participant_so >= 0),
ADD COLUMN IF NOT EXISTS participant_dm INTEGER DEFAULT 0 CHECK (participant_dm >= 0),
ADD COLUMN IF NOT EXISTS participant_rsm INTEGER DEFAULT 0 CHECK (participant_rsm >= 0),
ADD COLUMN IF NOT EXISTS participant_ch INTEGER DEFAULT 0 CHECK (participant_ch >= 0),
ADD COLUMN IF NOT EXISTS participant_ibh INTEGER DEFAULT 0 CHECK (participant_ibh >= 0),
ADD COLUMN IF NOT EXISTS participant_others INTEGER DEFAULT 0 CHECK (participant_others >= 0);

-- Add comment for documentation
COMMENT ON COLUMN meeting_requests.participant_so IS 'Sales Officer count';
COMMENT ON COLUMN meeting_requests.participant_dm IS 'District Manager count';
COMMENT ON COLUMN meeting_requests.participant_rsm IS 'Regional Sales Manager count';
COMMENT ON COLUMN meeting_requests.participant_ch IS 'Channel Head count';
COMMENT ON COLUMN meeting_requests.participant_ibh IS 'Institutional Business Head count';
COMMENT ON COLUMN meeting_requests.participant_others IS 'Other participants count';

-- ─────────────────────────────────────────────────────────────────────
-- STEP 2: Create Hotel Occupancy Rules Table
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotel_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  designation_type VARCHAR(10) NOT NULL CHECK (designation_type IN ('SO', 'DM', 'RSM', 'CH', 'IBH')),
  occupancy_type VARCHAR(10) NOT NULL CHECK (occupancy_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_hotel_designation UNIQUE(hotel_id, designation_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotel_occupancy_rules_hotel_id 
  ON hotel_occupancy_rules(hotel_id);

-- Add comments
COMMENT ON TABLE hotel_occupancy_rules IS 'Hotel-specific occupancy rules for participant designations';
COMMENT ON COLUMN hotel_occupancy_rules.designation_type IS 'Designation: SO, DM, RSM, CH, IBH';
COMMENT ON COLUMN hotel_occupancy_rules.occupancy_type IS 'Room occupancy: SINGLE, DOUBLE, TRIPLE, QUAD';

-- ─────────────────────────────────────────────────────────────────────
-- STEP 3: Create Default Occupancy Rules Reference
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS default_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation_type VARCHAR(10) NOT NULL UNIQUE CHECK (designation_type IN ('SO', 'DM', 'RSM', 'CH', 'IBH')),
  occupancy_type VARCHAR(10) NOT NULL CHECK (occupancy_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default occupancy standards
INSERT INTO default_occupancy_rules (designation_type, occupancy_type, description)
VALUES
  ('SO', 'TRIPLE', 'Sales Officers - Triple sharing (3 persons per room)'),
  ('DM', 'DOUBLE', 'District Managers - Double sharing (2 persons per room)'),
  ('RSM', 'SINGLE', 'Regional Sales Managers - Single occupancy (1 person per room)'),
  ('CH', 'SINGLE', 'Channel Heads - Single occupancy (1 person per room)'),
  ('IBH', 'SINGLE', 'Institutional Business Heads - Single occupancy (1 person per room)')
ON CONFLICT (designation_type) DO UPDATE
  SET occupancy_type = EXCLUDED.occupancy_type,
      description = EXCLUDED.description;

-- Add comments
COMMENT ON TABLE default_occupancy_rules IS 'Default occupancy rules applied when hotel-specific rules not defined';

-- ─────────────────────────────────────────────────────────────────────
-- STEP 4: Create Function to Calculate Total Planned Pax
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_total_planned_pax(
  p_so INTEGER,
  p_dm INTEGER,
  p_rsm INTEGER,
  p_ch INTEGER,
  p_ibh INTEGER,
  p_others INTEGER
)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(p_so, 0) + 
         COALESCE(p_dm, 0) + 
         COALESCE(p_rsm, 0) + 
         COALESCE(p_ch, 0) + 
         COALESCE(p_ibh, 0) + 
         COALESCE(p_others, 0);
$$;

COMMENT ON FUNCTION calculate_total_planned_pax IS 'Calculates total planned pax from participant mix';

-- ─────────────────────────────────────────────────────────────────────
-- STEP 5: Create View for Meeting Requests with Calculated Pax
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW meeting_requests_with_pax AS
SELECT 
  mr.*,
  calculate_total_planned_pax(
    mr.participant_so,
    mr.participant_dm,
    mr.participant_rsm,
    mr.participant_ch,
    mr.participant_ibh,
    mr.participant_others
  ) as total_planned_pax
FROM meeting_requests mr;

COMMENT ON VIEW meeting_requests_with_pax IS 'Meeting requests with auto-calculated total planned pax';

-- ─────────────────────────────────────────────────────────────────────
-- STEP 6: Data Migration (Optional - for existing records)
-- ─────────────────────────────────────────────────────────────────────
-- Migrate existing expected_pax to participant_others for backward compatibility
-- This preserves the total expected pax count
UPDATE meeting_requests
SET participant_others = COALESCE(expected_pax, 0)
WHERE participant_so = 0 
  AND participant_dm = 0 
  AND participant_rsm = 0 
  AND participant_ch = 0 
  AND participant_ibh = 0 
  AND participant_others = 0
  AND expected_pax IS NOT NULL
  AND expected_pax > 0;

-- ─────────────────────────────────────────────────────────────────────
-- STEP 7: Enable RLS on New Tables
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE hotel_occupancy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_occupancy_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read occupancy rules
CREATE POLICY "Occupancy rules are publicly readable"
  ON hotel_occupancy_rules FOR SELECT
  USING (true);

CREATE POLICY "Default occupancy rules are publicly readable"
  ON default_occupancy_rules FOR SELECT
  USING (true);

-- Policy: Only admins can modify occupancy rules
CREATE POLICY "Admins can manage hotel occupancy rules"
  ON hotel_occupancy_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role_id IN (
        SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- STEP 8: Create Helper Function for Room Estimation
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION estimate_rooms_required(
  p_hotel_id UUID,
  p_so INTEGER,
  p_dm INTEGER,
  p_rsm INTEGER,
  p_ch INTEGER,
  p_ibh INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_rooms INTEGER := 0;
  v_occupancy_type VARCHAR(10);
  v_capacity INTEGER;
BEGIN
  -- SO rooms
  IF p_so > 0 THEN
    SELECT occupancy_type INTO v_occupancy_type
    FROM hotel_occupancy_rules
    WHERE hotel_id = p_hotel_id AND designation_type = 'SO'
    UNION ALL
    SELECT occupancy_type FROM default_occupancy_rules WHERE designation_type = 'SO'
    LIMIT 1;
    
    v_capacity := CASE v_occupancy_type
      WHEN 'SINGLE' THEN 1
      WHEN 'DOUBLE' THEN 2
      WHEN 'TRIPLE' THEN 3
      WHEN 'QUAD' THEN 4
      ELSE 3 -- default to triple
    END;
    
    v_rooms := v_rooms + CEIL(p_so::NUMERIC / v_capacity);
  END IF;
  
  -- DM rooms
  IF p_dm > 0 THEN
    SELECT occupancy_type INTO v_occupancy_type
    FROM hotel_occupancy_rules
    WHERE hotel_id = p_hotel_id AND designation_type = 'DM'
    UNION ALL
    SELECT occupancy_type FROM default_occupancy_rules WHERE designation_type = 'DM'
    LIMIT 1;
    
    v_capacity := CASE v_occupancy_type
      WHEN 'SINGLE' THEN 1
      WHEN 'DOUBLE' THEN 2
      WHEN 'TRIPLE' THEN 3
      WHEN 'QUAD' THEN 4
      ELSE 2
    END;
    
    v_rooms := v_rooms + CEIL(p_dm::NUMERIC / v_capacity);
  END IF;
  
  -- RSM, CH, IBH (all single by default)
  v_rooms := v_rooms + COALESCE(p_rsm, 0) + COALESCE(p_ch, 0) + COALESCE(p_ibh, 0);
  
  RETURN v_rooms;
END;
$$;

COMMENT ON FUNCTION estimate_rooms_required IS 'Estimates room requirements based on participant mix and hotel occupancy rules';

-- ─────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────────────────

-- Verify participant mix columns added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'meeting_requests'
AND column_name LIKE 'participant_%';

-- Verify occupancy rules tables created
SELECT table_name 
FROM information_schema.tables
WHERE table_name IN ('hotel_occupancy_rules', 'default_occupancy_rules');

-- Verify default occupancy rules populated
SELECT * FROM default_occupancy_rules ORDER BY designation_type;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update TypeScript types to match new schema
-- 3. Update application UI to use participant mix
-- 4. Test room estimation calculations
-- =====================================================================
