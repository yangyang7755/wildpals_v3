# Resend Email Setup for WildPals

## Why Resend?
- ✅ 99.9% deliverability
- ✅ 3,000 free emails/month
- ✅ Simple API
- ✅ No spam folder issues
- ✅ Works with Supabase Edge Functions

---

## Setup Steps

### 1. Create Resend Account (2 minutes)

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your account
4. Get API key from: https://resend.com/api-keys

### 2. Create Supabase Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xikaltnufqbysnrsjzwa

# Create edge function
supabase functions new send-verification-email
```

### 3. Edge Function Code

File: `supabase/functions/send-verification-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, verificationUrl, userName } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'WildPals <onboarding@resend.dev>',
        to: [email],
        subject: 'Verify your WildPals email',
        html: `
          <h1>Welcome to WildPals!</h1>
          <p>Hi ${userName || 'there'},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 4. Set Resend API Key

```bash
# Set the secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### 5. Deploy Edge Function

```bash
supabase functions deploy send-verification-email
```

---

## Alternative: Simpler Solution for Now

Since you need this working ASAP for App Store submission, here's the **quickest fix**:

### Option A: Disable Email Verification Temporarily

1. Go to Supabase Dashboard → Authentication → Providers
2. **Disable** "Confirm email"
3. Users will be auto-verified on signup

⚠️ **Important:** This is ONLY for initial App Store submission. Re-enable it after approval.

### Option B: Manual Verification for Reviewers

1. Keep email verification enabled
2. In your App Store review notes, provide:
   - Pre-verified test account
   - Email: reviewer@wildpals.app
   - Password: ReviewTest2024!

3. Manually verify this account in Supabase:
   - Dashboard → Authentication → Users
   - Find the user
   - Click "..." → "Confirm email"

---

## Recommended Approach for Launch

**For App Store Submission (Now):**
- Use Option B: Pre-verified test account for reviewers
- Keep email verification enabled in code
- Mention in review notes: "Email verification is enabled but test account is pre-verified"

**After App Store Approval:**
- Implement Resend with Edge Functions
- Test thoroughly
- Deploy update

---

## Quick Test

To test if emails are working:

1. Check spam folder
2. Try different email providers:
   - Gmail
   - Outlook
   - Yahoo
3. Check Supabase logs:
   - Dashboard → Logs → Auth Logs
   - Look for "confirmation.email.sent"

---

## Current Status

✅ Email verification code is ready
✅ UI screens exist
⏳ Email delivery needs fixing

**Recommendation:** Use pre-verified test account for App Store submission, implement Resend after approval.
