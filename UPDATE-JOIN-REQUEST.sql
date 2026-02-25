-- Update Join Request to Accepted
-- This will mark your join request for "Cotswolds long ride" as accepted
-- Run this in Supabase SQL Editor

-- First, let's find the activity
SELECT id, title, organizer_id 
FROM activities 
WHERE title ILIKE '%cotswold%' OR title ILIKE '%long ride%';

-- Update the join request to accepted status
-- Replace the activity_id and requester_id with your actual values
UPDATE join_requests
SET status = 'accepted'
WHERE activity_id = (
  SELECT id FROM activities 
  WHERE title ILIKE '%cotswold%' OR title ILIKE '%long ride%'
  LIMIT 1
)
AND requester_id = (
  SELECT id FROM profiles 
  WHERE email = 'yangyang.ruohan.liu@gmail.com'
);

-- Verify the update
SELECT 
  jr.id,
  jr.status,
  a.title as activity_title,
  p.full_name as requester_name
FROM join_requests jr
JOIN activities a ON jr.activity_id = a.id
JOIN profiles p ON jr.requester_id = p.id
WHERE a.title ILIKE '%cotswold%' OR a.title ILIKE '%long ride%';

-- Done! Your join request should now show as "accepted"
