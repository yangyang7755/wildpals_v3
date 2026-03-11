-- Create table for email verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  invalidated BOOLEAN DEFAULT FALSE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON email_verification_codes(code);

-- Add unique constraint to ensure only one active code per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_code_per_user 
  ON email_verification_codes(user_id) 
  WHERE verified = FALSE AND invalidated = FALSE;

-- Add RLS policies
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can only read their own verification codes
CREATE POLICY "Users can view own verification codes"
  ON email_verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own verification codes (for attempts)
CREATE POLICY "Users can update own verification codes"
  ON email_verification_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to clean up old verified/invalidated codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE (verified = TRUE OR invalidated = TRUE) 
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_old_verification_codes() TO authenticated;

COMMENT ON TABLE email_verification_codes IS 'Stores email verification codes for user signup';
COMMENT ON COLUMN email_verification_codes.code IS '4-digit verification code';
COMMENT ON COLUMN email_verification_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN email_verification_codes.invalidated IS 'True when user requests a new code';

