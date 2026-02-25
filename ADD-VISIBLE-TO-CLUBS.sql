-- Add visible_to_clubs column to activities table
-- This stores an array of club IDs that can see this activity when club_members_only is true

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS visible_to_clubs TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN activities.visible_to_clubs IS 'Array of club IDs that can see this activity when club_members_only is true';
