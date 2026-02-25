-- Add gear_required field for climbing activities
-- Run this in Supabase SQL Editor

ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS gear_required TEXT;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'activities'
AND column_name = 'gear_required';
