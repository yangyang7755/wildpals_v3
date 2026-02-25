-- Check Clubs Table Schema
-- Run this to see what columns exist in your clubs table

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clubs'
ORDER BY ordinal_position;

-- If is_private column is missing, run this:
-- ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- If sport_type is still an enum, run this:
-- ALTER TABLE public.clubs ALTER COLUMN sport_type TYPE TEXT;
