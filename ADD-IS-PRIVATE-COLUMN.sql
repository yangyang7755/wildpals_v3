-- Add is_private column to clubs table if missing
-- Run this in Supabase SQL Editor if you get the error:
-- "Could not find the 'is_private' column of 'clubs' in the schema cache"

-- Add the column if it doesn't exist
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- Update existing clubs to be private by default
UPDATE public.clubs 
SET is_private = true 
WHERE is_private IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'clubs'
AND column_name = 'is_private';

-- If you see the column listed above, you're good to go!
-- If not, you may need to run the full DATABASE-CLUBS-FIX.sql migration instead.
