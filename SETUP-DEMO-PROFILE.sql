-- Setup Demo User Profile with Oxford University Cycling Club
-- Run this in Supabase SQL Editor

-- Get the demo user ID
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get demo user ID
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'yangyang.ruohan.liu@gmail.com'
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'Demo user not found. Please create the user first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Demo user ID: %', demo_user_id;

  -- Update profile with bio and location
  UPDATE public.profiles
  SET 
    bio = 'Weekend warrior. Always up for cycling and running adventures!',
    location = 'London, UK',
    full_name = 'Yangyang'
  WHERE id = demo_user_id;

  -- Add user sports if not exists (cyclist and runner only)
  DELETE FROM public.user_sports WHERE user_id = demo_user_id;
  
  INSERT INTO public.user_sports (user_id, sport, skill_level)
  VALUES 
    (demo_user_id, 'cycling', 'advanced'),
    (demo_user_id, 'running', 'intermediate');

  -- Create Oxford University Cycling Club if not exists
  INSERT INTO public.clubs (name, description, location, sport_type, creator_id, member_count, is_private)
  VALUES (
    'Oxford University Cycling Club',
    'The official cycling club for Oxford University students and alumni. Join us for weekly rides around Oxfordshire!',
    'Oxford, UK',
    'cycling', -- lowercase to match constraint if it exists
    demo_user_id,
    1,
    false -- Public club
  )
  ON CONFLICT DO NOTHING;

  -- Add demo user as admin of Oxford club
  INSERT INTO public.club_members (club_id, user_id, role, status)
  SELECT 
    c.id,
    demo_user_id,
    'admin',
    'active'
  FROM public.clubs c
  WHERE c.name = 'Oxford University Cycling Club'
  AND c.creator_id = demo_user_id
  ON CONFLICT (club_id, user_id) DO UPDATE
  SET role = 'admin', status = 'active';

  -- Create some past activities (completed) - cycling and running only
  INSERT INTO public.activities (
    organizer_id,
    type,
    title,
    date,
    time,
    location,
    meetup_location,
    max_participants,
    special_comments,
    distance,
    distance_unit,
    elevation,
    elevation_unit
  )
  VALUES 
    (
      demo_user_id,
      'cycling',
      'Cotswolds Long Ride',
      '2025-02-15', -- Past date
      '08:00',
      'Cotswolds',
      'Burford Town Square',
      12,
      'Challenging ride through beautiful countryside',
      80,
      'km',
      1200,
      'm'
    ),
    (
      demo_user_id,
      'running',
      'Hyde Park Morning Run',
      '2025-02-10', -- Past date
      '07:00',
      'Hyde Park',
      'Hyde Park Corner',
      15,
      'Easy morning run around the park',
      10,
      'km',
      50,
      'm'
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Demo profile setup complete!';
END $$;

-- Verify the setup
SELECT 
  p.full_name,
  p.bio,
  p.location,
  (SELECT COUNT(*) FROM user_sports WHERE user_id = p.id) as sports_count,
  (SELECT COUNT(*) FROM activities WHERE organizer_id = p.id) as activities_created,
  (SELECT COUNT(*) FROM club_members WHERE user_id = p.id AND status = 'active') as clubs_joined
FROM public.profiles p
WHERE p.id = (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1);

-- Show clubs where user is admin
SELECT 
  c.name,
  c.sport_type,
  cm.role,
  c.member_count
FROM public.clubs c
JOIN public.club_members cm ON cm.club_id = c.id
WHERE cm.user_id = (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1)
AND cm.status = 'active';
