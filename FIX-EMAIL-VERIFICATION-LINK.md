# Fix Email Verification Link Issue

## Problem
Email verification link shows: "Cannot GET /auth/v1/verify"

## Root Cause
The Supabase email template or URL configuration is not properly set up for the mobile app deep linking.

## Solution

### Step 1: Update URL Configuration in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa
2. Navigate to: **Authentication** → **URL Configuration**
3. Set the following:
   - **Site URL**: `https://xikaltnufqbysnrsjzwa.supabase.co`
   - **Redirect URLs**: Add these URLs (one per line):
     - `wildpals://email-verified`
     - `https://xikaltnufqbysnrsjzwa.supabase.co/auth/v1/verify`

### Step 2: Update Email Template with Redirect

1. Go to: **Authentication** → **Email Templates** → **Confirm signup**
2. Replace the entire template with this (includes redirect to app):

```html
<h2>Welcome to Wildpals! 🏔️</h2>
<p>Thanks for joining our outdoor adventure community!</p>
<p>Click the button below to verify your email and start exploring activities:</p>
<p>
  <a href="{{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to=wildpals://email-verified" 
     style="background-color: #4A7C59; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 8px; display: inline-block; 
            font-weight: 600;">
    Verify My Email
  </a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; font-size: 14px; word-break: break-all;">
  {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to=wildpals://email-verified
</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">
  This link expires in 24 hours.
</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">
  If you didn't create a Wildpals account, you can safely ignore this email.
</p>
<p style="margin-top: 32px;">See you on the trails! 🚴🧗🏃</p>
<p style="color: #4A7C59; font-weight: 600;">The Wildpals Team</p>
```

**Important:** The `redirect_to=wildpals://email-verified` parameter tells Supabase to redirect to your app after verification.

### Step 3: Test the Flow

1. Delete any test accounts from the database
2. Sign up with a new email
3. Check the email - the link should now work
4. Click the verification link
5. The app should open and redirect to ProfileSetup

## Why This Happens

- Supabase's email confirmation needs a web URL to verify the token
- After verification, it redirects to the `redirect_to` parameter
- The `redirect_to` parameter contains your deep link (`wildpals://email-verified`)
- Your app's deep linking configuration catches this and opens ProfileSetup
- No separate website needed - the verification happens on Supabase's server, then redirects to your app

## How It Works

1. User clicks verification link in email
2. Link opens in browser: `https://xikaltnufqbysnrsjzwa.supabase.co/auth/v1/verify?token=...&redirect_to=wildpals://email-verified`
3. Supabase verifies the token and marks email as confirmed
4. Supabase redirects to: `wildpals://email-verified`
5. Your app catches the deep link and opens ProfileSetup screen
6. User continues with profile setup

## Alternative: Use Edge Function (Not Recommended)

If you want more control over the email content, you can use the edge function approach, but it requires:
- Disabling "Confirm email" in Supabase Auth settings
- Manually triggering the edge function after signup
- Handling email verification status manually

The built-in Supabase email system is simpler and more reliable.
