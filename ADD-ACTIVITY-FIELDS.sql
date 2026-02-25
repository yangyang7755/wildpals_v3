-- Add new fields to activities table for enhanced cycling and climbing features
-- Run this in Supabase SQL Editor

-- Add cycling-specific fields
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS route_link TEXT,
ADD COLUMN IF NOT EXISTS road_surface TEXT CHECK (road_surface IN ('road', 'gravel', 'mtb', 'track', 'social')),
ADD COLUMN IF NOT EXISTS cafe_stop TEXT;

-- Add climbing-specific fields
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS climbing_type TEXT CHECK (climbing_type IN ('indoor', 'bouldering', 'sport climbing', 'trad climbing'));

-- Add participant tracking field (current count of accepted members)
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- Create function to update participant count
CREATE OR REPLACE FUNCTION update_activity_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE public.activities
    SET current_participants = current_participants + 1
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE public.activities
    SET current_participants = current_participants + 1
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE public.activities
    SET current_participants = current_participants - 1
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE public.activities
    SET current_participants = current_participants - 1
    WHERE id = OLD.activity_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant count
DROP TRIGGER IF EXISTS activity_participant_count_trigger ON public.join_requests;
CREATE TRIGGER activity_participant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_participant_count();

-- Initialize current_participants for existing activities
UPDATE public.activities a
SET current_participants = (
  SELECT COUNT(*)
  FROM public.join_requests jr
  WHERE jr.activity_id = a.id
  AND jr.status = 'accepted'
);

-- Verify the new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'activities'
AND column_name IN ('route_link', 'road_surface', 'cafe_stop', 'climbing_type', 'current_participants');
