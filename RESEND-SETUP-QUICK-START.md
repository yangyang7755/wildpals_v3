# Resend Email Verification - Quick Start Guide

## Prerequisites

1. ✅ Supabase project: `wildpals` (xikaltnufqbysnrsjzwa)
2. ✅ Edge function code created: `supabase/functions/send-verification-email/index.ts`
3. ⏳ Resend account (free - 3,000 emails/month)
4. ⏳ Supabase CLI installed

---

## Step 1: Install Supabase CLI (5 minutes)

```bash
# On macOS with Homebrew
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

---

## Step 2: Create Resend Account (5 minutes)

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your account
4. Go to https://resend.com/api-keys
5. Click "Create API Key"
6. Name it: "WildPals Production"
7. Copy the API key (starts with `re_`)
8. **Save it securely** - you'll need it in the next step

---

## Step 3: Deploy the Edge Function (5 minutes)

Run the deployment script:

```bash
./deploy-email-function.sh
```

The script will:
- Check if you're logged in to Supabase
- Link to your project
- Ask for your Resend API key
- Deploy the function
- Set up all required secrets

**If the script asks for your Resend API key, paste it when prompted.**

---

## Step 4: Test the Function (2 minutes)

Test with your own email:

```bash
supabase functions invoke send-verification-email --data '{
  "email": "your-email@example.com",
  "userId": "test-user-id",
  "userName": "Your Name"
}'
```

Check your inbox (and spam folder) for the verification email.

---

## Step 5: Update Your App (10 minutes)

The edge function is now deployed. Next, update your React Native app to use it.

### A. Disable Supabase Built-in Email Confirmation

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `wildpals`
3. Go to: Authentication → Providers → Email
4. **Uncheck** "Confirm email"
5. Click Save

This prevents Supabase from sending its own (unreliable) emails.

### B. Update AuthContext.tsx

The code is already in `EMAIL-VERIFICATION-IMPLEMENTATION.md` - here's the key part:

```typescript
// In the signup function, after creating the user:
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
    } else {
      console.log('📧 Verification email sent successfully');
    }
  } catch (emailError) {
    console.error('⚠️ Email sending error:', emailError);
  }
  
  return true;
}
```

### C. Update EmailVerification.tsx

Update the resend function:

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

    Alert.alert('Email Sent!', 'A new verification email has been sent');
    // ... rest of the code
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to resend email');
  } finally {
    setResending(false);
  }
};
```

---

## Step 6: Test End-to-End (5 minutes)

1. **Sign up with a real email** in your app
2. **Check your inbox** (and spam folder)
3. **Click the verification link**
4. **Verify you can login**

---

## Monitoring & Debugging

### View Function Logs

```bash
# Real-time logs
supabase functions logs send-verification-email --follow

# Last 100 lines
supabase functions logs send-verification-email
```

### Check Resend Dashboard

Go to https://resend.com/emails to see:
- All sent emails
- Delivery status
- Bounce/complaint rates
- Click tracking

### Common Issues

**Issue: "RESEND_API_KEY not configured"**
- Solution: Run `supabase secrets set RESEND_API_KEY=your_key_here`

**Issue: Email not received**
- Check Resend dashboard for delivery status
- Check spam folder
- Verify email address is correct

**Issue: "Function not found"**
- Solution: Redeploy with `supabase functions deploy send-verification-email`

---

## Cost Estimate

**Resend Free Tier:**
- 3,000 emails/month
- Perfect for initial launch
- $0/month

**Expected Usage:**
- ~100-200 signups/month
- ~50-100 resend requests/month
- Total: ~150-300 emails/month
- **Well within free tier**

---

## Next Steps After Setup

1. ✅ Test with multiple email providers (Gmail, Outlook, Yahoo)
2. ✅ Monitor delivery rates in Resend dashboard
3. ✅ Update app to production build
4. ✅ Submit app update to App Store

---

## Rollback Plan

If something goes wrong:

1. Re-enable Supabase email confirmation:
   - Dashboard → Authentication → Providers → Email
   - Check "Confirm email"

2. Remove edge function call from AuthContext

3. App will use Supabase built-in emails again

---

## Support

- Resend docs: https://resend.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Your implementation guide: `EMAIL-VERIFICATION-IMPLEMENTATION.md`

