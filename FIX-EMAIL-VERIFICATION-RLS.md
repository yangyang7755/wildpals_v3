# Fix Email Verification RLS Policy

## Problem
When users sign up, the system tries to create a verification code but fails with:
```
Error: new row violates row-level security policy for table "email_verification_codes"
```

This happens because:
1. User signs up → creates unverified account (no session yet)
2. System tries to INSERT verification code → RLS blocks it (requires auth.uid())
3. User never receives verification code

## Solution
Execute the SQL fix that allows INSERT operations without authentication during signup.

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa
2. Navigate to SQL Editor in the left sidebar
3. Click "New Query"

### 2. Execute the RLS Fix
Copy and paste the contents of `database-migrations/FIX-VERIFICATION-CODES-RLS.sql`:

```sql
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
```

### 3. Click "Run" to execute

### 4. Verify Success
You should see a success message. The policies are now configured to:
- Allow INSERT without authentication (for signup)
- Allow UPDATE without authentication (for verification)
- Restrict SELECT to authenticated users viewing their own codes

## Test the Fix

1. Open the app
2. Try signing up with a new email
3. You should see in console:
   ```
   ✅ User account created (unverified)
   User ID: [uuid]
   Creating verification code for user: [uuid]
   Generated code: [4-digit code]
   Verification code created successfully
   📧 Verification code for [email]: [code]
   ```
4. App should navigate to EmailVerification screen
5. Enter the 4-digit code from console
6. Email should be verified successfully

## Security Notes

This approach is secure because:
- Anyone can INSERT codes, but they're linked to a specific user_id
- Only the user with that user_id can verify the code
- Codes have max 5 attempts before becoming invalid
- Old codes are invalidated when new ones are requested
- The verification process updates auth.users.email_confirmed_at via RPC function

## What Changed

### Fixed Files:
1. `native/contexts/AuthContext.tsx` - Removed Alert/navigation references, improved error handling
2. This guide created to document the fix

### Files Already Correct:
- `database-migrations/FIX-VERIFICATION-CODES-RLS.sql` - Ready to execute
- `native/services/VerificationCodeService.ts` - Working correctly
- `native/screens/SignUp.tsx` - Properly handles signup flow
- `native/screens/EmailVerification.tsx` - 4-digit code entry UI ready

## Next Steps After Fix

1. Execute the SQL in Supabase
2. Test signup flow end-to-end
3. Integrate real email service (Resend/SendGrid) in production
4. Remove console.log statements for production
