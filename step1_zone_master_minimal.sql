-- ============================================================================
-- STEP 1: ZONE MASTER FOUNDATION - MINIMAL VERSION
-- ============================================================================
-- Run each section separately if needed
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ZONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_code VARCHAR(20) NOT NULL UNIQUE,
    zone_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES auth.users(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_zones_zone_code ON public.zones(zone_code);
CREATE INDEX IF NOT EXISTS idx_zones_status ON public.zones(status);

-- ============================================================================
-- PART 2: SEED INITIAL ZONES
-- ============================================================================

INSERT INTO public.zones (zone_code, zone_name, status) VALUES
    ('NORTH', 'North', 'ACTIVE'),
    ('SOUTH', 'South', 'ACTIVE'),
    ('EAST', 'East', 'ACTIVE'),
    ('WEST', 'West', 'ACTIVE'),
    ('HO', 'HO', 'ACTIVE')
ON CONFLICT (zone_code) DO NOTHING;

-- ============================================================================
-- PART 3: ADD ZONE_ID TO CITIES TABLE
-- ============================================================================

ALTER TABLE public.cities 
ADD COLUMN IF NOT EXISTS zone_id UUID;

-- ============================================================================
-- PART 4: ADD FOREIGN KEY CONSTRAINT
-- ============================================================================

-- Drop constraint if it exists
ALTER TABLE public.cities
DROP CONSTRAINT IF EXISTS fk_cities_zone_id;

-- Add foreign key
ALTER TABLE public.cities
ADD CONSTRAINT fk_cities_zone_id 
FOREIGN KEY (zone_id) 
REFERENCES public.zones(id)
ON DELETE RESTRICT;

-- Add index
CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON public.cities(zone_id);

-- ============================================================================
-- PART 5: BACKFILL CITIES - NORTH ZONE
-- ============================================================================

UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'NORTH' LIMIT 1)
WHERE LOWER(city_name) IN (
    'delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'greater noida',
    'chandigarh', 'jaipur', 'lucknow', 'agra', 'varanasi', 'amritsar'
)
AND zone_id IS NULL;

-- ============================================================================
-- PART 6: BACKFILL CITIES - WEST ZONE
-- ============================================================================

UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'WEST' LIMIT 1)
WHERE LOWER(city_name) IN (
    'mumbai', 'pune', 'ahmedabad', 'surat', 'vadodara', 'rajkot',
    'nashik', 'nagpur', 'thane', 'navi mumbai', 'aurangabad', 'goa'
)
AND zone_id IS NULL;

-- ============================================================================
-- PART 7: BACKFILL CITIES - SOUTH ZONE
-- ============================================================================

UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'SOUTH' LIMIT 1)
WHERE LOWER(city_name) IN (
    'chennai', 'bangalore', 'bengaluru', 'hyderabad', 'kochi', 'cochin',
    'trivandrum', 'thiruvananthapuram', 'coimbatore', 'madurai', 'mysore', 'mysuru'
)
AND zone_id IS NULL;

-- ============================================================================
-- PART 8: BACKFILL CITIES - EAST ZONE
-- ============================================================================

UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'EAST' LIMIT 1)
WHERE LOWER(city_name) IN (
    'kolkata', 'calcutta', 'bhubaneswar', 'guwahati', 'patna',
    'ranchi', 'jamshedpur', 'dhanbad', 'asansol', 'durgapur'
)
AND zone_id IS NULL;

-- ============================================================================
-- PART 9: ENABLE RLS
-- ============================================================================

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS zones_select_policy ON public.zones;
DROP POLICY IF EXISTS zones_insert_policy ON public.zones;
DROP POLICY IF EXISTS zones_update_policy ON public.zones;
DROP POLICY IF EXISTS zones_delete_policy ON public.zones;

-- Create policies
CREATE POLICY zones_select_policy ON public.zones
    FOR SELECT
    USING (true);

CREATE POLICY zones_insert_policy ON public.zones
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

CREATE POLICY zones_update_policy ON public.zones
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

CREATE POLICY zones_delete_policy ON public.zones
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
-- Done! Verify below
-- ============================================================================

-- SELECT COUNT(*) as zones_count FROM public.zones;
-- SELECT COUNT(*) as cities_with_zone FROM public.cities WHERE zone_id IS NOT NULL;
-- SELECT COUNT(*) as cities_without_zone FROM public.cities WHERE zone_id IS NULL;
