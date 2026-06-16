-- Storage policies for the 'venue-photos' bucket

BEGIN;

-- 1. Ensure the bucket exists and is public (since we use getPublicUrl)
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-photos', 'venue-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop any existing policies for the bucket to prevent conflicts
DROP POLICY IF EXISTS "Public can view venue photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload venue photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update venue photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete venue photos" ON storage.objects;

-- 3. SELECT policy: Anyone can view public photos
CREATE POLICY "Public can view venue photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-photos');

-- 4. INSERT policy: Authenticated users can upload photos
CREATE POLICY "Authenticated users can upload venue photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'venue-photos' 
    AND auth.role() = 'authenticated'
);

-- 5. UPDATE policy: Authenticated users can update photos
CREATE POLICY "Authenticated users can update venue photos"
ON storage.objects FOR UPDATE
WITH CHECK (
    bucket_id = 'venue-photos' 
    AND auth.role() = 'authenticated'
);

-- 6. DELETE policy: Authenticated users can delete photos
CREATE POLICY "Authenticated users can delete venue photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'venue-photos' 
    AND auth.role() = 'authenticated'
);

COMMIT;
