-- Verify and Fix Missing Tables
-- Run this in Supabase SQL Editor

-- 1. Check if club_chat_messages table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'club_chat_messages'
    ) THEN
        RAISE NOTICE 'club_chat_messages table does NOT exist - will create it';
    ELSE
        RAISE NOTICE 'club_chat_messages table exists';
    END IF;
END $$;

-- 2. Create club_chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.club_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on club chat
ALTER TABLE public.club_chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Club members can view messages" ON public.club_chat_messages;
DROP POLICY IF EXISTS "Club members can send messages" ON public.club_chat_messages;

-- 5. Create RLS policies for club chat

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

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_club_chat_messages_club_id ON public.club_chat_messages(club_id);
CREATE INDEX IF NOT EXISTS idx_club_chat_messages_created_at ON public.club_chat_messages(created_at);

-- 7. Verify the table was created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'club_chat_messages') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'club_chat_messages';

-- Done! The club_chat_messages table should now exist.
