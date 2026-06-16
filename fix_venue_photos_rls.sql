-- Venue Photos RLS Policy Fix
-- This script fixes the row-level security policy for venue_photos
-- It ensures that users with ROLE_ADMIN or ROLE_SUPER_ADMIN can upload photos
-- by properly checking the joined roles table or the user's role metadata

BEGIN;

-- Drop existing policies that might be incorrectly structured
DROP POLICY IF EXISTS "Admins can insert venue photos" ON venue_photos;
DROP POLICY IF EXISTS "Admins can upload photos" ON venue_photos;
DROP POLICY IF EXISTS "Admins can manage photos" ON venue_photos;

-- Create the updated policy
CREATE POLICY "Admins can insert venue photos" ON venue_photos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    LEFT JOIN roles ON users.role_id = roles.id 
    WHERE users.auth_user_id = auth.uid() 
    AND roles.role_code IN ('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')
  )
);

COMMIT;
