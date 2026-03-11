# Password Reset Setup Guide

## Current Implementation

The password reset flow is fully implemented and working:

### 1. ForgotPassword Screen
- User enters their email address
- Taps "Send Reset Link"
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'wildpals://reset-password' })`
- Shows success message: "Check Your Email"

### 2. Email Template Configuration

You need to configure the password reset email template in Supabase Dashboard:

**Go to:** https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/templates

**Select:** "Reset Password" template

**Update with:**

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for your Wildpals account.</p>
<p>Click the button below to create a new password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=recovery" 
     style="background-color: #4A7C59; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 8px; display: inline-block; 
            font-weight: 600;">
    Reset Password
  </a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; font-size: 14px; word-break: break-all;">
  {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to={{ .SiteURL }}/functions/v1/email-verified?type=recovery
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

### 3. URL Configuration

**Go to:** https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/auth/url-configuration

**Ensure these are set:**
- **Site URL**: `https://xikaltnufqbysnrsjzwa.supabase.co`
- **Redirect URLs**: Must include `wildpals://reset-password`

### 4. ResetPassword Screen
- Opens when user clicks link in email (via deep link)
- User enters new password
- User confirms new password
- Validates:
  - Both fields filled
  - Password min 6 characters
  - Passwords match
- Calls `supabase.auth.updateUser({ password })`
- Shows success message and navigates to Login

## Complete Flow

```
User taps "Forgot Password?" on Login
  ↓
ForgotPassword screen - enters email
  ↓
Email sent with reset link
  ↓
User clicks link in email
  ↓
Link: https://xikaltnufqbysnrsjzwa.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=wildpals://reset-password
  ↓
Browser opens, Supabase verifies token
  ↓
Redirects to: wildpals://reset-password
  ↓
App opens ResetPassword screen
  ↓
User enters new password + confirm
  ↓
Password updated in Supabase
  ↓
Success! Navigate to Login
```

## Deep Linking Configuration

Already configured in `App-native.tsx`:

```typescript
const linking = {
  prefixes: ['wildpals://', 'https://xikaltnufqbysnrsjzwa.supabase.co'],
  config: {
    screens: {
      ProfileSetup: 'email-verified',
      ResetPassword: 'reset-password',  // ← Password reset deep link
    },
  },
};
```

## Testing

1. Go to Login screen
2. Tap "Forgot Password?"
3. Enter email address
4. Check email inbox
5. Click "Reset Password" link
6. App opens ResetPassword screen
7. Enter new password twice
8. Tap "Reset Password"
9. Success! Can now login with new password

## Security Features

- ✅ Token expires in 1 hour
- ✅ Password must be min 6 characters
- ✅ Password confirmation required
- ✅ Secure token verification via Supabase
- ✅ Deep link only works with valid token
- ✅ Old password immediately invalidated after reset
