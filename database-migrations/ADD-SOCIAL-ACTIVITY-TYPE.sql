-- Add 'social' to the activity_type enum
-- This allows creating social events/gatherings

-- Step 1: Add 'social' to the activity_type enum
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'social';

-- Step 2: Add comment
COMMENT ON TYPE activity_type IS 'Types of activities: cycling, climbing, running, social';

-- Verify the change
SELECT enum_range(NULL::activity_type);
