-- ============================================================================
-- VENUE REPOSITORY RECONCILIATION AUDIT
-- ============================================================================
-- Purpose: Document current database schema without any modifications
-- Date: June 13, 2026
-- Status: AUDIT ONLY - NO MODIFICATIONS
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLE STRUCTURE AUDIT
-- ============================================================================

-- Get all tables in public schema
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- TABLE: zones
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'zones'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'zones';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'zones';

-- Foreign keys
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'zones' AND foreign_table_name IS NOT NULL;

-- ============================================================================
-- TABLE: cities
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'cities'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'cities';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'cities';

-- Foreign keys
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'cities' AND foreign_table_name IS NOT NULL;

-- ============================================================================
-- TABLE: hotels
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'hotels'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'hotels';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'hotels';

-- Foreign keys
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'hotels' AND foreign_table_name IS NOT NULL;

-- ============================================================================
-- TABLE: halls
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'halls'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'halls';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'halls';

-- Foreign keys
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'halls' AND foreign_table_name IS NOT NULL;

-- ============================================================================
-- TABLE: hotel_accommodation_inventory
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'hotel_accommodation_inventory'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'hotel_accommodation_inventory';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'hotel_accommodation_inventory';

-- Foreign keys
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'hotel_accommodation_inventory' AND foreign_table_name IS NOT NULL;

-- ============================================================================
-- TABLE: hotel_occupancy_rules
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'hotel_occupancy_rules'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'hotel_occupancy_rules';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'hotel_occupancy_rules';

-- Foreign keys
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND table_name = 'hotel_occupancy_rules' AND foreign_table_name IS NOT NULL;

-- ============================================================================
-- TABLE: default_occupancy_rules
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'default_occupancy_rules'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'default_occupancy_rules';

-- Indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'default_occupancy_rules';

-- ============================================================================
-- TABLE: venue_import_history
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'venue_import_history'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'venue_import_history';

-- ============================================================================
-- TABLE: venue_photos
-- ============================================================================

-- Column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'venue_photos'
ORDER BY ordinal_position;

-- Constraints
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'venue_photos';

-- ============================================================================
-- SECTION 2: FUNCTION AUDIT
-- ============================================================================

-- List all functions
SELECT 
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Get function definitions
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_hotel_suitability',
    'increment_venue_usage'
);

-- ============================================================================
-- SECTION 3: TRIGGER AUDIT
-- ============================================================================

-- Get all triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Detailed trigger info
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.event_manipulation,
    t.action_timing,
    p.proname AS function_name
FROM information_schema.triggers t
JOIN pg_proc p ON t.action_statement::text LIKE '%' || p.proname || '%'
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- ============================================================================
-- SECTION 4: RLS POLICY AUDIT
-- ============================================================================

-- Get RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'zones',
    'hotels',
    'halls',
    'hotel_accommodation_inventory',
    'hotel_occupancy_rules'
)
ORDER BY tablename, policyname;

-- Check RLS enabled tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'zones',
    'cities',
    'hotels',
    'halls',
    'hotel_accommodation_inventory',
    'hotel_occupancy_rules',
    'default_occupancy_rules',
    'venue_import_history',
    'venue_photos'
)
ORDER BY tablename;

-- ============================================================================
-- SECTION 5: DATA SAMPLE AUDIT
-- ============================================================================

-- Count records in each table
SELECT 'zones' as table_name, COUNT(*) as record_count FROM public.zones
UNION ALL
SELECT 'cities', COUNT(*) FROM public.cities
UNION ALL
SELECT 'hotels', COUNT(*) FROM public.hotels
UNION ALL
SELECT 'halls', COUNT(*) FROM public.halls
UNION ALL
SELECT 'hotel_accommodation_inventory', COUNT(*) FROM public.hotel_accommodation_inventory
UNION ALL
SELECT 'hotel_occupancy_rules', COUNT(*) FROM public.hotel_occupancy_rules
UNION ALL
SELECT 'default_occupancy_rules', COUNT(*) FROM public.default_occupancy_rules
UNION ALL
SELECT 'venue_import_history', COUNT(*) FROM public.venue_import_history
UNION ALL
SELECT 'venue_photos', COUNT(*) FROM public.venue_photos;

-- ============================================================================
-- SECTION 6: MISSING ZONES IDENTIFICATION
-- ============================================================================

-- Cities without zone assignment
SELECT 
    id,
    city_name,
    state_name,
    zone_id
FROM public.cities
WHERE zone_id IS NULL
LIMIT 20;

-- ============================================================================
-- END AUDIT
-- ============================================================================
