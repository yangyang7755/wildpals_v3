-- ============================================
-- CLERK MIGRATION: Fix all database issues
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. Drop foreign key from profiles to auth.users (Clerk doesn't use auth.users)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Add clerk_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);

-- 3. Change pace column from numeric to text (supports "30+", "28-30", "4:30-5:00")
ALTER TABLE activities ALTER COLUMN pace TYPE TEXT USING pace::TEXT;

-- 4. Drop and recreate check constraints with NULL support
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_climbing_type_check;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_road_surface_check;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_running_terrain_check;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_activity_type_check;

ALTER TABLE activities ADD CONSTRAINT activities_type_check 
  CHECK (type IN ('cycling', 'climbing', 'running', 'social'));

ALTER TABLE activities ADD CONSTRAINT activities_climbing_type_check 
  CHECK (climbing_type IS NULL OR climbing_type IN ('indoor_bouldering', 'indoor_top_rope', 'indoor_lead_climbing', 'outdoor_climbing'));

ALTER TABLE activities ADD CONSTRAINT activities_road_surface_check 
  CHECK (road_surface IS NULL OR road_surface IN ('road', 'gravel', 'mtb', 'track', 'social'));

ALTER TABLE activities ADD CONSTRAINT activities_running_terrain_check 
  CHECK (running_terrain IS NULL OR running_terrain IN ('road', 'trail', 'track', 'mixed'));

ALTER TABLE activities ADD CONSTRAINT activities_activity_type_check 
  CHECK (activity_type IS NULL OR activity_type IN ('one_off', 'recurrent', 'multi_day'));

-- 5. Drop auto-create profile trigger (we create profiles from the app now)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 6. Open up RLS policies for Clerk (anon key, no Supabase auth session)
-- PROFILES
DROP POLICY IF EXISTS "Allow insert for clerk users" ON profiles;
DROP POLICY IF EXISTS "Allow update for clerk users" ON profiles;
DROP POLICY IF EXISTS "Allow read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (true);

-- ACTIVITIES
DROP POLICY IF EXISTS "Allow read activities" ON activities;
DROP POLICY IF EXISTS "Allow insert activities" ON activities;
DROP POLICY IF EXISTS "Allow update activities" ON activities;
DROP POLICY IF EXISTS "Allow delete activities" ON activities;
DROP POLICY IF EXISTS "Anyone can view activities" ON activities;
DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;

CREATE POLICY "activities_select" ON activities FOR SELECT USING (true);
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (true);
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (true);

-- JOIN REQUESTS
DROP POLICY IF EXISTS "Allow read join_requests" ON join_requests;
DROP POLICY IF EXISTS "Allow insert join_requests" ON join_requests;
DROP POLICY IF EXISTS "Allow update join_requests" ON join_requests;
DROP POLICY IF EXISTS "Allow delete join_requests" ON join_requests;
DROP POLICY IF EXISTS "Users can view join requests" ON join_requests;
DROP POLICY IF EXISTS "Users can create join requests" ON join_requests;
DROP POLICY IF EXISTS "Users can update join requests" ON join_requests;
DROP POLICY IF EXISTS "Users can delete join requests" ON join_requests;

CREATE POLICY "join_requests_select" ON join_requests FOR SELECT USING (true);
CREATE POLICY "join_requests_insert" ON join_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "join_requests_update" ON join_requests FOR UPDATE USING (true);
CREATE POLICY "join_requests_delete" ON join_requests FOR DELETE USING (true);

-- CLUBS
DROP POLICY IF EXISTS "Allow read clubs" ON clubs;
DROP POLICY IF EXISTS "Allow insert clubs" ON clubs;
DROP POLICY IF EXISTS "Allow update clubs" ON clubs;
DROP POLICY IF EXISTS "Allow delete clubs" ON clubs;

CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (true);
CREATE POLICY "clubs_insert" ON clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "clubs_update" ON clubs FOR UPDATE USING (true);
CREATE POLICY "clubs_delete" ON clubs FOR DELETE USING (true);

-- CLUB MEMBERS
DROP POLICY IF EXISTS "Allow read club_members" ON club_members;
DROP POLICY IF EXISTS "Allow insert club_members" ON club_members;
DROP POLICY IF EXISTS "Allow update club_members" ON club_members;
DROP POLICY IF EXISTS "Allow delete club_members" ON club_members;

CREATE POLICY "club_members_select" ON club_members FOR SELECT USING (true);
CREATE POLICY "club_members_insert" ON club_members FOR INSERT WITH CHECK (true);
CREATE POLICY "club_members_update" ON club_members FOR UPDATE USING (true);
CREATE POLICY "club_members_delete" ON club_members FOR DELETE USING (true);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Allow read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow update notifications" ON notifications;

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (true);

-- MESSAGES (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow read messages" ON messages';
    EXECUTE 'DROP POLICY IF EXISTS "Allow insert messages" ON messages';
    EXECUTE 'CREATE POLICY "messages_select" ON messages FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Done!
SELECT 'Clerk migration complete!' as status;
