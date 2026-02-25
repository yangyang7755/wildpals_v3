# Supabase Email Verification Setup Guide

## Current Status

The app is configured to use Supabase's built-in email verification, but emails won't send until you configure the email settings in your Supabase dashboard.

## Option 1: Use Supabase's Built-in Email (Recommended for Testing)

Supabase provides a built-in email service for development/testing:

### Step 1: Enable Email Confirmations

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Make sure **Enable email confirmations** is **ON**
5. Click **Save**

### Step 2: Check Email Rate Limits

Supabase's built-in email has limits:
- **Development**: ~4 emails per hour per project
- **Free tier**: Limited daily sends
- Emails may go to spam

### Step 3: Test It

1. Sign up with a real email address
2. Check your inbox (and spam folder!)
3. Click the verification link
4. Return to app and tap "I've Verified My Email"

**Note**: Supabase's built-in email service is good for testing but not production.

---

## Option 2: Use Custom SMTP (Recommended for Production)

For production, you should use a professional email service. Here are the best options:

### A. SendGrid (Recommended - Free tier: 100 emails/day)

1. **Sign up at**: https://sendgrid.com
2. **Create API Key**:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Configure in Supabase**:
   - Go to **Authentication** → **Settings**
   - Scroll to **SMTP Settings**
   - Enable **Enable Custom SMTP**
   - Fill in:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: [Your SendGrid API Key]
     Sender email: noreply@wildpals.com (or your domain)
     Sender name: Wildpals
     ```
   - Click **Save**

### B. AWS SES (Best for scale - Very cheap)

1. **Sign up at**: https://aws.amazon.com/ses/
2. **Verify your domain** or email address
3. **Get SMTP credentials** from SES console
4. **Configure in Supabase** (same as SendGrid but with AWS credentials)

### C. Resend (Modern, developer-friendly - Free tier: 100 emails/day)

1. **Sign up at**: https://resend.com
2. **Get API Key** from dashboard
3. **Configure in Supabase** with Resend SMTP settings

---

## Option 3: Use a Wildpals Email Address

If you want to use a branded email like `noreply@wildpals.com`:

### Requirements:
1. **Own the domain**: wildpals.com
2. **Set up email service**: 
   - Google Workspace ($6/user/month)
   - Microsoft 365 ($6/user/month)
   - Or use SMTP service with your domain

### Setup with Google Workspace:

1. **Purchase domain** (if not owned): wildpals.com
2. **Sign up for Google Workspace**: https://workspace.google.com
3. **Create email**: noreply@wildpals.com
4. **Generate App Password**:
   - Enable 2FA on the account
   - Go to Security → App Passwords
   - Generate password for "Mail"
5. **Configure in Supabase**:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: noreply@wildpals.com
   Password: [App Password]
   Sender email: noreply@wildpals.com
   Sender name: Wildpals
   ```

---

## Customizing Email Templates

Once email is working, customize the templates:

### Step 1: Go to Email Templates

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Select **Confirm signup**

### Step 2: Customize the Template

Here's a branded template for Wildpals:

```html
<h2>Welcome to Wildpals! 🏔️</h2>

<p>Hi there,</p>

<p>Thanks for joining Wildpals - your adventure community!</p>

<p>Please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4A7C59; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify Email Address</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't create an account with Wildpals, you can safely ignore this email.</p>

<p>Happy adventuring!<br>
The Wildpals Team</p>

<hr>
<p style="font-size: 12px; color: #666;">
This email was sent to {{ .Email }}. If you have any questions, reply to this email.
</p>
```

### Step 3: Test the Template

1. Click **Save**
2. Sign up with a test account
3. Check the email formatting

---

## Recommended Setup for MVP Launch

### For Testing (Now):
✅ Use Supabase's built-in email
- Quick to set up
- No cost
- Good enough for testing

### For Production (Before Launch):
✅ Use SendGrid or Resend
- Free tier is sufficient for MVP
- Professional delivery
- Better inbox placement
- Email analytics

### For Scale (Post-Launch):
✅ Use AWS SES
- Very cheap ($0.10 per 1000 emails)
- Highly reliable
- Scales infinitely

---

## Current Implementation Status

✅ **SignUp screen** - Collects email and creates account
✅ **EmailVerification screen** - Shows instructions and resend option
✅ **AuthContext** - Handles signup with email verification
✅ **Supabase integration** - Ready to send emails

❌ **Email service not configured** - Needs SMTP setup in Supabase

---

## Quick Start (5 minutes)

**For immediate testing:**

1. Go to Supabase Dashboard
2. Authentication → Settings
3. Enable "Enable email confirmations"
4. Save
5. Test signup with your personal email
6. Check spam folder if email doesn't arrive

**For production:**

1. Sign up for SendGrid (free)
2. Get API key
3. Configure SMTP in Supabase
4. Test with real email
5. Customize email template
6. Launch!

---

## Troubleshooting

### Emails not arriving?
- Check spam folder
- Verify "Enable email confirmations" is ON
- Check Supabase logs: Authentication → Logs
- Try with different email provider (Gmail, Outlook, etc.)

### Emails going to spam?
- Use custom SMTP (SendGrid/AWS SES)
- Set up SPF, DKIM, DMARC records for your domain
- Use a branded sender email

### Rate limit errors?
- Supabase built-in email has strict limits
- Upgrade to custom SMTP
- SendGrid free tier: 100/day
- AWS SES: Virtually unlimited

---

## Do You Need a Wildpals Email?

**For MVP/Testing**: No, use Supabase built-in or SendGrid with any email

**For Production**: Yes, recommended for branding
- Option 1: Use SendGrid with `noreply@wildpals.com` (requires domain)
- Option 2: Use SendGrid with `wildpals@yourdomain.com` (if you have a domain)
- Option 3: Use `noreply@wildpals.app` (cheaper domain alternative)

**Cost**:
- Domain: ~$12/year (wildpals.app or wildpals.io)
- Email service: Free (SendGrid) or $0.10/1000 emails (AWS SES)
- Total: ~$12/year

Let me know if you want to set up a branded email and I'll help you configure it!
