-- =====================================================================
-- STEP 6: VENUE MASTER DATA ARCHITECTURE
-- =====================================================================
-- Purpose: Transform venue repository from simple directory to 
--          structured decision platform with comprehensive master data
-- 
-- Hierarchy: Zone → City → Hotel → Halls → Inventory → Occupancy
-- 
-- Changes:
-- LEVEL 1: Zone Master (explicit table)
-- LEVEL 2: City Master Enhancement (zone linkage)
-- LEVEL 3: Hotel Master Enhancement (comprehensive fields)
-- LEVEL 4: Accommodation Inventory (room types)
-- LEVEL 5: Occupancy Matrix (hotel-specific rules)
-- LEVEL 6: Hall Master Enhancement (multi-capacity seating)
-- LEVEL 7: Venue Suitability Fields (derived capabilities)
-- LEVEL 8: Historical Usage Intelligence (system-maintained)
-- LEVEL 9: Photo Repository (multi-image support)
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
COMMENT ON COLUMN zones.zone_code IS 'Unique zone identifier: NORTH, SOUTH, EAST, WEST, HO';
COMMENT ON COLUMN zones.display_order IS 'Display order in dropdowns';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 2: CITY MASTER ENHANCEMENT
-- ═════════════════════════════════════════════════════════════════════

-- Add zone reference to cities
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES zones(id),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier VARCHAR(10),
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Create index for zone lookup
CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON cities(zone_id);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(active);

COMMENT ON COLUMN cities.zone_id IS 'Zone assignment - every city must belong to a zone';
COMMENT ON COLUMN cities.state IS 'State name';
COMMENT ON COLUMN cities.tier IS 'City tier: Tier1, Tier2, Tier3';
COMMENT ON COLUMN cities.active IS 'Active status for dropdown display';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 3: HOTEL MASTER ENHANCEMENT
-- ═════════════════════════════════════════════════════════════════════

-- Add comprehensive hotel fields
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS hotel_brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS hotel_category VARCHAR(50) CHECK (hotel_category IN ('5_STAR', '4_STAR', '3_STAR', 'BUSINESS', 'BUDGET', 'RESORT', 'BOUTIQUE')),
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES zones(id),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'UNDER_REVIEW')),
-- Contact Information
ADD COLUMN IF NOT EXISTS sales_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS sales_contact_designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS sales_contact_mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS sales_contact_email VARCHAR(100),
-- Operational Fields
ADD COLUMN IF NOT EXISTS preferred_vendor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Ensure zone_id is populated (derive from city if possible)
UPDATE hotels h
SET zone_id = c.zone_id
FROM cities c
WHERE h.city_id = c.id AND h.zone_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_hotels_zone_id ON hotels(zone_id);
CREATE INDEX IF NOT EXISTS idx_hotels_category ON hotels(hotel_category);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_preferred_vendor ON hotels(preferred_vendor);
CREATE INDEX IF NOT EXISTS idx_hotels_blacklisted ON hotels(blacklisted);

COMMENT ON COLUMN hotels.hotel_brand IS 'Hotel brand/chain name (e.g., Marriott, ITC, Taj)';
COMMENT ON COLUMN hotels.hotel_category IS 'Hotel star rating or category';
COMMENT ON COLUMN hotels.zone_id IS 'Zone reference (derived from city)';
COMMENT ON COLUMN hotels.gst_number IS 'GST registration number';
COMMENT ON COLUMN hotels.latitude IS 'GPS latitude for mapping';
COMMENT ON COLUMN hotels.longitude IS 'GPS longitude for mapping';
COMMENT ON COLUMN hotels.preferred_vendor IS 'Preferred vendor flag';
COMMENT ON COLUMN hotels.blacklisted IS 'Blacklisted status';

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

COMMENT ON TABLE hotel_accommodation_inventory IS 'Hotel accommodation inventory by room type';
COMMENT ON COLUMN hotel_accommodation_inventory.total_rooms IS 'Total number of rooms available';
COMMENT ON COLUMN hotel_accommodation_inventory.single_rooms IS 'Number of single occupancy rooms';
COMMENT ON COLUMN hotel_accommodation_inventory.double_rooms IS 'Number of double occupancy rooms';
COMMENT ON COLUMN hotel_accommodation_inventory.triple_rooms IS 'Number of triple occupancy rooms';
COMMENT ON COLUMN hotel_accommodation_inventory.quad_rooms IS 'Number of quad occupancy rooms';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 5: OCCUPANCY MATRIX (from Step 4, ensuring it exists)
-- ═════════════════════════════════════════════════════════════════════

-- Create hotel_occupancy_rules if not exists (Step 4 may have created this)
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

COMMENT ON TABLE hotel_occupancy_rules IS 'Hotel-specific occupancy rules for participant designations';
COMMENT ON COLUMN hotel_occupancy_rules.designation_type IS 'Participant designation: SO, DM, RSM, CH, IBH, OTHERS';
COMMENT ON COLUMN hotel_occupancy_rules.occupancy_type IS 'Room occupancy type: SINGLE, DOUBLE, TRIPLE, QUAD';

-- Default occupancy rules (Step 4 may have created this)
CREATE TABLE IF NOT EXISTS default_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation_type VARCHAR(10) NOT NULL UNIQUE CHECK (designation_type IN ('SO', 'DM', 'RSM', 'CH', 'IBH', 'OTHERS')),
  occupancy_type VARCHAR(10) NOT NULL CHECK (occupancy_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rules if not exist
INSERT INTO default_occupancy_rules (designation_type, occupancy_type, description) VALUES
  ('SO', 'TRIPLE', 'Sales Officers - Triple sharing (3 persons per room)'),
  ('DM', 'DOUBLE', 'District Managers - Double sharing (2 persons per room)'),
  ('RSM', 'SINGLE', 'Regional Sales Managers - Single occupancy (1 person per room)'),
  ('CH', 'SINGLE', 'Channel Heads - Single occupancy (1 person per room)'),
  ('IBH', 'SINGLE', 'Institutional Business Heads - Single occupancy (1 person per room)'),
  ('OTHERS', 'SINGLE', 'Other participants - Single occupancy (1 person per room)')
ON CONFLICT (designation_type) DO UPDATE
  SET occupancy_type = EXCLUDED.occupancy_type,
      description = EXCLUDED.description;

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 6: HALL MASTER ENHANCEMENT
-- ═════════════════════════════════════════════════════════════════════

-- Add comprehensive hall fields
ALTER TABLE halls
ADD COLUMN IF NOT EXISTS floor VARCHAR(50),
ADD COLUMN IF NOT EXISTS area_sqft INTEGER,
ADD COLUMN IF NOT EXISTS indoor_outdoor VARCHAR(20) CHECK (indoor_outdoor IN ('INDOOR', 'OUTDOOR', 'BOTH')),
ADD COLUMN IF NOT EXISTS round_table_capacity INTEGER DEFAULT 0;

-- Ensure all seating capacity columns exist (some may be from earlier migration)
ALTER TABLE halls
ADD COLUMN IF NOT EXISTS theatre_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS u_shape_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cluster_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS boardroom_capacity INTEGER DEFAULT 0;

-- Ensure status column exists
ALTER TABLE halls
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'UNDER_RENOVATION'));

CREATE INDEX IF NOT EXISTS idx_halls_status ON halls(status);
CREATE INDEX IF NOT EXISTS idx_halls_indoor_outdoor ON halls(indoor_outdoor);

COMMENT ON COLUMN halls.floor IS 'Floor location of the hall';
COMMENT ON COLUMN halls.area_sqft IS 'Hall area in square feet';
COMMENT ON COLUMN halls.indoor_outdoor IS 'Indoor, Outdoor, or Both';
COMMENT ON COLUMN halls.theatre_capacity IS 'Capacity in theatre-style seating';
COMMENT ON COLUMN halls.classroom_capacity IS 'Capacity in classroom-style seating';
COMMENT ON COLUMN halls.u_shape_capacity IS 'Capacity in U-shape seating';
COMMENT ON COLUMN halls.cluster_capacity IS 'Capacity in cluster/round-table seating';
COMMENT ON COLUMN halls.boardroom_capacity IS 'Capacity in boardroom-style seating';
COMMENT ON COLUMN halls.round_table_capacity IS 'Capacity in round-table banquet style';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 7: VENUE SUITABILITY FIELDS
-- ═════════════════════════════════════════════════════════════════════

-- Add derived capability fields to hotels
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS residential_supported BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS non_residential_supported BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_residential_pax INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_meeting_pax INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiple_halls BOOLEAN DEFAULT FALSE;

-- Add calculated columns (existing from earlier migration)
-- residential_capacity, largest_hall_capacity, total_rooms already exist

CREATE INDEX IF NOT EXISTS idx_hotels_residential_supported ON hotels(residential_supported);
CREATE INDEX IF NOT EXISTS idx_hotels_max_residential_pax ON hotels(max_residential_pax);
CREATE INDEX IF NOT EXISTS idx_hotels_max_meeting_pax ON hotels(max_meeting_pax);

COMMENT ON COLUMN hotels.residential_supported IS 'Hotel supports residential meetings';
COMMENT ON COLUMN hotels.non_residential_supported IS 'Hotel supports non-residential meetings';
COMMENT ON COLUMN hotels.max_residential_pax IS 'Maximum residential participant capacity';
COMMENT ON COLUMN hotels.max_meeting_pax IS 'Maximum meeting participant capacity (largest hall)';
COMMENT ON COLUMN hotels.multiple_halls IS 'Hotel has multiple meeting halls';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 8: HISTORICAL USAGE INTELLIGENCE
-- ═════════════════════════════════════════════════════════════════════

-- Add system-maintained historical metrics to hotels
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS total_ajanta_events INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_date DATE,
ADD COLUMN IF NOT EXISTS last_division_id UUID REFERENCES divisions(id),
ADD COLUMN IF NOT EXISTS last_meeting_type_id UUID REFERENCES meeting_types(id),
ADD COLUMN IF NOT EXISTS ajanta_rating DECIMAL(3,2) CHECK (ajanta_rating >= 0 AND ajanta_rating <= 5),
ADD COLUMN IF NOT EXISTS ajanta_feedback_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_hotels_total_ajanta_events ON hotels(total_ajanta_events);
CREATE INDEX IF NOT EXISTS idx_hotels_last_used_date ON hotels(last_used_date);

COMMENT ON COLUMN hotels.total_ajanta_events IS 'System-maintained: Total number of Ajanta events hosted';
COMMENT ON COLUMN hotels.last_used_date IS 'System-maintained: Date of last Ajanta event';
COMMENT ON COLUMN hotels.last_division_id IS 'System-maintained: Last division that used this venue';
COMMENT ON COLUMN hotels.last_meeting_type_id IS 'System-maintained: Last meeting type hosted';
COMMENT ON COLUMN hotels.ajanta_rating IS 'Average Ajanta internal rating (0-5)';
COMMENT ON COLUMN hotels.ajanta_feedback_count IS 'Number of feedback responses received';

-- ═════════════════════════════════════════════════════════════════════
-- LEVEL 9: PHOTO REPOSITORY
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS venue_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  hall_id UUID REFERENCES halls(id) ON DELETE CASCADE,
  photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN (
    'HOTEL_EXTERIOR', 'HOTEL_LOBBY', 'HOTEL_GUEST_ROOM', 'HOTEL_RESTAURANT', 
    'HOTEL_AMENITY', 'HALL_EMPTY', 'HALL_THEATRE', 'HALL_CLASSROOM', 
    'HALL_CLUSTER', 'HALL_U_SHAPE', 'HALL_BOARDROOM', 'HALL_SETUP', 'OTHER'
  )),
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(auth_user_id),
  CONSTRAINT venue_photos_reference_check CHECK (
    (hotel_id IS NOT NULL AND hall_id IS NULL) OR
    (hotel_id IS NULL AND hall_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_venue_photos_hotel_id ON venue_photos(hotel_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_hall_id ON venue_photos(hall_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_photo_type ON venue_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_venue_photos_is_primary ON venue_photos(is_primary);

COMMENT ON TABLE venue_photos IS 'Hotel and hall photo repository';
COMMENT ON COLUMN venue_photos.photo_type IS 'Photo category for classification';
COMMENT ON COLUMN venue_photos.photo_url IS 'URL or storage path of photo';
COMMENT ON COLUMN venue_photos.display_order IS 'Order for display in galleries';
COMMENT ON COLUMN venue_photos.is_primary IS 'Primary photo for thumbnail display';

-- ═════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═════════════════════════════════════════════════════════════════════

-- Function to update hotel suitability fields based on inventory and halls
CREATE OR REPLACE FUNCTION update_hotel_suitability(p_hotel_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_rooms INTEGER;
  v_largest_hall INTEGER;
  v_hall_count INTEGER;
BEGIN
  -- Get accommodation inventory
  SELECT total_rooms INTO v_total_rooms
  FROM hotel_accommodation_inventory
  WHERE hotel_id = p_hotel_id;
  
  -- Get largest hall capacity
  SELECT 
    GREATEST(
      COALESCE(MAX(theatre_capacity), 0),
      COALESCE(MAX(classroom_capacity), 0),
      COALESCE(MAX(cluster_capacity), 0)
    ),
    COUNT(*)
  INTO v_largest_hall, v_hall_count
  FROM halls
  WHERE hotel_id = p_hotel_id AND status = 'ACTIVE';
  
  -- Update hotel suitability fields
  UPDATE hotels SET
    total_rooms = COALESCE(v_total_rooms, 0),
    residential_capacity = COALESCE(v_total_rooms, 0) * 2, -- Assume avg 2 persons/room
    largest_hall_capacity = COALESCE(v_largest_hall, 0),
    max_residential_pax = COALESCE(v_total_rooms, 0) * 2,
    max_meeting_pax = COALESCE(v_largest_hall, 0),
    multiple_halls = (v_hall_count > 1),
    residential_supported = (COALESCE(v_total_rooms, 0) > 0),
    updated_at = NOW()
  WHERE id = p_hotel_id;
END;
$$;

COMMENT ON FUNCTION update_hotel_suitability IS 'Updates hotel suitability fields based on inventory and halls';

-- Function to increment historical usage
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

COMMENT ON FUNCTION increment_venue_usage IS 'System function to update historical usage metrics';

-- ═════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════════════════════════════════

-- Zones: Public read
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Zones are publicly readable"
  ON zones FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage zones"
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

-- Accommodation Inventory: Public read, admin write
ALTER TABLE hotel_accommodation_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Accommodation inventory is publicly readable"
  ON hotel_accommodation_inventory FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage accommodation inventory"
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

-- Occupancy Rules: Public read (already created in Step 4, ensuring it exists)
ALTER TABLE hotel_occupancy_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Occupancy rules are publicly readable"
  ON hotel_occupancy_rules FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage hotel occupancy rules"
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

-- Venue Photos: Public read, admin write
ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Venue photos are publicly readable"
  ON venue_photos FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage venue photos"
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
-- VERIFICATION QUERIES
-- ═════════════════════════════════════════════════════════════════════

-- Verify zones created
SELECT * FROM zones ORDER BY display_order;

-- Verify new hotel columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hotels' 
AND column_name IN (
  'hotel_brand', 'hotel_category', 'zone_id', 'gst_number',
  'sales_contact_name', 'preferred_vendor', 'blacklisted',
  'residential_supported', 'max_residential_pax', 'total_ajanta_events'
)
ORDER BY column_name;

-- Verify new hall columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'halls' 
AND column_name IN (
  'floor', 'area_sqft', 'indoor_outdoor', 'round_table_capacity'
)
ORDER BY column_name;

-- Verify new tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'zones', 'hotel_accommodation_inventory', 
  'hotel_occupancy_rules', 'venue_photos'
)
ORDER BY table_name;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create multi-sheet upload template (Excel)
-- 3. Update TypeScript types to match new schema
-- 4. Build upload/import UI components
-- 5. Test venue data with complete hierarchy
-- =====================================================================

