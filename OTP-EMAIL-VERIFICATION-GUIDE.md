# OTP Email Verification Implementation Guide

## Overview
Replaced link-based email verification with a 4-digit OTP (One-Time Password) code system for better mobile UX.

## Features Implemented

### 1. 4-Digit Verification Code
- User-friendly OTP input with 4 separate boxes
- Auto-focus next input as user types
- Auto-verify when all 4 digits entered
- Visual feedback (green border when filled)

### 2. Code Generation & Storage
- Random 4-digit codes (1000-9999)
- Stored in database with expiration (15 minutes)
- Tracks failed attempts (max 5)
- Secure verification process

### 3. Email Delivery
- Code sent via email instead of verification link
- Resend functionality with 60-second cooldown
- Clean, simple email format

## Files Created

### 1. Database Schema
**database-migrations/CREATE-EMAIL-VERIFICATION-CODES.sql**
- Creates `email_verification_codes` table
- Stores codes with expiration and attempt tracking
- RLS policies for security
- Cleanup function for expired codes

**database-migrations/CREATE-CONFIRM-EMAIL-FUNCTION.sql**
- Database function to confirm user email
- Updates `auth.users.email_confirmed_at`
- Requires elevated privileges (SECURITY DEFINER)

### 2. Service Layer
**native/services/VerificationCodeService.ts**
- `generateCode()` - Creates random 4-digit code
- `createVerificationCode()` - Stores code in database
- `verifyCode()` - Validates user input
- `resendCode()` - Invalidates old code and creates new one
- `sendVerificationEmail()` - Sends code via email

### 3. UI Components
**native/screens/EmailVerification.tsx** (Rewritten)
- 4 separate input boxes for OTP
- Auto-focus and auto-advance
- Backspace navigation
- Resend with countdown timer
- Clean, modern UI

## Files Modified

### 1. SignUp Screen
**native/screens/SignUp.tsx**
- Generates verification code after signup
- Sends code via email
- Passes `userId` to EmailVerification screen
- Logs code to console (for development)

### 2. Auth Context
**native/contexts/AuthContext.tsx**
- Added import for VerificationCodeService
- Ready for future enhancements

## Installation Steps

### 1. Run Database Migrations

Execute in Supabase SQL Editor:

```sql
-- Step 1: Create verification codes table
-- From: database-migrations/CREATE-EMAIL-VERIFICATION-CODES.sql
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0
);

-- Add indexes and RLS policies (see full file)

-- Step 2: Create email confirmation function
-- From: database-migrations/CREATE-CONFIRM-EMAIL-FUNCTION.sql
CREATE OR REPLACE FUNCTION confirm_user_email(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id AND email_confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Disable Supabase Built-in Email Verification

In Supabase Dashboard:
1. Go to Authentication → Email Templates
2. Disable "Confirm signup" email template
3. Or set "Confirm email" to OFF in Authentication settings

### 3. Configure Email Service (Production)

Update `VerificationCodeService.sendVerificationEmail()` to use your email provider:

**Option A: Resend (Recommended)**
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Wildpals <noreply@wildpals.app>',
  to: email,
  subject: 'Your Wildpals Verification Code',
  html: `
    <h2>Welcome to Wildpals!</h2>
    <p>Your verification code is:</p>
    <h1 style="font-size: 48px; letter-spacing: 8px;">${code}</h1>
    <p>This code expires in 15 minutes.</p>
  `,
});
```

**Option B: SendGrid, Mailgun, etc.**
- Similar integration pattern
- Use your preferred email service

### 4. Test the Flow

1. Sign up with a new account
2. Check console for verification code (development)
3. Enter the 4-digit code
4. Verify email confirmation works
5. Test resend functionality
6. Test expired code handling

## User Flow

### Signup Process
1. User fills signup form
2. Account created in Supabase
3. 4-digit code generated and stored
4. Code sent via email
5. User navigates to EmailVerification screen

### Verification Process
1. User enters 4-digit code
2. Code validated against database
3. Checks: expiration, attempts, correctness
4. On success: email confirmed, navigate to ProfileSetup
5. On failure: show error, allow retry

### Resend Flow
1. User taps "Resend Code"
2. Old codes invalidated
3. New code generated and sent
4. 60-second cooldown starts

## Security Features

### Code Expiration
- Codes expire after 15 minutes
- Expired codes cannot be used
- Automatic cleanup of old codes

### Attempt Limiting
- Maximum 5 failed attempts per code
- Prevents brute force attacks
- User must request new code after limit

### Database Security
- RLS policies restrict access
- Users can only view/update own codes
- Email confirmation requires elevated privileges

## Development vs Production

### Development
- Code logged to console for testing
- No actual email sent (optional)
- Easy debugging

### Production
- Integrate real email service
- Remove console.log statements
- Monitor failed attempts
- Set up email templates

## Troubleshooting

### Code Not Received
1. Check spam folder
2. Verify email service is configured
3. Check Supabase logs
4. Use resend functionality

### Code Invalid
1. Check if code expired (15 min)
2. Verify correct code entered
3. Check attempt count (max 5)
4. Request new code

### Database Errors
1. Verify migrations ran successfully
2. Check RLS policies
3. Confirm function permissions
4. Review Supabase logs

## Future Enhancements

### Email Templates
- Branded HTML emails
- Multiple languages
- Better formatting

### SMS Verification
- Add phone number verification
- SMS OTP as alternative
- Two-factor authentication

### Rate Limiting
- Limit resend requests
- Prevent abuse
- IP-based throttling

### Analytics
- Track verification success rate
- Monitor failed attempts
- Identify issues

## Benefits Over Link-Based Verification

1. **Better Mobile UX**: No need to switch apps or open browser
2. **Faster**: Type 4 digits vs clicking link and waiting
3. **More Reliable**: No broken links or redirect issues
4. **Clearer**: Users know exactly what to do
5. **Professional**: Modern apps use OTP codes

## Notes

- Codes are case-insensitive (numbers only)
- Each user can have multiple codes (only latest is valid)
- Verified codes are kept for audit trail
- Cleanup function should run periodically (cron job)

