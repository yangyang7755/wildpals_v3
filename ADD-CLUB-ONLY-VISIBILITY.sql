-- Add club-only visibility field to activities table
-- Run this in Supabase SQL Editor

-- Add column to track if activity is visible only to club members
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS club_members_only BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'activities'
AND column_name = 'club_members_only';

-- Note: This works with the existing club_id column
-- If club_members_only = TRUE and club_id is set, only club members can see the activity
