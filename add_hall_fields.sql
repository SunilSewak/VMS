-- ============================================================================
-- ADD MISSING HALL FIELDS
-- ============================================================================
-- Fields: round_table_capacity, indoor_outdoor
-- ============================================================================

ALTER TABLE public.halls
ADD COLUMN IF NOT EXISTS round_table_capacity INTEGER,
ADD COLUMN IF NOT EXISTS indoor_outdoor VARCHAR(20) DEFAULT 'INDOOR';

-- Add constraint for indoor_outdoor
ALTER TABLE public.halls
ADD CONSTRAINT halls_indoor_outdoor_check 
CHECK (indoor_outdoor IN ('INDOOR', 'OUTDOOR', 'BOTH'))
ON CONFLICT DO NOTHING;

-- Add index
CREATE INDEX IF NOT EXISTS idx_halls_indoor_outdoor ON public.halls(indoor_outdoor);

-- Migration complete
SELECT 'Hall fields added successfully' as status;
