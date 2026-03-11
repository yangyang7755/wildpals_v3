-- Delete specific test users and all their related data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/sql/new

DO $$
DECLARE
  user_record RECORD;
  emails_to_delete TEXT[] := ARRAY[
    'yangyang.ruohan.liu@gmail.com',
    'spet5872@ox.ac.uk',
    'l.tao0866@gmail.com'
  ];
BEGIN
  FOR user_record IN 
    SELECT id, email FROM auth.users 
    WHERE email = ANY(emails_to_delete)
  LOOP
    RAISE NOTICE 'Deleting user: %', user_record.email;
    
    -- Delete related data (only tables that exist and have correct columns)
    DELETE FROM join_requests WHERE requester_id = user_record.id;
    DELETE FROM activities WHERE organizer_id = user_record.id;
    DELETE FROM club_members WHERE user_id = user_record.id;
    DELETE FROM notifications WHERE user_id = user_record.id;
    DELETE FROM profiles WHERE id = user_record.id;
    
    -- Delete the auth user
    DELETE FROM auth.users WHERE id = user_record.id;
    
    RAISE NOTICE 'User deleted: %', user_record.email;
  END LOOP;
  
  RAISE NOTICE 'All specified users deleted successfully';
END $$;
