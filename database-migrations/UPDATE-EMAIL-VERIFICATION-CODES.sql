-- Migration to update existing email_verification_codes table
-- Run this if the table already exists

-- Step 1: Add invalidated column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'email_verification_codes' 
    AND column_name = 'invalidated'
  ) THEN
    ALTER TABLE email_verification_codes 
    ADD COLUMN invalidated BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Step 2: Drop expires_at column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'email_verification_codes' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE email_verification_codes 
    DROP COLUMN expires_at;
  END IF;
END $$;

-- Step 3: Drop old unique constraint if it exists
DROP INDEX IF EXISTS idx_one_active_code_per_user;

-- Step 4: Create new unique constraint for one active code per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_code_per_user 
  ON email_verification_codes(user_id) 
  WHERE verified = FALSE AND invalidated = FALSE;

-- Step 5: Update cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE (verified = TRUE OR invalidated = TRUE) 
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Mark any existing unverified codes as invalidated (optional - for clean slate)
-- Uncomment the line below if you want to invalidate all existing codes
-- UPDATE email_verification_codes SET invalidated = TRUE WHERE verified = FALSE;

COMMENT ON COLUMN email_verification_codes.invalidated IS 'True when user requests a new code';
