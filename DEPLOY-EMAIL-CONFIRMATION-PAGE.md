# Deploy Email Confirmation Page

## What This Does

Creates a simple confirmation page that shows "Email Verified! Opening app..." when users click verification links. This provides visual feedback instead of a blank page.

## Step 1: Deploy the Edge Function

Run this command to deploy the confirmation page:

```bash
supabase functions deploy email-verified
```

This deploys the function to: `https://xikaltnufqbysnrsjzwa.supabase.co/functions/v1/email-verified`

## Step 2: Update Email Templates

### Email Verification Template

Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/templates

Select: **Confirm signup**

Use the template from `EMAIL-VERIFICATION-QUICK-FIX.md`

Key change: `redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=signup`

### Password Reset Template

Select: **Reset Password**

Use the template from `PASSWORD-RESET-SETUP.md`

Key change: `redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=recovery`

## Step 3: Test

### Test Email Verification
1. Sign up with a new email
2. Click verification link
3. See: "Email Verified! Opening app..."
4. App opens ProfileSetup

### Test Password Reset
1. Tap "Forgot Password?"
2. Enter email
3. Click reset link in email
4. See: "Password Reset Link Verified! Opening app..."
5. App opens ResetPassword screen

## How It Works

```
Email link clicked
  ↓
Supabase verifies token
  ↓
Redirects to: /functions/v1/email-verified?type=signup (or recovery)
  ↓
Confirmation page shows with animation
  ↓
After 2 seconds, redirects to: wildpals://email-verified (or reset-password)
  ↓
App opens
```

## The Confirmation Page Features

- ✅ Shows success icon (✅ for email, 🔐 for password)
- ✅ Clear message: "Email Verified!" or "Password Reset Link Verified"
- ✅ Animated spinner
- ✅ "Open Wildpals App" button
- ✅ Auto-redirects after 2 seconds
- ✅ Fallback if auto-redirect fails
- ✅ Mobile-responsive design
- ✅ Branded with Wildpals colors

## Troubleshooting

### Function not deploying?
Make sure you're logged in to Supabase CLI:
```bash
supabase login
supabase link --project-ref xikaltnufqbysnrsjzwa
```

### Page not showing?
Check the function is deployed:
```bash
supabase functions list
```

### App not opening?
- Check deep linking is configured in `App-native.tsx`
- Verify redirect URLs in Supabase Dashboard
- Test deep link manually: `wildpals://email-verified`

## Alternative: Skip Confirmation Page

If you prefer no confirmation page (just blank page → redirect), use the direct deep link in email templates:

```
redirect_to=wildpals://email-verified
```

Instead of:

```
redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=signup
```

The confirmation page is recommended for better UX.
