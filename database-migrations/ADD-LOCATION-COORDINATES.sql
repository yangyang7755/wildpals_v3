-- Add latitude and longitude columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(latitude, longitude);

-- Add comment
COMMENT ON COLUMN activities.latitude IS 'Latitude coordinate of activity location';
COMMENT ON COLUMN activities.longitude IS 'Longitude coordinate of activity location';
