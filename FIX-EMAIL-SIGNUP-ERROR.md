# Fix: "Error Sending Confirmation Email"

## The Problem
Getting "Error sending confirmation email" when trying to sign up. This means Supabase email service is not properly configured.

## Quick Fix Options

### Option 1: Disable Email Verification (Development Only)
**Time**: 2 minutes
**Use for**: Testing during development

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Toggle OFF "Confirm email"
4. Save changes
5. Try signing up again

⚠️ **WARNING**: Remember to turn this back ON before production launch!

### Option 2: Use Supabase Default Email (Recommended for Testing)
**Time**: 5 minutes
**Use for**: Testing with real email verification

1. Go to Supabase Dashboard
2. **Authentication** → **Email Templates**
3. Check if templates are configured
4. Try signing up with a real email address
5. Check spam folder for verification email

If emails still don't arrive, Supabase's default email service might have rate limits or issues.

### Option 3: Set Up Custom SMTP (Production Ready)
**Time**: 30 minutes
**Use for**: Production launch

Use a dedicated email service like Resend or SendGrid:

#### Using Resend (Recommended)
1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Verify your domain or use their test domain
3. Get your API key
4. In Supabase Dashboard:
   - Go to **Project Settings** → **Auth**
   - Scroll to **SMTP Settings**
   - Enable custom SMTP
   - Enter Resend SMTP details:
     ```
     Host: smtp.resend.com
     Port: 465 or 587
     Username: resend
     Password: [Your Resend API Key]
     Sender email: noreply@yourdomain.com
     ```
5. Save and test

#### Using SendGrid
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API key
3. Verify sender email
4. Configure in Supabase SMTP settings

## Testing Email Delivery

After configuration:
1. Sign up with a real email
2. Check inbox (and spam folder)
3. Click verification link
4. Should redirect to app

## Common Issues

### "Email already exists"
- Delete the user from Supabase Dashboard → Authentication → Users
- Or use a different email

### "Invalid email"
- Check email format is correct
- Try a different email provider (Gmail, Outlook, etc.)

### Emails go to spam
- Set up SPF and DKIM records (if using custom domain)
- Use a reputable SMTP service (Resend, SendGrid)

### No email received
- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify SMTP settings are correct
- Check email service quotas

## For Development: Skip Email Verification

If you just want to test the app without email verification:

1. Disable email confirmation (Option 1 above)
2. Sign up normally
3. User is created immediately without verification
4. Can login and use app right away

## For Production: Must Have Email Verification

Before launching:
- ✅ Set up custom SMTP (Resend or SendGrid)
- ✅ Test email delivery thoroughly
- ✅ Check spam folder behavior
- ✅ Set up SPF/DKIM if using custom domain
- ✅ Monitor email delivery rates

## Current Error Handling

The app now shows clearer error messages:
- "Email service is not configured" → Set up SMTP
- "Unable to send verification email" → Check email address or SMTP
- "This email is already registered" → Use different email or login

## Next Steps

1. **For testing now**: Disable email verification (Option 1)
2. **For production**: Set up Resend SMTP (Option 3)
3. **Test thoroughly**: Sign up with multiple emails
4. **Monitor**: Check Supabase logs for email delivery issues
