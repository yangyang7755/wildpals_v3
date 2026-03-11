# Email Verification Implementation Guide

## Current Status

**Problem:** Supabase built-in email service is unreliable
- Logs show "confirmation email sent" but emails not delivered
- Users not receiving verification emails
- Previous SMTP configuration attempts failed

**Solution:** Use Resend for reliable email delivery

---

## Phase 1: App Store Submission (Current)

### Quick Fix for Review

1. **Pre-verify the test account manually:**
   - Go to Supabase Dashboard: https://supabase.com/dashboard
   - Navigate to Authentication → Users
   - Find user: reviewer@wildpals.app
   - Click "..." menu → "Confirm email"
   - Status should change to verified

2. **Keep email verification code enabled:**
   - EmailVerification.tsx screen stays as-is
   - Shows reviewers the feature exists
   - Demonstrates proper UX flow

3. **Update review notes:**
   - ✅ Already updated in APP-STORE-REVIEW-NOTES.md
   - Mentions email verification is enabled
   - Notes test account is pre-verified

---

## Phase 2: Post-Launch Implementation (Recommended)

### Why Resend?

- ✅ 99.9% deliverability rate
- ✅ 3,000 free emails/month
- ✅ Simple API (no complex SMTP)
- ✅ Works perfectly with Supabase Edge Functions
- ✅ Emails won't go to spam
- ✅ Real-time delivery tracking

### Implementation Steps

#### Step 1: Create Resend Account (5 minutes)

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your account
4. Get API key from: https://resend.com/api-keys
5. Save the API key securely

#### Step 2: Set Up Supabase Edge Function (10 minutes)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xikaltnufqbysnrsjzwa

# Create edge function
supabase functions new send-verification-email
```

#### Step 3: Create Edge Function Code

Create file: `supabase/functions/send-verification-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, userId, userName } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate verification token
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    
    if (userError) throw userError

    // Generate email confirmation link
    const { data, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'signup',
      email: email,
    })

    if (linkError) throw linkError

    const verificationUrl = data.properties.action_link

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'WildPals <noreply@wildpals.app>',
        to: [email],
        subject: 'Verify your WildPals email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4A7C59; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #4A7C59; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to WildPals!</h1>
                </div>
                <div class="content">
                  <p>Hi ${userName || 'there'},</p>
                  <p>Thanks for signing up! Please verify your email address to get started with WildPals.</p>
                  <p style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </p>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #4A7C59;">${verificationUrl}</p>
                  <p>This link will expire in 24 hours.</p>
                  <p>If you didn't create a WildPals account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© 2026 WildPals. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const resendData = await res.json()

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    return new Response(
      JSON.stringify({ success: true, messageId: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error sending verification email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

#### Step 4: Set Environment Variables

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Verify secrets are set
supabase secrets list
```

#### Step 5: Deploy Edge Function

```bash
# Deploy the function
supabase functions deploy send-verification-email

# Test the function
supabase functions invoke send-verification-email --data '{"email":"test@example.com","userId":"test-id","userName":"Test User"}'
```

#### Step 6: Update AuthContext.tsx

Update the signup function to call the edge function:

```typescript
const signup = async (
  email: string,
  password: string,
  fullName: string,
  dateOfBirth?: string
): Promise<boolean> => {
  try {
    console.log('=== SIGNUP ATTEMPT ===');
    console.log('Email:', email);
    console.log('Full Name:', fullName);
    
    // Create user account (with email confirmation disabled in Supabase)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          date_of_birth: dateOfBirth,
        },
        emailRedirectTo: 'wildpals://email-verified',
      },
    });

    if (error) {
      console.error('❌ Signup error:', error.message);
      throw new Error(error.message || 'Failed to create account');
    }

    if (data?.user) {
      console.log('✅ User created successfully!');
      
      // Send verification email via Edge Function
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-verification-email',
          {
            body: {
              email: email,
              userId: data.user.id,
              userName: fullName,
            },
          }
        );

        if (emailError) {
          console.error('⚠️ Email sending failed:', emailError);
          // Don't fail signup if email fails - user can resend later
        } else {
          console.log('📧 Verification email sent successfully');
        }
      } catch (emailError) {
        console.error('⚠️ Email sending error:', emailError);
        // Don't fail signup if email fails
      }
      
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('❌ Signup error caught:', error);
    throw error;
  }
};
```

#### Step 7: Update Resend Email Function

Also update the resend functionality in EmailVerification.tsx:

```typescript
const handleResendEmail = async () => {
  setResending(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user found');

    const { error } = await supabase.functions.invoke(
      'send-verification-email',
      {
        body: {
          email: email,
          userId: user.id,
          userName: user.user_metadata?.full_name || 'there',
        },
      }
    );

    if (error) throw error;

    Alert.alert(
      'Email Sent!',
      'A new verification email has been sent to your inbox'
    );
    
    // Reset countdown
    setCanResend(false);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } catch (error: any) {
    console.error('Error resending email:', error);
    Alert.alert('Error', error.message || 'Failed to resend verification email');
  } finally {
    setResending(false);
  }
};
```

#### Step 8: Configure Supabase Email Settings

1. Go to Supabase Dashboard → Authentication → Providers
2. **Disable** "Confirm email" (we're handling it manually now)
3. This prevents Supabase from sending its own emails

#### Step 9: Test the Implementation

```bash
# Test with a real email address
# 1. Sign up with your email
# 2. Check inbox (and spam folder)
# 3. Click verification link
# 4. Should redirect to app and verify user

# Test different email providers:
# - Gmail
# - Outlook
# - Yahoo
# - ProtonMail
```

---

## Testing Checklist

- [ ] Resend account created
- [ ] API key obtained
- [ ] Edge function created
- [ ] Environment variables set
- [ ] Edge function deployed
- [ ] AuthContext updated
- [ ] EmailVerification screen updated
- [ ] Supabase email confirmation disabled
- [ ] Test signup with real email
- [ ] Verify email received (check spam)
- [ ] Click verification link
- [ ] User verified in app
- [ ] Test resend functionality
- [ ] Test with multiple email providers

---

## Monitoring & Debugging

### Check Resend Dashboard
- Go to https://resend.com/emails
- View all sent emails
- Check delivery status
- View bounce/complaint rates

### Check Supabase Logs
```bash
# View edge function logs
supabase functions logs send-verification-email

# Or in dashboard:
# Dashboard → Edge Functions → send-verification-email → Logs
```

### Common Issues

**Issue: Email not received**
- Check Resend dashboard for delivery status
- Check spam folder
- Verify email address is correct
- Check Resend API key is valid

**Issue: Verification link doesn't work**
- Check deep linking configuration in app.json
- Verify emailRedirectTo URL is correct
- Test link in browser first

**Issue: Edge function fails**
- Check environment variables are set
- View function logs for errors
- Verify Supabase service role key is correct

---

## Cost Estimate

**Resend Pricing:**
- Free tier: 3,000 emails/month
- Paid tier: $20/month for 50,000 emails
- Additional: $1 per 1,000 emails

**Expected Usage:**
- Average: 100-200 signups/month = 100-200 emails
- Well within free tier
- Cost: $0/month

---

## Rollback Plan

If something goes wrong:

1. Re-enable Supabase email confirmation:
   - Dashboard → Authentication → Providers
   - Enable "Confirm email"

2. Revert AuthContext changes:
   - Remove edge function call
   - Use original Supabase signup

3. Keep EmailVerification screen as-is
   - It works with both methods

---

## Timeline

- **Now:** Use pre-verified test account for App Store
- **After approval:** Implement Resend (2-3 hours)
- **Testing:** 1-2 days
- **Deploy:** Push update to App Store

---

## Support

If you need help:
- Resend docs: https://resend.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Auth: https://supabase.com/docs/guides/auth

