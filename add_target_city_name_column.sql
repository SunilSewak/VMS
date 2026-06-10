-- Add target_city_name column to meeting_requests table if it doesn't exist
-- This allows storing custom city names for requests where the city is not in the cities master table

ALTER TABLE meeting_requests 
ADD COLUMN IF NOT EXISTS target_city_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN meeting_requests.target_city_name IS 'Custom city name when the selected city is not in the cities master table';
