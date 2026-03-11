# Fix "Error sending confirmation email"

## Problem
Users get error: "SignUp error: Error sending confirmation email"

## Root Cause
Supabase's email confirmation system is not properly configured. This happens when:
1. SMTP settings are incorrect or incomplete
2. "Confirm email" is enabled but email provider isn't set up
3. Email rate limits are hit
4. Email template has errors

## Solution

### Option 1: Disable Email Confirmation (Quick Fix - Recommended for Testing)

**Go to Supabase Dashboard:**
https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/providers

**Settings:**
1. Navigate to: Authentication → Providers → Email
2. Find: "Confirm email"
3. **Toggle OFF** (disable)
4. Save changes

**What this does:**
- Users are auto-verified on signup
- No email confirmation required
- Users can login immediately
- Good for testing, but not recommended for production

### Option 2: Fix SMTP Configuration (Production Solution)

**Go to Supabase Dashboard:**
https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/smtp

**Configure SMTP with Resend:**

1. **Enable Custom SMTP**: Toggle ON
2. **Sender email**: `onboarding@resend.dev`
3. **Sender name**: `Wildpals`
4. **Host**: `smtp.resend.com`
5. **Port**: `587`
6. **Username**: `resend`
7. **Password**: `re_EAuqw3Ms_McqnFSuxYmKC61ivAZMD6RnY` (your Resend API key)
8. **Enable TLS**: Toggle ON
9. Click "Save"

**Test SMTP:**
After saving, click "Send test email" to verify it works.

### Option 3: Use Supabase's Built-in Email (Easiest)

**If you don't want to configure SMTP:**

1. Go to: Authentication → Providers → Email
2. Make sure "Confirm email" is **ENABLED**
3. Don't configure custom SMTP (leave it disabled)
4. Supabase will use their built-in email service

**Note:** Supabase's built-in email has limitations:
- Limited to 3 emails per hour per user
- May be marked as spam
- Not suitable for production

## Verify Configuration

After choosing an option, test signup:

1. Delete any test accounts
2. Sign up with a new email
3. Check for errors
4. If Option 1 (disabled): User should be logged in immediately
5. If Option 2/3 (enabled): User should receive verification email

## Current Configuration Check

**Check these settings in Supabase Dashboard:**

### 1. Email Provider Settings
- Path: Authentication → Providers → Email
- "Confirm email" status: ?
- "Secure email change" status: ?

### 2. SMTP Settings
- Path: Authentication → SMTP Settings
- Custom SMTP enabled: ?
- Host configured: ?
- Credentials set: ?

### 3. Email Templates
- Path: Authentication → Email Templates
- "Confirm signup" template exists: ?
- Template has valid variables: ?

### 4. URL Configuration
- Path: Authentication → URL Configuration
- Site URL: Should be `https://xikaltnufqbysnrsjzwa.supabase.co`
- Redirect URLs: Should include `wildpals://email-verified`

## Recommended Approach

**For immediate testing:**
1. Disable "Confirm email" (Option 1)
2. Test signup flow works
3. Users can access app immediately

**For production:**
1. Configure SMTP with Resend (Option 2)
2. Enable "Confirm email"
3. Update email templates
4. Test complete flow

## Troubleshooting

### Error persists after disabling confirmation?
- Clear app cache and restart
- Check Supabase logs for detailed error
- Verify no RLS policies blocking user creation

### SMTP test email fails?
- Verify Resend API key is correct
- Check Resend dashboard for errors
- Ensure sender email is verified in Resend

### Emails not received?
- Check spam folder
- Verify email template is correct
- Check Supabase logs for send status
- Verify rate limits not exceeded

## Quick Test Command

To check if user was created despite error:

```sql
-- Run in Supabase SQL Editor
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

If user exists but `email_confirmed_at` is NULL, the account was created but email failed to send.
