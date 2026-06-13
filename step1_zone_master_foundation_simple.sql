-- ============================================================================
-- STEP 1: ZONE MASTER FOUNDATION - SIMPLIFIED MIGRATION
-- ============================================================================
-- Purpose: Create Zone Master as parent of City Master
-- NOTE: Run this migration in Supabase SQL Editor
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_zones_zone_code ON public.zones(zone_code);
CREATE INDEX IF NOT EXISTS idx_zones_status ON public.zones(status);
CREATE INDEX IF NOT EXISTS idx_zones_zone_name ON public.zones(zone_name);

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

ALTER TABLE public.cities 
ADD COLUMN IF NOT EXISTS zone_id UUID;

-- Add foreign key constraint
ALTER TABLE public.cities
ADD CONSTRAINT fk_cities_zone_id 
FOREIGN KEY (zone_id) 
REFERENCES public.zones(id)
ON DELETE RESTRICT;

-- Add index
CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON public.cities(zone_id);

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

-- HO Zone Cities
UPDATE public.cities 
SET zone_id = (SELECT id FROM public.zones WHERE zone_code = 'HO')
WHERE LOWER(city_name) IN (
    'ho', 'head office', 'headquarters', 'hq', 'corporate office'
)
AND zone_id IS NULL;

-- ============================================================================
-- 5. ENABLE RLS ON ZONES TABLE
-- ============================================================================

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "zones_select_policy" ON public.zones;
DROP POLICY IF EXISTS "zones_insert_policy" ON public.zones;
DROP POLICY IF EXISTS "zones_update_policy" ON public.zones;
DROP POLICY IF EXISTS "zones_delete_policy" ON public.zones;

-- Policy: Everyone can read zones
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

-- Policy: Only super admins can delete zones
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

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration completes)
-- ============================================================================

-- Check zones created
-- SELECT COUNT(*) as zone_count FROM public.zones;

-- Check zone distribution
-- SELECT 
--     z.zone_code,
--     z.zone_name,
--     COUNT(c.id) as city_count
-- FROM public.zones z
-- LEFT JOIN public.cities c ON c.zone_id = z.id
-- GROUP BY z.id, z.zone_code, z.zone_name
-- ORDER BY z.zone_code;

-- Check for unmapped cities
-- SELECT 
--     id,
--     city_name,
--     state_name
-- FROM public.cities
-- WHERE zone_id IS NULL
-- ORDER BY city_name;
