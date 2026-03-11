# Email Verification Setup Guide

## Current Issue
SMTP not working - emails not being sent for verification.

## Solution: Use Supabase Built-in Email Service

Supabase provides a built-in email service that works without SMTP configuration. Perfect for development and initial launch.

---

## Step 1: Configure Supabase Email Settings

### A. Enable Email Confirmation

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `wildpals`
3. Navigate to **Authentication** → **Providers**
4. Find **Email** provider
5. Make sure these settings are enabled:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (This is critical!)
   - ✅ **Secure email change**

### B. Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Customize the email (optional):

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Welcome to WildPals!</p>
```

4. **Important:** Set the redirect URL
   - For development: `exp://localhost:8081` (Expo Go)
   - For production: Your app's deep link URL

### C. Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app's URL:
   - Development: `http://localhost:8081`
   - Production: `wildpals://` (your app scheme)

3. Add **Redirect URLs**:
   - `exp://localhost:8081/**`
   - `wildpals://**`

---

## Step 2: Update App Configuration

### A. Add Deep Linking to app.json

```json
{
  "expo": {
    "scheme": "wildpals",
    "ios": {
      "bundleIdentifier": "com.wildpals.app",
      "associatedDomains": ["applinks:xikaltnufqbysnrsjzwa.supabase.co"]
    }
  }
}
```

### B. Handle Email Confirmation in App

The app already has the EmailVerification screen, but we need to handle the deep link when user clicks the email link.

---

## Step 3: Testing Email Verification

### Test Checklist:

1. **Sign up with a real email address**
   - Use your personal email for testing
   - Check spam folder if email doesn't arrive

2. **Check Supabase Dashboard**
   - Go to **Authentication** → **Users**
   - Find your test user
   - Check if `email_confirmed_at` is null (unverified)

3. **Check email delivery**
   - Supabase built-in email has rate limits:
     - 3 emails per hour per user
     - 30 emails per hour total (free tier)
   - If you hit the limit, wait an hour or upgrade

4. **Click verification link**
   - Should redirect to app
   - User should be verified

---

## Troubleshooting

### Problem: No email received

**Solution 1: Check Supabase logs**
```
Dashboard → Logs → Auth Logs
```
Look for email sending events

**Solution 2: Verify email is enabled**
```
Dashboard → Authentication → Providers → Email
Confirm email: ENABLED
```

**Solution 3: Check rate limits**
Free tier limits:
- 3 emails/hour per user
- 30 emails/hour total

### Problem: Email goes to spam

**Solution:** For production, set up custom SMTP with your domain
- Use SendGrid, AWS SES, or Mailgun
- Configure in Supabase Dashboard → Project Settings → Auth

### Problem: Verification link doesn't work

**Solution:** Check redirect URLs
```
Dashboard → Authentication → URL Configuration
Add: wildpals://** and exp://localhost:8081/**
```

---

## For Production: Custom SMTP (Optional)

If you want branded emails and higher limits:

### Recommended Services:
1. **SendGrid** (Free tier: 100 emails/day)
2. **AWS SES** (Very cheap, $0.10 per 1000 emails)
3. **Mailgun** (Free tier: 5000 emails/month)

### Setup Steps:
1. Create account with email service
2. Get SMTP credentials
3. Go to Supabase Dashboard → Project Settings → Auth
4. Scroll to **SMTP Settings**
5. Enter:
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - Sender email
   - Sender name

---

## Quick Fix: Disable Email Verification (NOT RECOMMENDED)

If you absolutely need to test without email verification:

1. Go to Supabase Dashboard → Authentication → Providers
2. Disable "Confirm email"
3. Users will be auto-confirmed on signup

**⚠️ WARNING:** This is NOT recommended for production and may violate App Store guidelines.

---

## Current Status

- ✅ EmailVerification screen exists
- ✅ SignUp flow navigates to verification
- ⏳ Supabase email configuration needed
- ⏳ Deep linking setup needed
- ⏳ Testing required

---

## Next Steps

1. Configure Supabase email settings (5 minutes)
2. Test with real email address
3. Verify emails are being sent
4. Test verification flow
5. Add deep linking for production
