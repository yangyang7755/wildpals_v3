-- Fix RLS policies for email_verification_codes table
-- Allow unauthenticated users to insert verification codes during signup

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Users can update own verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Allow insert for signup" ON email_verification_codes;

-- Allow anyone to insert verification codes (needed during signup before session exists)
CREATE POLICY "Allow insert for signup"
  ON email_verification_codes
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own verification codes (when authenticated)
CREATE POLICY "Users can view own verification codes"
  ON email_verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own verification codes (for attempts tracking)
CREATE POLICY "Users can update own verification codes"
  ON email_verification_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to update their own codes even without session (for verification)
CREATE POLICY "Allow update for verification"
  ON email_verification_codes
  FOR UPDATE
  WITH CHECK (true);

COMMENT ON POLICY "Allow insert for signup" ON email_verification_codes IS 'Allows creating verification codes during signup before session exists';
COMMENT ON POLICY "Allow update for verification" ON email_verification_codes IS 'Allows updating codes during verification process';
