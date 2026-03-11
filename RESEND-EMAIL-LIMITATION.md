# Resend Email Limitation Issue

## Problem
Emails work for `yangyang.ruohan.liu@gmail.com` but not for other emails.

## Root Cause
You're using Resend's **sandbox mode** with `onboarding@resend.dev` sender address.

**Sandbox limitations:**
- Can only send to verified email addresses
- Your email (`yangyang.ruohan.liu@gmail.com`) is verified in Resend
- Other emails are blocked
- This is a security feature to prevent spam during testing

## Solution Options

### Option 1: Add Test Emails to Resend (Quick Fix)

**Add each test email to Resend:**

1. Go to: https://resend.com/emails
2. Click "Add Email" or "Verify Email"
3. Enter the test email address
4. That email will receive a verification link
5. Click the link to verify
6. Now that email can receive emails from your app

**Limitations:**
- Must verify each test email individually
- Not scalable for real users
- Only for testing

### Option 2: Add Your Own Domain (Production Solution - Recommended)

**Set up a custom domain in Resend:**

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `wildpals.com` or `wildpals.app`)
4. Add DNS records (Resend will show you what to add)
5. Wait for verification (usually 5-30 minutes)
6. Update sender email to: `noreply@wildpals.com` or `hello@wildpals.com`

**Benefits:**
- Can send to ANY email address
- Professional sender address
- Better deliverability
- No verification needed for recipients

**Update SMTP settings after domain verified:**
- Sender email: `noreply@yourdomain.com`
- Keep other settings the same

### Option 3: Disable Email Confirmation (Testing Only)

**For testing without email verification:**

1. Go to Supabase Dashboard: Authentication → Providers → Email
2. Toggle OFF "Confirm email"
3. Users can signup and login immediately
4. No emails sent

**Use this for:**
- Testing the app flow
- Demo purposes
- Development

**Don't use for:**
- Production
- App Store submission (Apple requires email verification)

### Option 4: Use Different Email Provider

**Alternative to Resend:**

**SendGrid:**
- Free tier: 100 emails/day
- No sandbox mode
- Requires domain verification

**Mailgun:**
- Free tier: 5,000 emails/month
- Sandbox mode similar to Resend
- Requires domain for production

**AWS SES:**
- Very cheap ($0.10 per 1,000 emails)
- Requires AWS account
- More complex setup

## Recommended Approach

### For Testing Now:
1. **Option 3**: Disable email confirmation
2. Test app functionality
3. Re-enable later

### For App Store Submission:
1. **Option 2**: Add your own domain to Resend
2. Update sender email
3. Enable email confirmation
4. Test with real emails

### For Production:
1. **Must use Option 2** (custom domain)
2. Professional sender address
3. Better deliverability
4. No limitations

## Check Current Resend Status

**Go to Resend Dashboard:**
https://resend.com/overview

**Check:**
1. **Domains**: Do you have a verified domain?
   - If NO: You're in sandbox mode (limited)
   - If YES: You can send to anyone

2. **Verified Emails**: Which emails are verified?
   - These are the only emails that work in sandbox mode

3. **Usage**: How many emails sent?
   - Free tier: 3,000 emails/month
   - 100 emails/day limit

## Domain Setup Guide

**If you have a domain (e.g., wildpals.com):**

1. **Add to Resend:**
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Enter: `wildpals.com`

2. **Add DNS Records:**
   Resend will show you 3 DNS records to add:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT)

3. **Add to your DNS provider:**
   - Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
   - Add the DNS records Resend provided
   - Wait 5-30 minutes for propagation

4. **Verify in Resend:**
   - Click "Verify" in Resend dashboard
   - Should show "Verified" status

5. **Update Supabase SMTP:**
   - Sender email: `noreply@wildpals.com`
   - Keep other settings same

## Don't Have a Domain?

**Options:**

1. **Buy a domain** ($10-15/year):
   - Namecheap, GoDaddy, Google Domains
   - Use for professional emails

2. **Use subdomain** (if you have any domain):
   - `app.yourdomain.com`
   - `wildpals.yourdomain.com`

3. **Disable email confirmation** (testing only):
   - Not recommended for production
   - Apple may reject app

## Current Status

**Your setup:**
- ✅ Resend API key configured
- ✅ SMTP settings correct
- ⚠️ Using sandbox mode (`onboarding@resend.dev`)
- ⚠️ Only verified emails work
- ❌ No custom domain

**To fix:**
- Add custom domain to Resend
- OR disable email confirmation for testing
- OR add each test email to Resend verified list

## Quick Test

**To verify this is the issue:**

1. Go to: https://resend.com/emails
2. Check "Verified Emails" section
3. Is `yangyang.ruohan.liu@gmail.com` listed? → YES (that's why it works)
4. Are other test emails listed? → NO (that's why they fail)
