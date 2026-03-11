-- Fix foreign key constraint issue for email_verification_codes
-- The foreign key to auth.users causes issues because we create codes before user session exists
-- We'll remove the foreign key but keep the user_id column for reference

-- Drop the foreign key constraint
ALTER TABLE email_verification_codes 
  DROP CONSTRAINT IF EXISTS email_verification_codes_user_id_fkey;

-- Keep the user_id column but without the foreign key constraint
-- This allows us to store verification codes even if the user hasn't fully completed signup
-- The user_id will still be valid - it comes from auth.signUp() response

-- Add a comment explaining why there's no foreign key
COMMENT ON COLUMN email_verification_codes.user_id IS 'User ID from auth.users - no FK constraint to allow creation during signup';

-- Fix RLS policies to allow operations without authentication
-- This is necessary because verification happens before the user has a session

DROP POLICY IF EXISTS "Users can view own verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Users can update own verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Allow insert for signup" ON email_verification_codes;
DROP POLICY IF EXISTS "Allow update for verification" ON email_verification_codes;
DROP POLICY IF EXISTS "Allow select for verification" ON email_verification_codes;

-- Allow anyone to insert verification codes (needed during signup)
CREATE POLICY "Allow insert for signup"
  ON email_verification_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select verification codes (needed during verification before session exists)
CREATE POLICY "Allow select for verification"
  ON email_verification_codes
  FOR SELECT
  USING (true);

-- Allow anyone to update verification codes (for attempts tracking and marking as verified)
CREATE POLICY "Allow update for verification"
  ON email_verification_codes
  FOR UPDATE
  WITH CHECK (true);

COMMENT ON POLICY "Allow insert for signup" ON email_verification_codes IS 'Allows creating verification codes during signup before session exists';
COMMENT ON POLICY "Allow select for verification" ON email_verification_codes IS 'Allows reading codes during verification before session exists';
COMMENT ON POLICY "Allow update for verification" ON email_verification_codes IS 'Allows updating codes during verification process';

-- Verification: Check the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'email_verification_codes'
ORDER BY ordinal_position;
