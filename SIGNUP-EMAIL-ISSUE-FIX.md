# Fix: "Email Already in Use" Error

## Problem
Getting "Error sending confirmation email, email may already be in use" even though you've never created an account with that email.

## Why This Happens
Supabase stores user accounts in the `auth.users` table even if:
- Email verification was never completed
- The profile was never set up
- The account appears to not exist in your app

This is a security feature to prevent email enumeration attacks.

## Solutions

### Solution 1: Use Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Search for the email address
4. If you find the user, click the **...** menu → **Delete User**
5. Try signing up again

### Solution 2: Use SQL Query
Run this in Supabase SQL Editor:

```sql
-- Find the user
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Delete the user (replace with actual user ID)
DELETE FROM auth.users 
WHERE email = 'your-email@example.com';
```

### Solution 3: Use a Different Email
If you can't access the Supabase dashboard:
- Try signing up with a different email address
- Or use a plus-sign alias: `youremail+test@gmail.com`

### Solution 4: Try Logging In Instead
The account might actually exist. Try:
1. Go to the Login screen
2. Use "Forgot Password" to reset your password
3. Check your email for the reset link

## Prevention
This usually happens when:
- Testing signup multiple times during development
- Email verification fails but account is created
- User closes app before completing verification

## Updated Error Handling
The app now provides better error messages:
- ✅ "This email is already registered. Please try logging in instead."
- ✅ Offers to navigate directly to Login screen
- ✅ More specific error messages for different issues

## For Developers

### Clean Up Test Accounts
During development, regularly clean up test accounts:

```sql
-- Delete all unverified accounts older than 1 day
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL 
AND created_at < NOW() - INTERVAL '1 day';
```

### Enable Auto-Cleanup (Optional)
You can set up a Supabase Edge Function to automatically delete unverified accounts after 24 hours.

### Check Email Provider Settings
Make sure your email provider (Supabase default or custom SMTP) is configured correctly:
1. Supabase Dashboard → **Project Settings** → **Auth**
2. Check **SMTP Settings** if using custom email
3. Test email delivery with a known working email

## Testing Email Verification

### Development Mode
In development, you can:
1. Check Supabase logs for email delivery issues
2. Use the Supabase dashboard to manually verify emails
3. Disable email verification temporarily (not recommended for production)

### Disable Email Verification (Dev Only)
In Supabase Dashboard:
1. **Authentication** → **Providers** → **Email**
2. Toggle OFF "Confirm email"
3. Remember to turn it back ON before production!

## Common Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Email already registered" | Account exists in auth.users | Delete user or use different email |
| "Invalid email" | Email format is wrong | Check email format |
| "Error sending confirmation email" | Email delivery failed | Check SMTP settings |
| "User already registered" | Same as above | Delete user or login instead |

## Support
If you continue having issues:
1. Check Supabase logs: **Logs** → **Auth Logs**
2. Verify email settings in Supabase Dashboard
3. Contact support with the specific error message

## Related Files
- `native/contexts/AuthContext.tsx` - Improved error handling
- `native/screens/SignUp.tsx` - Better error messages
- `native/screens/Login.tsx` - Login flow

## Production Checklist
Before launching:
- [ ] Email verification is enabled
- [ ] SMTP is configured (Resend or SendGrid recommended)
- [ ] Test signup flow with real email
- [ ] Test email delivery (check spam folder)
- [ ] Set up email templates in Supabase
- [ ] Configure email rate limits
