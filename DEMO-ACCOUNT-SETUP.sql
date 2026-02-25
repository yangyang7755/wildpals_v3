-- Demo Account Setup for Wildpals
-- Run this in Supabase SQL Editor

-- This will create a demo user account
-- Email: yangyang.ruohan.liu@gmail.com
-- Password: 123456

-- Note: You need to create this user through Supabase Authentication UI
-- Go to: Authentication → Users → Add User
-- Email: yangyang.ruohan.liu@gmail.com
-- Password: 123456
-- Auto Confirm User: YES

-- After creating the user in the UI, run this to add profile data:
-- Replace 'USER_ID_HERE' with the actual UUID from the Authentication tab

INSERT INTO public.profiles (id, email, full_name, bio, location)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID from Supabase Auth
  'yangyang.ruohan.liu@gmail.com',
  'Demo User',
  'This is a demo account for testing Wildpals',
  'London, UK'
);

-- Add demo sports
INSERT INTO public.user_sports (user_id, sport, skill_level)
VALUES 
  ('USER_ID_HERE', 'cycling', 'intermediate'),
  ('USER_ID_HERE', 'climbing', 'beginner'),
  ('USER_ID_HERE', 'running', 'advanced');

-- Add some demo activities
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
    'USER_ID_HERE',
    'cycling',
    'Sunday Morning Ride',
    '2025-03-02',
    '08:00',
    'Richmond Park',
    'Richmond Park Main Gate',
    15,
    'Casual social ride, all levels welcome',
    25,
    'km',
    150,
    'm'
  ),
  (
    'USER_ID_HERE',
    'climbing',
    'Indoor Climbing Session',
    '2025-03-05',
    '18:30',
    'The Castle Climbing Centre',
    'The Castle Climbing Centre Reception',
    8,
    'Beginner friendly bouldering session',
    null,
    null,
    null,
    null
  );
