-- Clubs Feature Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  sport_type TEXT CHECK (sport_type IN ('cycling', 'climbing', 'running', 'mixed')),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create club_members table (junction table)
CREATE TABLE IF NOT EXISTS public.club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  join_message TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- 3. Add club_id to activities table (optional - for club-specific activities)
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for clubs

-- Anyone can view clubs
CREATE POLICY "Clubs are viewable by everyone"
  ON public.clubs FOR SELECT
  USING (true);

-- Authenticated users can create clubs
CREATE POLICY "Authenticated users can create clubs"
  ON public.clubs FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Club creators can update their clubs
CREATE POLICY "Club creators can update their clubs"
  ON public.clubs FOR UPDATE
  USING (auth.uid() = creator_id);

-- Club creators can delete their clubs
CREATE POLICY "Club creators can delete their clubs"
  ON public.clubs FOR DELETE
  USING (auth.uid() = creator_id);

-- 6. Create RLS Policies for club_members

-- Anyone can view club members
CREATE POLICY "Club members are viewable by everyone"
  ON public.club_members FOR SELECT
  USING (true);

-- Authenticated users can request to join clubs
CREATE POLICY "Users can request to join clubs"
  ON public.club_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Club admins can update member status
CREATE POLICY "Club admins can update member status"
  ON public.club_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = club_members.club_id
      AND clubs.creator_id = auth.uid()
    )
  );

-- Users can leave clubs (delete their membership)
CREATE POLICY "Users can leave clubs"
  ON public.club_members FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create function to update member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.clubs
    SET member_count = member_count + 1
    WHERE id = NEW.club_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active' THEN
    UPDATE public.clubs
    SET member_count = member_count + 1
    WHERE id = NEW.club_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE public.clubs
    SET member_count = member_count - 1
    WHERE id = NEW.club_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.clubs
    SET member_count = member_count - 1
    WHERE id = OLD.club_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for member count
DROP TRIGGER IF EXISTS club_member_count_trigger ON public.club_members;
CREATE TRIGGER club_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION update_club_member_count();

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clubs_sport_type ON public.clubs(sport_type);
CREATE INDEX IF NOT EXISTS idx_clubs_creator_id ON public.clubs(creator_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON public.club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_status ON public.club_members(status);
CREATE INDEX IF NOT EXISTS idx_activities_club_id ON public.activities(club_id);

-- 10. Insert demo clubs
INSERT INTO public.clubs (name, description, location, sport_type, creator_id, member_count)
VALUES 
  (
    'London Cycling Club',
    'A friendly cycling club for all levels. Join us for weekend rides around London and Surrey Hills.',
    'London, UK',
    'cycling',
    (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1),
    1
  ),
  (
    'Urban Climbers',
    'Indoor and outdoor climbing community. We meet weekly at various climbing gyms across the city.',
    'London, UK',
    'climbing',
    (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1),
    1
  ),
  (
    'Morning Runners',
    'Early morning running group. We meet at 6am for 5-10km runs through the park.',
    'London, UK',
    'running',
    (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1),
    1
  );

-- 11. Add demo user as admin member of demo clubs
INSERT INTO public.club_members (club_id, user_id, role, status)
SELECT 
  clubs.id,
  (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1),
  'admin',
  'active'
FROM public.clubs
WHERE creator_id = (SELECT id FROM auth.users WHERE email = 'yangyang.ruohan.liu@gmail.com' LIMIT 1);
