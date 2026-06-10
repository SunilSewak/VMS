-- Enable Anonymous Read Access for Development
-- Run this in the Supabase SQL Editor to allow anonymous users to read venue data

-- Hotels table: Allow anonymous SELECT
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON hotels
  FOR SELECT
  USING (true);

-- Cities table: Allow anonymous SELECT
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON cities
  FOR SELECT
  USING (true);

-- Hotel Categories table: Allow anonymous SELECT
ALTER TABLE hotel_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON hotel_categories
  FOR SELECT
  USING (true);

-- Halls table: Allow anonymous SELECT
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON halls
  FOR SELECT
  USING (true);

-- Venue Photos table: Allow anonymous SELECT
ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON venue_photos
  FOR SELECT
  USING (true);

-- Venue Shortlists table: Allow authenticated users to SELECT
ALTER TABLE venue_shortlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read" ON venue_shortlists;
CREATE POLICY "Allow authenticated read" ON venue_shortlists
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated insert" ON venue_shortlists;
CREATE POLICY "Allow authenticated insert" ON venue_shortlists
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON venue_shortlists;
CREATE POLICY "Allow authenticated delete" ON venue_shortlists
  FOR DELETE
  USING (auth.role() = 'authenticated');
