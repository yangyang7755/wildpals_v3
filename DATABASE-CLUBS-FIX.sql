-- Fix Clubs Database Schema
-- This fixes the foreign key relationship error and removes demo data

-- 1. Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.club_members CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;

-- 2. Remove club_id from activities if it exists
ALTER TABLE public.activities DROP COLUMN IF EXISTS club_id;

-- 3. Create clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  sport_type TEXT, -- Now free text instead of enum
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  logo_url TEXT,
  is_private BOOLEAN DEFAULT true, -- true = requires approval, false = auto-join
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create club_members table with CORRECT foreign key to profiles
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  join_message TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- 5. Add club_id to activities table (optional - for club-specific activities)
ALTER TABLE public.activities 
ADD COLUMN club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;

-- 5b. Create club_chat_messages table
CREATE TABLE public.club_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on club chat
ALTER TABLE public.club_chat_messages ENABLE ROW LEVEL SECURITY;

-- Only club members can view messages
CREATE POLICY "Club members can view messages"
  ON public.club_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_chat_messages.club_id
      AND club_members.user_id = auth.uid()
      AND club_members.status = 'active'
    )
  );

-- Only club members can send messages
CREATE POLICY "Club members can send messages"
  ON public.club_chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_chat_messages.club_id
      AND club_members.user_id = auth.uid()
      AND club_members.status = 'active'
    )
  );

-- 6. Enable Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for clubs

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

-- 8. Create RLS Policies for club_members

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

-- 9. Create function to update member count
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
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9b. Create function to auto-approve for public clubs
CREATE OR REPLACE FUNCTION auto_approve_public_club()
RETURNS TRIGGER AS $$
DECLARE
  club_is_private BOOLEAN;
BEGIN
  -- Check if club is private
  SELECT is_private INTO club_is_private
  FROM public.clubs
  WHERE id = NEW.club_id;
  
  -- If club is public, auto-approve
  IF club_is_private = false THEN
    NEW.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for member count
DROP TRIGGER IF EXISTS club_member_count_trigger ON public.club_members;
CREATE TRIGGER club_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION update_club_member_count();

-- 10b. Create trigger for auto-approval
DROP TRIGGER IF EXISTS auto_approve_public_club_trigger ON public.club_members;
CREATE TRIGGER auto_approve_public_club_trigger
  BEFORE INSERT ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_public_club();

-- 11. Create indexes for performance
CREATE INDEX idx_clubs_sport_type ON public.clubs(sport_type);
CREATE INDEX idx_clubs_creator_id ON public.clubs(creator_id);
CREATE INDEX idx_club_members_club_id ON public.club_members(club_id);
CREATE INDEX idx_club_members_user_id ON public.club_members(user_id);
CREATE INDEX idx_club_members_status ON public.club_members(status);
CREATE INDEX idx_activities_club_id ON public.activities(club_id);
CREATE INDEX idx_club_chat_messages_club_id ON public.club_chat_messages(club_id);
CREATE INDEX idx_club_chat_messages_created_at ON public.club_chat_messages(created_at);

-- Done! No demo data inserted - you can create your own clubs now.
