-- Remove the sport_type CHECK constraint to allow free text
-- Run this BEFORE running SETUP-DEMO-PROFILE.sql

-- Drop the constraint if it exists
ALTER TABLE public.clubs 
DROP CONSTRAINT IF EXISTS clubs_sport_type_check;

-- Verify the constraint is gone
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.clubs'::regclass
AND conname = 'clubs_sport_type_check';

-- If the query above returns no rows, the constraint is removed successfully!
-- Now you can use any text value for sport_type (e.g., 'Cycling', 'cycling', 'Mountain Biking', etc.)
