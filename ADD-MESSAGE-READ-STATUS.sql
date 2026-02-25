-- Add read tracking for chat messages
-- This allows users to see which messages they haven't read yet

-- Create a table to track which messages each user has read
CREATE TABLE IF NOT EXISTS message_read_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_message_read_status_user ON message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_message ON message_read_status(message_id);

-- Enable RLS
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own read status
CREATE POLICY "Users can view their own read status"
  ON message_read_status FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own read status
CREATE POLICY "Users can mark messages as read"
  ON message_read_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own read status
CREATE POLICY "Users can update their read status"
  ON message_read_status FOR UPDATE
  USING (auth.uid() = user_id);
