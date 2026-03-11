# Email Verification Quick Fix

## The Problem
Clicking the verification link shows "Cannot GET /auth/v1/verify" or doesn't open the app.

## The Solution (No Website Needed!)

### 1. Update Supabase URL Configuration
Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/url-configuration

Set:
- **Site URL**: `https://xikaltnufqbysnrsjzwa.supabase.co`
- **Redirect URLs** (add both):
  - `wildpals://email-verified`
  - `https://xikaltnufqbysnrsjzwa.supabase.co/auth/v1/verify`

### 2. Deploy Confirmation Page Edge Function

First, deploy the confirmation page:

```bash
supabase functions deploy email-verified
```

### 3. Update Email Template
Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/templates

Select: **Confirm signup** template

Replace with this HTML:

```html
<h2>Welcome to Wildpals! 🏔️</h2>
<p>Thanks for joining our outdoor adventure community!</p>
<p>Click the button below to verify your email and start exploring activities:</p>
<p>
  <a href="{{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=signup" 
     style="background-color: #4A7C59; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 8px; display: inline-block; 
            font-weight: 600;">
    Verify My Email
  </a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; font-size: 14px; word-break: break-all;">
  {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=signup
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

### 3. Test
1. Delete test accounts
2. Sign up with a new email
3. Click verification link in email
4. See confirmation page: "Email Verified! Opening app..."
5. App opens ProfileSetup screen

## How It Works
1. User clicks link → Opens in browser
2. Supabase verifies email on their server
3. Redirects to confirmation page: `{{ .SiteURL }}/functions/v1/email-verified`
4. Confirmation page shows: "Email Verified! Opening app..."
5. Page automatically redirects to `wildpals://email-verified`
6. Your app catches the deep link and opens ProfileSetup

The confirmation page provides visual feedback and handles the redirect to your app.
