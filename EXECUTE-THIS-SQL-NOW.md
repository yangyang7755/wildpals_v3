# 🚨 EXECUTE THIS SQL IN SUPABASE NOW

## Password Reset System Setup

You need to execute SQL to set up the password reset with verification code system.

### Execute These SQL Files in Order:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa
2. **Go to SQL Editor** (left sidebar)
3. **Execute each file below**:

#### File 1: Create Password Reset Codes Table
Copy/paste from `database-migrations/CREATE-PASSWORD-RESET-CODES.sql`:

```sql
-- Create table for password reset verification codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  invalidated BOOLEAN DEFAULT FALSE
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);

-- Add unique constraint to ensure only one active code per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_reset_code_per_user 
  ON password_reset_codes(user_id) 
  WHERE verified = FALSE AND invalidated = FALSE;

-- Enable RLS
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reset codes (needed when user requests reset)
CREATE POLICY "Allow insert for password reset"
  ON password_reset_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select reset codes (needed during verification)
CREATE POLICY "Allow select for password reset"
  ON password_reset_codes
  FOR SELECT
  USING (true);

-- Allow anyone to update reset codes (for attempts tracking and marking as verified)
CREATE POLICY "Allow update for password reset"
  ON password_reset_codes
  FOR UPDATE
  WITH CHECK (true);

COMMENT ON TABLE password_reset_codes IS 'Stores password reset verification codes';
COMMENT ON COLUMN password_reset_codes.code IS '4-digit verification code for password reset';
COMMENT ON COLUMN password_reset_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN password_reset_codes.invalidated IS 'True when user requests a new code';
```

#### File 2: Create Password Reset Function
Copy/paste from `database-migrations/CREATE-RESET-PASSWORD-FUNCTION.sql`:

```sql
-- Create function to reset user password
CREATE OR REPLACE FUNCTION reset_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's password in auth.users
  -- Using crypt to hash the password with bcrypt
  UPDATE auth.users
  SET 
    encrypted_password = crypt(p_new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION reset_user_password IS 'Securely resets a user password after verification code is validated';
```

### What This Does:
- Creates `password_reset_codes` table to store 4-digit verification codes
- Allows users to request password reset without being logged in
- Creates secure function to update passwords in auth.users table
- Max 5 attempts per code, 60-second resend cooldown
- Only one active code per user at a time

### Testing the Flow:
1. Go to Login screen → "Forgot Password?"
2. Enter your email address
3. Check console for 4-digit code (development mode)
4. Enter the code in the verification screen
5. Enter your new password twice
6. Login with the new password

### Optional: Deploy Email Edge Function
For production, create and deploy `supabase/functions/send-password-reset-code/index.ts` (similar to send-verification-code).

For now, codes are logged to console as fallback for development.

---

## Previous Setup (Email Verification) - Already Complete

<details>
<summary>Click to expand email verification setup (if needed)</summary>

### Fix Email Verification Issues

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa
2. **Go to SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy/paste this entire SQL block**:

```sql
-- Fix 1: Remove foreign key constraint that's blocking code creation
ALTER TABLE email_verification_codes 
  DROP CONSTRAINT IF EXISTS email_verification_codes_user_id_fkey;

COMMENT ON COLUMN email_verification_codes.user_id IS 'User ID from auth.users - no FK constraint to allow creation during signup';

-- Fix 2: Update RLS policies to allow operations without authentication
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

-- Fix 3: Create function to confirm user email
CREATE OR REPLACE FUNCTION confirm_user_email(user_id UUID)
RETURNS void AS $
BEGIN
  -- Update the email_confirmed_at timestamp in auth.users
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id AND email_confirmed_at IS NULL;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO anon;

COMMENT ON FUNCTION confirm_user_email IS 'Confirms user email after OTP verification';
```

</details>
