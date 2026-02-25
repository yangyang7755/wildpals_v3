-- Accept join request for Cotswolds activity
-- Run this in Supabase SQL Editor to test the activity chat feature

UPDATE public.join_requests
SET status = 'accepted'
WHERE activity_id = (
  SELECT id FROM public.activities 
  WHERE title ILIKE '%cotswold%' 
  LIMIT 1
)
AND requester_id = (
  SELECT id FROM auth.users 
  WHERE email = 'yangyang.ruohan.liu@gmail.com'
  LIMIT 1
);

-- Verify the update
SELECT 
  jr.id,
  jr.status,
  a.title as activity_title,
  p.full_name as requester_name
FROM public.join_requests jr
JOIN public.activities a ON a.id = jr.activity_id
JOIN public.profiles p ON p.id = jr.requester_id
WHERE a.title ILIKE '%cotswold%'
AND jr.requester_id = (
  SELECT id FROM auth.users 
  WHERE email = 'yangyang.ruohan.liu@gmail.com'
  LIMIT 1
);
