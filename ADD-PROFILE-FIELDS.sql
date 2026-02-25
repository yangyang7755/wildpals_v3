-- Add profile fields for onboarding
-- Run this in Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Note: location column should already exist from previous setup
-- If not, add it:
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('age', 'gender', 'location', 'bio');
