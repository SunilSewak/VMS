-- =====================================================================
-- PHASE 4: OCCUPANCY MATRIX SCHEMA UPDATE
-- =====================================================================
-- Align occupancy rules with AVEMS Phase 4 specification:
-- - Only 4 designations: SO, DM, RSM, Senior Manager
-- - Each maps to one occupancy type: Single, Double, Triple, Quad
-- - One matrix per hotel (no multi-row per designation)
-- =====================================================================

-- Update constraint on hotel_occupancy_rules to match Phase 4 designations
-- Note: Existing constraint may need adjustment via ALTER if adding Senior Manager

-- Add comment for clarity
COMMENT ON TABLE hotel_occupancy_rules IS 
'PHASE 4: Occupancy Matrix - Hotel-specific occupancy rules for participant designations
Designations: SO (Sales Officer), DM (District Manager), RSM (Regional Sales Manager), Senior Manager
One rule per hotel per designation - defines the room occupancy type for that role.';

-- Insert Phase 4 default occupancy rules
INSERT INTO default_occupancy_rules (designation_type, occupancy_type, description) 
VALUES
  ('SO', 'TRIPLE', 'Sales Officer - Triple occupancy'),
  ('DM', 'DOUBLE', 'District Manager - Double occupancy'),
  ('RSM', 'SINGLE', 'Regional Sales Manager - Single occupancy'),
  ('Senior Manager', 'SINGLE', 'Senior Manager - Single occupancy')
ON CONFLICT (designation_type) DO UPDATE
SET occupancy_type = EXCLUDED.occupancy_type,
    description = EXCLUDED.description;

-- Verify the structure
SELECT 
  designation_type,
  occupancy_type,
  description
FROM default_occupancy_rules
WHERE designation_type IN ('SO', 'DM', 'RSM', 'Senior Manager')
ORDER BY 
  CASE 
    WHEN designation_type = 'SO' THEN 1
    WHEN designation_type = 'DM' THEN 2
    WHEN designation_type = 'RSM' THEN 3
    WHEN designation_type = 'Senior Manager' THEN 4
  END;
