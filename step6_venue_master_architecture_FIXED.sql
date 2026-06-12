-- =====================================================================
-- STEP 6: VENUE MASTER DATA ARCHITECTURE (FIXED VERSION)
-- =====================================================================
-- This version handles existing tables and adds missing columns safely
-- =====================================================================

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 1: ZONE MASTER
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code VARCHAR(10) NOT NULL UNIQUE CHECK (zone_code IN ('NORTH', 'SOUTH', 'EAST', 'WEST', 'HO')),
  zone_name VARCHAR(50) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert standard zones
INSERT INTO zones (zone_code, zone_name, display_order) VALUES
  ('NORTH', 'North', 1),
  ('SOUTH', 'South', 2),
  ('EAST', 'East', 3),
  ('WEST', 'West', 4),
  ('HO', 'HO', 5)
ON CONFLICT (zone_code) DO NOTHING;

COMMENT ON TABLE zones IS 'Master zone table for geographical classification';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 2: CITY MASTER ENHANCEMENT
-- ═════════════════════════════════════════════════════════════════════

ALTER TABLE cities
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES zones(id),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier VARCHAR(10),
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON cities(zone_id);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(active);

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 3: HOTEL MASTER ENHANCEMENT
-- ═════════════════════════════════════════════════════════════════════

ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS hotel_brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS hotel_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES zones(id),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS sales_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS sales_contact_designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS sales_contact_mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS sales_contact_email VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_vendor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS total_rooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_residential_pax INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_meeting_pax INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiple_halls BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS residential_supported BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_ajanta_events INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_date DATE,
ADD COLUMN IF NOT EXISTS last_division_id UUID,
ADD COLUMN IF NOT EXISTS last_meeting_type_id UUID;

-- Add constraints safely (drop if exists first)
DO $$
BEGIN
  ALTER TABLE hotels DROP CONSTRAINT IF EXISTS hotels_hotel_category_check;
  ALTER TABLE hotels ADD CONSTRAINT hotels_hotel_category_check 
    CHECK (hotel_category IS NULL OR hotel_category IN ('5_STAR', '4_STAR', '3_STAR', 'BUSINESS', 'BUDGET', 'RESORT', 'BOUTIQUE'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE hotels DROP CONSTRAINT IF EXISTS hotels_status_check;
  ALTER TABLE hotels ADD CONSTRAINT hotels_status_check 
    CHECK (status IS NULL OR status IN ('ACTIVE', 'INACTIVE', 'UNDER_REVIEW'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_hotels_zone_id ON hotels(zone_id);
CREATE INDEX IF NOT EXISTS idx_hotels_category ON hotels(hotel_category);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_preferred_vendor ON hotels(preferred_vendor);
CREATE INDEX IF NOT EXISTS idx_hotels_blacklisted ON hotels(blacklisted);

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 4: ACCOMMODATION INVENTORY
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hotel_accommodation_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  total_rooms INTEGER NOT NULL DEFAULT 0 CHECK (total_rooms >= 0),
  single_rooms INTEGER DEFAULT 0 CHECK (single_rooms >= 0),
  double_rooms INTEGER DEFAULT 0 CHECK (double_rooms >= 0),
  triple_rooms INTEGER DEFAULT 0 CHECK (triple_rooms >= 0),
  quad_rooms INTEGER DEFAULT 0 CHECK (quad_rooms >= 0),
  suite_rooms INTEGER DEFAULT 0 CHECK (suite_rooms >= 0),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hotel_accommodation_inventory_hotel_uk UNIQUE(hotel_id)
);

CREATE INDEX IF NOT EXISTS idx_accommodation_inventory_hotel_id ON hotel_accommodation_inventory(hotel_id);

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 5: OCCUPANCY MATRIX
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hotel_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  designation_type VARCHAR(10) NOT NULL CHECK (designation_type IN ('SO', 'DM', 'RSM', 'CH', 'IBH', 'OTHERS')),
  occupancy_type VARCHAR(10) NOT NULL CHECK (occupancy_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_hotel_designation UNIQUE(hotel_id, designation_type)
);

CREATE INDEX IF NOT EXISTS idx_hotel_occupancy_rules_hotel_id ON hotel_occupancy_rules(hotel_id);

CREATE TABLE IF NOT EXISTS default_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation_type VARCHAR(10) NOT NULL UNIQUE CHECK (designation_type IN ('SO', 'DM', 'RSM', 'CH', 'IBH', 'OTHERS')),
  occupancy_type VARCHAR(10) NOT NULL CHECK (occupancy_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO default_occupancy_rules (designation_type, occupancy_type, description) VALUES
  ('SO', 'TRIPLE', 'Sales Officers - Triple sharing'),
  ('DM', 'DOUBLE', 'District Managers - Double sharing'),
  ('RSM', 'SINGLE', 'Regional Sales Managers - Single occupancy'),
  ('CH', 'SINGLE', 'Channel Heads - Single occupancy'),
  ('IBH', 'SINGLE', 'Institutional Business Heads - Single occupancy'),
  ('OTHERS', 'SINGLE', 'Other participants - Single occupancy')
ON CONFLICT (designation_type) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 6: HALL MASTER ENHANCEMENT
-- ═════════════════════════════════════════════════════════════════════

ALTER TABLE halls
ADD COLUMN IF NOT EXISTS theatre_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cluster_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS u_shape_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS boardroom_capacity INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_halls_theatre_capacity ON halls(theatre_capacity);
CREATE INDEX IF NOT EXISTS idx_halls_classroom_capacity ON halls(classroom_capacity);

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 7: VENUE PHOTOS (FIXED)
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS venue_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  hall_id UUID REFERENCES halls(id) ON DELETE CASCADE,
  photo_type VARCHAR(50) NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(auth_user_id),
  CONSTRAINT venue_photos_reference_check CHECK (
    (hotel_id IS NOT NULL AND hall_id IS NULL) OR
    (hotel_id IS NULL AND hall_id IS NOT NULL)
  )
);

-- Add is_primary column if it doesn't exist
ALTER TABLE venue_photos
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- Add constraint safely
DO $$
BEGIN
  ALTER TABLE venue_photos DROP CONSTRAINT IF EXISTS venue_photos_photo_type_check;
  ALTER TABLE venue_photos ADD CONSTRAINT venue_photos_photo_type_check 
    CHECK (photo_type IN (
      'HOTEL_EXTERIOR', 'HOTEL_LOBBY', 'HOTEL_GUEST_ROOM', 'HOTEL_RESTAURANT', 
      'HOTEL_AMENITY', 'HALL_EMPTY', 'HALL_THEATRE', 'HALL_CLASSROOM', 
      'HALL_CLUSTER', 'HALL_U_SHAPE', 'HALL_BOARDROOM', 'HALL_SETUP', 'OTHER'
    ));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_venue_photos_hotel_id ON venue_photos(hotel_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_hall_id ON venue_photos(hall_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_photo_type ON venue_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_venue_photos_is_primary ON venue_photos(is_primary);

-- ═════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_hotel_suitability(p_hotel_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_rooms INTEGER;
  v_largest_hall INTEGER;
  v_hall_count INTEGER;
BEGIN
  SELECT total_rooms INTO v_total_rooms
  FROM hotel_accommodation_inventory
  WHERE hotel_id = p_hotel_id;
  
  SELECT 
    GREATEST(
      COALESCE(MAX(theatre_capacity), 0),
      COALESCE(MAX(classroom_capacity), 0),
      COALESCE(MAX(cluster_capacity), 0)
    ),
    COUNT(*)
  INTO v_largest_hall, v_hall_count
  FROM halls
  WHERE hotel_id = p_hotel_id;
  
  UPDATE hotels SET
    total_rooms = COALESCE(v_total_rooms, 0),
    residential_capacity = COALESCE(v_total_rooms, 0) * 2,
    largest_hall_capacity = COALESCE(v_largest_hall, 0),
    max_residential_pax = COALESCE(v_total_rooms, 0) * 2,
    max_meeting_pax = COALESCE(v_largest_hall, 0),
    multiple_halls = (v_hall_count > 1),
    residential_supported = (COALESCE(v_total_rooms, 0) > 0),
    updated_at = NOW()
  WHERE id = p_hotel_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_venue_usage(
  p_hotel_id UUID,
  p_division_id UUID,
  p_meeting_type_id UUID,
  p_event_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE hotels SET
    total_ajanta_events = COALESCE(total_ajanta_events, 0) + 1,
    last_used_date = p_event_date,
    last_division_id = p_division_id,
    last_meeting_type_id = p_meeting_type_id,
    updated_at = NOW()
  WHERE id = p_hotel_id;
END;
$$;

-- ═════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════════════════════════════════

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Zones are publicly readable" ON zones;
CREATE POLICY "Zones are publicly readable"
  ON zones FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage zones" ON zones;
CREATE POLICY "Admins can manage zones"
  ON zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role_id IN (
        SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
      )
    )
  );

ALTER TABLE hotel_accommodation_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accommodation inventory is publicly readable" ON hotel_accommodation_inventory;
CREATE POLICY "Accommodation inventory is publicly readable"
  ON hotel_accommodation_inventory FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage accommodation inventory" ON hotel_accommodation_inventory;
CREATE POLICY "Admins can manage accommodation inventory"
  ON hotel_accommodation_inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role_id IN (
        SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
      )
    )
  );

ALTER TABLE hotel_occupancy_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Occupancy rules are publicly readable" ON hotel_occupancy_rules;
CREATE POLICY "Occupancy rules are publicly readable"
  ON hotel_occupancy_rules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage hotel occupancy rules" ON hotel_occupancy_rules;
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

ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Venue photos are publicly readable" ON venue_photos;
CREATE POLICY "Venue photos are publicly readable"
  ON venue_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage venue photos" ON venue_photos;
CREATE POLICY "Admins can manage venue photos"
  ON venue_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role_id IN (
        SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
      )
    )
  );

-- ═════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═════════════════════════════════════════════════════════════════════

SELECT * FROM zones ORDER BY display_order;

SELECT COUNT(*) as accommodation_inventory_count FROM hotel_accommodation_inventory;

SELECT COUNT(*) as occupancy_rules_count FROM default_occupancy_rules;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
