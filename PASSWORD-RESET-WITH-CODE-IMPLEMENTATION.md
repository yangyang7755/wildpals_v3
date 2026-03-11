# Password Reset with Verification Code Implementation

## Overview
Implemented a secure password reset flow using 4-digit verification codes sent via email, similar to the email verification system.

## Database Setup

### 1. Create the password_reset_codes table
Execute `database-migrations/CREATE-PASSWORD-RESET-CODES.sql` in Supabase SQL Editor:

```sql
-- Creates table with columns: id, user_id, email, code, created_at, verified, attempts, invalidated
-- Includes RLS policies to allow operations without authentication
-- Max 5 attempts per code
-- Only one active code per user at a time
```

## Flow

### Step 1: Request Password Reset (ForgotPassword screen)
1. User enters their email
2. System generates 4-digit code
3. Code is stored in `password_reset_codes` table
4. Email sent with verification code
5. User navigates to ResetPassword screen

### Step 2: Verify Code & Reset Password (ResetPassword screen)
1. User enters 4-digit code from email
2. System verifies the code
3. If valid, user enters new password twice
4. Password is updated in Supabase Auth
5. All reset codes for user are invalidated
6. User redirected to login

## Files Created

1. **database-migrations/CREATE-PASSWORD-RESET-CODES.sql**
   - Database table for storing reset codes
   - RLS policies for security

2. **native/services/PasswordResetService.ts**
   - `generateCode()` - Creates random 4-digit code
   - `createResetCode(email)` - Stores code in database
   - `verifyResetCode(email, code)` - Validates the code
   - `sendResetCodeEmail(email, code)` - Sends email via edge function
   - `resetPassword(userId, newPassword)` - Updates password

3. **supabase/functions/send-password-reset-code/index.ts** (needs to be created)
   - Edge function to send reset code emails
   - Similar to send-verification-code function

## Security Features

- Codes are 4 digits (1000-9999)
- Max 5 failed attempts per code
- Only one active code per user
- Codes don't expire unless user requests new one
- 60-second cooldown before resend
- Previous code invalidated when new one requested
- All codes invalidated after successful password reset

## Next Steps

### 1. Execute SQL
Run `database-migrations/CREATE-PASSWORD-RESET-CODES.sql` in Supabase

### 2. Update ForgotPassword Screen
- Add logic to call `PasswordResetService.createResetCode()`
- Navigate to ResetPassword with email parameter

### 3. Update ResetPassword Screen
- Add 4-digit code input (similar to EmailVerification)
- Add new password fields (password + confirm)
- Verify code before allowing password reset
- Call `PasswordResetService.resetPassword()`

### 4. Create Edge Function (Optional for production)
Create `supabase/functions/send-password-reset-code/index.ts`:
- Similar to send-verification-code
- Email template with 4-digit code
- Deploy with: `supabase functions deploy send-password-reset-code`

### 5. For Development
The service logs codes to console as fallback when email fails

## Email Template (for edge function)

Subject: "Reset Your WildPals Password"

Content:
- "You requested to reset your password"
- Large 4-digit code display
- "Enter this code in the app to reset your password"
- "This code will remain valid until you request a new one"
- Security tip about not sharing the code

## Testing

1. Go to ForgotPassword screen
2. Enter email address
3. Check console for 4-digit code (development)
4. Enter code in ResetPassword screen
5. Enter new password twice
6. Verify password was updated by logging in

## Notes

- Similar implementation to email verification
- Reuses same patterns and security measures
- Edge function deployment optional (works with console logs for dev)
- Can be extended to add expiration time if needed
