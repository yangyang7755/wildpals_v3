-- User Blocking and Reporting System
-- Required for Apple App Store approval

-- ============================================
-- 1. USER BLOCKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_created ON user_blocks(created_at DESC);

-- ============================================
-- 2. USER REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('user_behavior', 'message_content', 'activity_content')),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  message_id UUID,
  chat_type VARCHAR(20) CHECK (chat_type IN ('club', 'activity')),
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  deleted_user_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_message_report CHECK (
    (report_type = 'message_content' AND message_id IS NOT NULL AND chat_type IS NOT NULL) OR
    (report_type != 'message_content' AND message_id IS NULL AND chat_type IS NULL)
  ),
  CONSTRAINT valid_activity_report CHECK (
    (report_type = 'activity_content' AND activity_id IS NOT NULL) OR
    (report_type != 'activity_content' AND activity_id IS NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_type ON user_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_user_reports_activity ON user_reports(activity_id) WHERE activity_id IS NOT NULL;

-- ============================================
-- 3. PROFANITY FILTER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profanity_filter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(100) NOT NULL UNIQUE,
  pattern VARCHAR(200),
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profanity_filter_active ON profanity_filter(active) WHERE active = TRUE;

-- Seed with basic profanity filter
INSERT INTO profanity_filter (word, severity) VALUES
  ('fuck', 'high'),
  ('shit', 'medium'),
  ('damn', 'low'),
  ('ass', 'medium'),
  ('bitch', 'high'),
  ('bastard', 'medium'),
  ('crap', 'low'),
  ('piss', 'medium')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- 4. ROW-LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on user_blocks
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocks (where they are the blocker)
CREATE POLICY "Users can view own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Enable RLS on user_reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own submitted reports
CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Enable RLS on profanity_filter (read-only for all authenticated users)
ALTER TABLE profanity_filter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profanity filter"
  ON profanity_filter FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to check if a user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get blocked user IDs for a user (bidirectional)
CREATE OR REPLACE FUNCTION get_blocked_user_ids(user_id UUID)
RETURNS TABLE(blocked_user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT blocked_id FROM user_blocks WHERE blocker_id = user_id
  UNION
  SELECT blocker_id FROM user_blocks WHERE blocked_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT 'user_blocks' as table_name, COUNT(*) as row_count FROM user_blocks
UNION ALL
SELECT 'user_reports', COUNT(*) FROM user_reports
UNION ALL
SELECT 'profanity_filter', COUNT(*) FROM profanity_filter;
