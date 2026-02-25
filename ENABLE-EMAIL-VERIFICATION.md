# Enable Email Verification - Quick Guide

## Current Status

Your app is already configured for email verification! You just need to enable it in Supabase.

## Quick Setup (5 Minutes)

### Step 1: Enable Email Confirmations in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Settings** (left sidebar)
4. Scroll down to **Email Auth** section
5. Find **"Enable email confirmations"** toggle
6. Turn it **ON** ✅
7. Click **Save** at the bottom

That's it! Email verification is now enabled.

### Step 2: Test It

1. Open your app
2. Sign up with a real email address (use your personal email)
3. Check your inbox (and spam folder!)
4. Click the verification link in the email
5. Return to app and tap "I've Verified My Email"
6. You should be able to continue to profile setup

## What Happens Now

When users sign up:
1. Account is created but marked as "unverified"
2. Supabase automatically sends verification email
3. User clicks link in email
4. Email is marked as verified
5. User can now access the app

## Email Template

Supabase sends a default email that looks like this:

```
Subject: Confirm your signup

Confirm your mail

[Confirm your mail button]
```

### Customize the Email (Optional)

To make it look more professional:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Replace with this branded template:

```html
<h2>Welcome to Wildpals! 🏔️</h2>

<p>Hi {{ .Email }},</p>

<p>Thanks for joining Wildpals - your outdoor adventure community!</p>

<p>Please confirm your email address by clicking the button below:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; background-color: #4A7C59; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
    Verify Email Address
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't create an account with Wildpals, you can safely ignore this email.</p>

<p>Happy adventuring!<br>
The Wildpals Team</p>

<hr>
<p style="font-size: 12px; color: #666;">
  This email was sent to {{ .Email }}
</p>
```

4. Click **Save**

## Troubleshooting

### Emails not arriving?

**Check spam folder first!** Supabase's built-in email often goes to spam.

If still not arriving:
1. Verify "Enable email confirmations" is ON in Supabase
2. Check Supabase logs: **Authentication** → **Logs**
3. Try with a different email provider (Gmail, Outlook, etc.)

### Emails going to spam?

This is normal with Supabase's built-in email service. For production, you'll want to use a custom email service (see below).

### Rate limits?

Supabase's built-in email has limits:
- ~4 emails per hour per project (development)
- Limited daily sends on free tier

For testing, this is fine. For production, upgrade to custom SMTP.

## For Production (Before Launch)

Supabase's built-in email is good for testing but not production. Before launching:

### Option 1: SendGrid (Recommended - Free tier: 100 emails/day)

1. Sign up at https://sendgrid.com
2. Create API Key (Settings → API Keys)
3. In Supabase: **Authentication** → **Settings** → **SMTP Settings**
4. Enable **Custom SMTP**
5. Fill in:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@wildpals.com
   Sender name: Wildpals
   ```
6. Save

### Option 2: Resend (Modern, developer-friendly - Free tier: 100 emails/day)

1. Sign up at https://resend.com
2. Get API Key
3. Configure in Supabase SMTP settings

### Option 3: AWS SES (Best for scale - $0.10 per 1000 emails)

1. Sign up at https://aws.amazon.com/ses/
2. Verify domain
3. Get SMTP credentials
4. Configure in Supabase

## Current Implementation

Your app already has:
- ✅ SignUp screen with email collection
- ✅ EmailVerification screen with instructions
- ✅ Resend email functionality
- ✅ Check verification status
- ✅ Supabase integration

All you need to do is enable it in Supabase dashboard!

## Testing Checklist

- [ ] Enable email confirmations in Supabase
- [ ] Sign up with real email
- [ ] Check inbox (and spam!)
- [ ] Click verification link
- [ ] Return to app
- [ ] Tap "I've Verified My Email"
- [ ] Successfully continue to profile setup
- [ ] Test "Resend Email" button

## What Users See

1. **Sign Up Screen**
   - Enter name, email, password
   - Agree to terms
   - Tap "Sign Up"

2. **Email Verification Screen**
   - See message: "We've sent a verification link to: [email]"
   - Instructions to check email
   - "I've Verified My Email" button
   - "Resend Email" option (after 60 seconds)

3. **Email Inbox**
   - Receive email from Supabase
   - Subject: "Confirm your signup" (or custom subject)
   - Click verification link
   - Browser opens showing success

4. **Back to App**
   - Tap "I've Verified My Email"
   - Success alert
   - Navigate to Profile Setup

## Summary

**For Testing (Now):**
1. Enable email confirmations in Supabase ✅
2. Test with your personal email ✅
3. Done! ✅

**For Production (Before Launch):**
1. Sign up for SendGrid (free) ✅
2. Configure custom SMTP in Supabase ✅
3. Customize email template ✅
4. Test thoroughly ✅

The system is ready - just flip the switch in Supabase! 🚀
