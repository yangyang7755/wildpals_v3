# Setup Supabase Email Verification (No Domain Needed)

## Step 1: Disable Custom SMTP (Use Supabase's Email)

1. Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/smtp
2. Find "Enable Custom SMTP"
3. Toggle it **OFF** (disable)
4. Click "Save"

This switches from Resend to Supabase's built-in email service.

## Step 2: Enable Email Confirmation

1. Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/providers
2. Click on "Email" provider
3. Find "Confirm email"
4. Toggle it **ON** (enable)
5. Click "Save"

## Step 3: Configure URL Settings

1. Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/url-configuration
2. Set these values:

**Site URL:**
```
https://xikaltnufqbysnrsjzwa.supabase.co
```

**Redirect URLs** (add both):
```
wildpals://email-verified
wildpals://reset-password
```

3. Click "Save"

## Step 4: Update Email Template

1. Go to: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/templates
2. Click on "Confirm signup" template
3. Replace the entire content with this:

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

4. Click "Save"

## Step 5: Update Password Reset Template (Optional)

1. Still in Email Templates, click "Reset Password"
2. Replace with this:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for your Wildpals account.</p>
<p>Click the button below to create a new password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to=wildpals://reset-password" 
     style="background-color: #4A7C59; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 8px; display: inline-block; 
            font-weight: 600;">
    Reset Password
  </a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; font-size: 14px; word-break: break-all;">
  {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to=wildpals://reset-password
</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">
  This link expires in 1 hour for security reasons.
</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">
  If you didn't request a password reset, you can safely ignore this email.
</p>
<p style="margin-top: 32px;">Stay safe on the trails! 🏔️</p>
<p style="color: #4A7C59; font-weight: 600;">The Wildpals Team</p>
```

3. Click "Save"

## Step 6: Test the Flow

1. **Delete any test accounts** (to start fresh)
2. **Sign up** with a new email in your app
3. **Check email inbox** (and spam folder)
4. **Click verification link** in email
5. **App should open** to ProfileSetup screen
6. **Complete profile** and start using app

## What to Expect

### After Signup:
- User sees EmailVerification screen
- Email sent within 1-2 minutes
- User must click link to verify

### After Clicking Link:
- Browser opens briefly
- Redirects to app: `wildpals://email-verified`
- App opens ProfileSetup screen
- User completes onboarding

### If Email Doesn't Arrive:
- Check spam folder
- Wait 2-3 minutes (Supabase can be slow)
- Use "Resend Email" button in app
- Check Supabase logs for errors

## Limitations of Supabase Email

**Rate Limits:**
- 3 emails per hour per user
- Good for testing and small apps
- May be slow (1-2 minute delay)

**Deliverability:**
- May go to spam folder
- Not as reliable as custom domain
- Sender: `noreply@mail.app.supabase.io`

**When to Upgrade:**
- If emails go to spam frequently
- If you need faster delivery
- If you want professional sender address
- Then consider buying a domain

## Troubleshooting

### "Error sending confirmation email"
- Make sure Custom SMTP is **OFF**
- Make sure "Confirm email" is **ON**
- Check Supabase logs for details

### Email not received
- Check spam folder
- Wait 2-3 minutes
- Try resend button
- Check email address is correct

### Link doesn't open app
- Verify redirect URLs are set correctly
- Check deep linking in App-native.tsx
- Test deep link manually: `wildpals://email-verified`

### User created but not verified
Run this SQL to check:
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

If `email_confirmed_at` is NULL, user hasn't verified yet.

## Summary

✅ Disabled Custom SMTP (using Supabase email)
✅ Enabled "Confirm email"
✅ Set Site URL and Redirect URLs
✅ Updated email templates
✅ Ready to test

**No domain needed!** Supabase handles everything.
