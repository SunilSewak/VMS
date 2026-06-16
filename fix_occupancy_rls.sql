DROP POLICY IF EXISTS "Admins can manage hotel occupancy rules" ON hotel_occupancy_rules;

CREATE POLICY "Anyone can manage hotel occupancy rules"
ON hotel_occupancy_rules FOR ALL
USING (true)
WITH CHECK (true);
