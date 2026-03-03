-- System for managing recurrent activities
-- This creates new activity instances every Sunday at 12:00 PM for the upcoming week

-- Add fields to track recurrent activity relationships
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS parent_recurrent_id UUID REFERENCES activities(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_recurrent_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instance_date DATE;

-- Add comments
COMMENT ON COLUMN activities.parent_recurrent_id IS 'References the parent recurrent activity template';
COMMENT ON COLUMN activities.is_recurrent_template IS 'True if this is a recurrent template, false if it is an instance';
COMMENT ON COLUMN activities.instance_date IS 'The specific date for this instance of a recurrent activity';

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_activities_recurrent_template ON activities(is_recurrent_template) WHERE is_recurrent_template = TRUE;
CREATE INDEX IF NOT EXISTS idx_activities_parent_recurrent ON activities(parent_recurrent_id) WHERE parent_recurrent_id IS NOT NULL;

-- Function to generate next occurrence date for a recurrent activity
CREATE OR REPLACE FUNCTION get_next_occurrence_date(
  p_day_of_week INTEGER,
  p_from_date DATE DEFAULT CURRENT_DATE
)
RETURNS DATE AS $$
DECLARE
  v_days_until_target INTEGER;
  v_current_day_of_week INTEGER;
BEGIN
  -- Get current day of week (0 = Sunday, 6 = Saturday)
  v_current_day_of_week := EXTRACT(DOW FROM p_from_date);
  
  -- Calculate days until target day
  v_days_until_target := (p_day_of_week - v_current_day_of_week + 7) % 7;
  
  -- If it's 0, it means today is the target day, so get next week
  IF v_days_until_target = 0 THEN
    v_days_until_target := 7;
  END IF;
  
  RETURN p_from_date + v_days_until_target;
END;
$$ LANGUAGE plpgsql;

-- Function to create activity instances for recurrent activities
CREATE OR REPLACE FUNCTION create_recurrent_activity_instances()
RETURNS TABLE(created_count INTEGER, activity_id UUID, instance_date DATE) AS $$
DECLARE
  v_recurrent_activity RECORD;
  v_next_date DATE;
  v_existing_instance UUID;
  v_created_count INTEGER := 0;
BEGIN
  -- Loop through all active recurrent template activities
  FOR v_recurrent_activity IN
    SELECT 
      id,
      organizer_id,
      type,
      title,
      time,
      location,
      meetup_location,
      max_participants,
      special_comments,
      distance,
      elevation,
      pace,
      distance_unit,
      elevation_unit,
      pace_unit,
      road_surface,
      route_link,
      cafe_stop,
      climbing_level,
      climbing_type,
      gear_required,
      running_terrain,
      club_members_only,
      visible_to_clubs,
      recurrence_day_of_week
    FROM activities
    WHERE activity_type = 'recurrent'
      AND is_recurrent_template = TRUE
  LOOP
    -- Calculate next occurrence date (next week's occurrence)
    v_next_date := get_next_occurrence_date(v_recurrent_activity.recurrence_day_of_week, CURRENT_DATE + INTERVAL '7 days');
    
    -- Check if instance already exists for this date
    SELECT id INTO v_existing_instance
    FROM activities
    WHERE parent_recurrent_id = v_recurrent_activity.id
      AND instance_date = v_next_date
    LIMIT 1;
    
    -- Only create if doesn't exist
    IF v_existing_instance IS NULL THEN
      -- Create new instance
      INSERT INTO activities (
        organizer_id,
        type,
        title,
        date,
        time,
        location,
        meetup_location,
        max_participants,
        current_participants,
        special_comments,
        distance,
        elevation,
        pace,
        distance_unit,
        elevation_unit,
        pace_unit,
        road_surface,
        route_link,
        cafe_stop,
        climbing_level,
        climbing_type,
        gear_required,
        running_terrain,
        club_members_only,
        visible_to_clubs,
        activity_type,
        parent_recurrent_id,
        is_recurrent_template,
        instance_date,
        recurrence_day_of_week
      ) VALUES (
        v_recurrent_activity.organizer_id,
        v_recurrent_activity.type,
        v_recurrent_activity.title,
        v_next_date,
        v_recurrent_activity.time,
        v_recurrent_activity.location,
        v_recurrent_activity.meetup_location,
        v_recurrent_activity.max_participants,
        0, -- current_participants starts at 0
        v_recurrent_activity.special_comments,
        v_recurrent_activity.distance,
        v_recurrent_activity.elevation,
        v_recurrent_activity.pace,
        v_recurrent_activity.distance_unit,
        v_recurrent_activity.elevation_unit,
        v_recurrent_activity.pace_unit,
        v_recurrent_activity.road_surface,
        v_recurrent_activity.route_link,
        v_recurrent_activity.cafe_stop,
        v_recurrent_activity.climbing_level,
        v_recurrent_activity.climbing_type,
        v_recurrent_activity.gear_required,
        v_recurrent_activity.running_terrain,
        v_recurrent_activity.club_members_only,
        v_recurrent_activity.visible_to_clubs,
        'one_off', -- Instances are treated as one-off activities
        v_recurrent_activity.id,
        FALSE,
        v_next_date,
        v_recurrent_activity.recurrence_day_of_week
      )
      RETURNING id INTO v_existing_instance;
      
      v_created_count := v_created_count + 1;
      
      -- Return info about created instance
      activity_id := v_existing_instance;
      instance_date := v_next_date;
      created_count := v_created_count;
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create a function that can be called via pg_cron or manually
CREATE OR REPLACE FUNCTION generate_weekly_recurrent_activities()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO v_result
  FROM (
    SELECT * FROM create_recurrent_activity_instances()
  ) t;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Note: To set up the weekly cron job, you need to enable pg_cron extension
-- and run this in your Supabase SQL editor:
--
-- SELECT cron.schedule(
--   'generate-recurrent-activities',
--   '0 12 * * 0',  -- Every Sunday at 12:00 PM (noon)
--   $$SELECT generate_weekly_recurrent_activities()$$
-- );
--
-- To check scheduled jobs:
-- SELECT * FROM cron.job;
--
-- To unschedule:
-- SELECT cron.unschedule('generate-recurrent-activities');
