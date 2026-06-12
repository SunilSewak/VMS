-- =====================================================================
-- STEP 5: FORM OPTIMIZATION MIGRATION
-- =====================================================================
-- Purpose: Add optional venue preference fields to meeting_requests
-- 
-- Changes:
-- 1. Add preferred_hotels (comma-separated hotel IDs)
-- 2. Add preferred_locality dropdown selection
-- 3. Add venue_preference_notes text field
-- 4. Add additional_notes text field (general requirements)
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- STEP 1: Add Venue Preference Fields
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE meeting_requests
ADD COLUMN IF NOT EXISTS preferred_hotels TEXT,
ADD COLUMN IF NOT EXISTS preferred_locality VARCHAR(100),
ADD COLUMN IF NOT EXISTS venue_preference_notes TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN meeting_requests.preferred_hotels IS 'Comma-separated list of preferred hotel IDs (max 3)';
COMMENT ON COLUMN meeting_requests.preferred_locality IS 'Preferred locality: Airport Area, City Center, Business District, Highway, Industrial Area, Any Location';
COMMENT ON COLUMN meeting_requests.venue_preference_notes IS 'Additional venue preference notes';
COMMENT ON COLUMN meeting_requests.additional_notes IS 'General additional requirements and notes';

-- ─────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────────────────

-- Verify columns added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'meeting_requests'
AND column_name IN ('preferred_hotels', 'preferred_locality', 'venue_preference_notes', 'additional_notes')
ORDER BY column_name;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update TypeScript types (already done in types.ts)
-- 3. Update application UI to use new fields
-- 4. Test form with new structured dropdowns
-- =====================================================================

