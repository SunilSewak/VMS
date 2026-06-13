-- ============================================================================
-- STEP 1: ZONE MASTER FOUNDATION
-- ============================================================================
-- Purpose: Create Zone Master as parent of City Master
-- Scope: ONLY zones, cities, and their integration
-- 
-- Architecture Change:
--   Before: City → Hotel → Hall
--   After:  Zone → City → Hotel → Hall
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREATE ZONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_code VARCHAR(20) NOT NULL UNIQUE,
    zone_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT zones_status_check CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT zones_zone_code_uppercase CHECK (zone_code = UPPER(zone_code))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_zones_zone_code ON public.zones(zone_code);
CREATE INDEX IF NOT EXISTS idx_zones_status ON public.zones(status);
CREATE INDEX IF NOT EXISTS idx_zones_zone_name ON public.zones(zone_name);

-- Add comments
COMMENT ON TABLE public.zones IS 'Zone Master - Primary geographical grouping for venue management';
COMMENT ON COLUMN public.zones.zone_code IS 'Unique zone identifier code (uppercase, e.g., NORTH, SOUTH)';
COMMENT ON COLUMN public.zones.zone_name IS 'Display name for zone (e.g., North, South)';
COMMENT ON COLUMN public.zones.status IS 'Zone status: ACTIVE or INACTIVE';

-- ============================================================================
-- 2. SEED INITIAL ZONE DATA
-- ============================================================================

INSERT INTO public.zones (zone_code, zone_name, status) VALUES
    ('NORTH', 'North', 'ACTIVE'),
    ('SOUTH', 'South', 'ACTIVE'),
    ('EAST', 'East', 'ACTIVE'),
    ('WEST', 'West', 'ACTIVE'),
    ('HO', 'HO', 'ACTIVE')
ON CONFLICT (zone_code) DO NOTHING;

-- ============================================================================
-- 3. ENHANCE CITIES TABLE - ADD ZONE_ID
-- ============================================================================

-- Add zone_id column (nullable initially for backfill)
ALTER TABLE public.cities 
ADD COLUMN IF NOT EXISTS zone_id UUID;

-- Add foreign key constraint
ALTER TABLE public.cities
ADD CONSTRAINT fk_cities_zone_id 
FOREIGN KEY (zone_id) 
REFERENCES public.zones(id)
ON DELETE RESTRICT;

-- Add index for zone_id
CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON public.cities(zone_id);

-- Add comment
COMMENT ON COLUMN public.cities.zone_id IS 'Foreign key to zones table - every city must belong to a zone';

-- ============================================================================
-- 4. BACKFILL EXISTING CITIES WITH ZONE ASSIGNMENTS
-- ============================================================================

-- North Zone Cities
UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'NORTH')
WHERE LOWER(city_name) IN (
    'delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'greater noida',
    'chandigarh', 'jaipur', 'lucknow', 'agra', 'varanasi', 'amritsar',
    'dehradun', 'shimla', 'haridwar', 'rishikesh', 'meerut', 'ghaziabad',
    'faridabad', 'ludhiana', 'jalandhar', 'kanpur', 'allahabad', 'prayagraj'
)
AND zone_id IS NULL;

-- West Zone Cities
UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'WEST')
WHERE LOWER(city_name) IN (
    'mumbai', 'pune', 'ahmedabad', 'surat', 'vadodara', 'rajkot',
    'nashik', 'nagpur', 'thane', 'navi mumbai', 'aurangabad',
    'goa', 'panaji', 'margao', 'vasco', 'indore', 'bhopal',
    'jamnagar', 'gandhinagar', 'udaipur', 'jodhpur', 'ajmer'
)
AND zone_id IS NULL;

-- South Zone Cities
UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'SOUTH')
WHERE LOWER(city_name) IN (
    'chennai', 'bangalore', 'bengaluru', 'hyderabad', 'kochi', 'cochin',
    'trivandrum', 'thiruvananthapuram', 'coimbatore', 'madurai', 'mysore', 'mysuru',
    'vijayawada', 'visakhapatnam', 'vizag', 'guntur', 'tirupati',
    'mangalore', 'hubli', 'belgaum', 'warangal', 'nellore',
    'calicut', 'kozhikode', 'thrissur', 'kollam', 'alappuzha'
)
AND zone_id IS NULL;

-- East Zone Cities
UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'EAST')
WHERE LOWER(city_name) IN (
    'kolkata', 'calcutta', 'bhubaneswar', 'guwahati', 'patna',
    'ranchi', 'jamshedpur', 'dhanbad', 'asansol', 'durgapur',
    'siliguri', 'cuttack', 'rourkela', 'imphal', 'agartala',
    'shillong', 'gangtok', 'dispur', 'itanagar', 'kohima',
    'aizawl', 'raipur', 'bilaspur', 'korba'
)
AND zone_id IS NULL;

-- HO Zone Cities (typically HQ/Head Office locations)
UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'HO')
WHERE LOWER(city_name) IN (
    'ho', 'head office', 'headquarters', 'hq', 'corporate office'
)
AND zone_id IS NULL;

-- ============================================================================
-- 5. VERIFY BACKFILL AND REPORT UNMAPPED CITIES
-- ============================================================================

-- Show cities that still don't have zone assignment
DO $$
DECLARE
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmapped_count
    FROM public.cities
    WHERE zone_id IS NULL;
    
    IF unmapped_count > 0 THEN
        RAISE NOTICE 'WARNING: % cities still need zone assignment', unmapped_count;
        RAISE NOTICE 'Run this query to see unmapped cities:';
        RAISE NOTICE 'SELECT id, city_name, state_name FROM public.cities WHERE zone_id IS NULL;';
    ELSE
        RAISE NOTICE 'SUCCESS: All cities have been assigned to zones';
    END IF;
END $$;

-- ============================================================================
-- 6. MAKE ZONE_ID REQUIRED (NOT NULL)
-- ============================================================================

-- After backfill, make zone_id required
-- Note: This will fail if any cities still have NULL zone_id
-- Handle unmapped cities manually before running this

-- Uncomment after verifying all cities have zones:
-- ALTER TABLE public.cities 
-- ALTER COLUMN zone_id SET NOT NULL;

-- ============================================================================
-- 7. ADD VALIDATION TRIGGERS
-- ============================================================================

-- Prevent deletion of zones that have cities
CREATE OR REPLACE FUNCTION prevent_zone_deletion()
RETURNS TRIGGER AS $$
DECLARE
    city_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO city_count
    FROM public.cities
    WHERE zone_id = OLD.id;
    
    IF city_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete zone %. % cities are assigned to this zone. Deactivate instead.',
            OLD.zone_name, city_count;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_zone_deletion
BEFORE DELETE ON public.zones
FOR EACH ROW
EXECUTE FUNCTION prevent_zone_deletion();

-- Prevent assigning inactive zones to cities
CREATE OR REPLACE FUNCTION validate_active_zone()
RETURNS TRIGGER AS $$
DECLARE
    zone_status VARCHAR(20);
BEGIN
    -- Check if zone_id is being set
    IF NEW.zone_id IS NOT NULL THEN
        SELECT status INTO zone_status
        FROM public.zones
        WHERE id = NEW.zone_id;
        
        IF zone_status = 'INACTIVE' THEN
            RAISE EXCEPTION 'Cannot assign city to inactive zone. Please select an active zone.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_active_zone
BEFORE INSERT OR UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION validate_active_zone();

-- ============================================================================
-- 8. CREATE RLS POLICIES FOR ZONES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active zones
CREATE POLICY "zones_select_policy" ON public.zones
    FOR SELECT
    USING (true);

-- Policy: Only admins can insert zones
CREATE POLICY "zones_insert_policy" ON public.zones
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
            )
        )
    );

-- Policy: Only admins can update zones
CREATE POLICY "zones_update_policy" ON public.zones
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
            )
        )
    );

-- Policy: Only super admins can delete zones (plus trigger prevents deletion if cities exist)
CREATE POLICY "zones_delete_policy" ON public.zones
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role_id IN (
                SELECT id FROM public.roles 
                WHERE role_code = 'ROLE_SUPER_ADMIN'
            )
        )
    );

-- ============================================================================
-- 9. ADD AUDIT TRIGGERS FOR ZONES
-- ============================================================================

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_zones_updated_at
BEFORE UPDATE ON public.zones
FOR EACH ROW
EXECUTE FUNCTION update_zones_updated_at();

-- Set created_by on insert
CREATE OR REPLACE FUNCTION set_zones_created_by()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_zones_created_by
BEFORE INSERT ON public.zones
FOR EACH ROW
EXECUTE FUNCTION set_zones_created_by();

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- View zone distribution
SELECT 
    z.zone_code,
    z.zone_name,
    z.status,
    COUNT(c.id) as city_count
FROM public.zones z
LEFT JOIN public.cities c ON c.zone_id = z.id
GROUP BY z.id, z.zone_code, z.zone_name, z.status
ORDER BY z.zone_code;

-- Check for unmapped cities
SELECT 
    id,
    city_name,
    state_name,
    zone_id
FROM public.cities
WHERE zone_id IS NULL
ORDER BY city_name;

-- Verify constraints
SELECT
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.zones'::regclass
ORDER BY conname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary Report
DO $$
DECLARE
    zone_count INTEGER;
    city_count INTEGER;
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO zone_count FROM public.zones;
    SELECT COUNT(*) INTO city_count FROM public.cities;
    SELECT COUNT(*) INTO unmapped_count FROM public.cities WHERE zone_id IS NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ZONE MASTER FOUNDATION - MIGRATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Zones created: %', zone_count;
    RAISE NOTICE 'Total cities: %', city_count;
    RAISE NOTICE 'Mapped cities: %', (city_count - unmapped_count);
    RAISE NOTICE 'Unmapped cities: %', unmapped_count;
    RAISE NOTICE '========================================';
    
    IF unmapped_count > 0 THEN
        RAISE NOTICE 'ACTION REQUIRED: Manually assign zones to unmapped cities';
        RAISE NOTICE 'Then run: ALTER TABLE public.cities ALTER COLUMN zone_id SET NOT NULL;';
    ELSE
        RAISE NOTICE 'Ready to make zone_id required (uncomment line 149)';
    END IF;
END $$;
