# Onboarding Flow for New Users

## Complete User Journey

### 1. App Launch (First Time)
- User opens app
- **SplashScreen** plays video
- After video: Navigates to **Login** screen (no user session)

### 2. Sign Up
- User taps "Sign Up" on Login screen
- Fills in: Full Name, Email, Password, Date of Birth (optional), Agrees to Terms
- Taps "Sign Up" button
- Account created in Supabase (email unverified)
- Navigates to **EmailVerification** screen

### 3. Email Verification
- **EmailVerification** screen shows:
  - "We've sent a verification link to: [email]"
  - Instructions to check email
  - "Resend Email" button (with 60s countdown)
  - "Back to Login" button
- User receives email with verification link
- User clicks link in email

### 4. Email Link Click
- Link format: `https://xikaltnufqbysnrsjzwa.supabase.co/auth/v1/verify?token=...&redirect_to=wildpals://email-verified`
- Opens in browser
- Supabase verifies email (marks as confirmed in database)
- Browser redirects to: `wildpals://email-verified`
- App catches deep link and opens **ProfileSetup** screen

### 5. Profile Setup (Onboarding)
- **ProfileSetup** screen shows:
  - "Complete Your Profile"
  - Gender selection (required)
  - City input (required)
  - Bio textarea (optional, 200 chars max)
  - "Complete Profile" button
  - "Skip for now" button
- User fills in profile information
- Taps "Complete Profile"
- Profile saved to database
- Success alert: "Your profile is ready"
- Navigates to **MainTabs** (main app)

### 6. Main App
- User can now explore activities, join clubs, etc.

## Alternative Flows

### Skip Profile Setup
- User taps "Skip for now" on ProfileSetup
- Confirmation alert: "You can complete your profile later in Settings"
- Navigates to **MainTabs**
- `hasCompletedProfile` = false (bio and location not set)

### Returning User (Profile Incomplete)
- User opens app
- **SplashScreen** checks auth state
- User logged in but `hasCompletedProfile` = false
- Navigates to **ProfileSetup** (onboarding)

### Returning User (Profile Complete)
- User opens app
- **SplashScreen** checks auth state
- User logged in and `hasCompletedProfile` = true
- Navigates to **MainTabs** (main app)

## Key Components

### SplashScreen Logic
```typescript
if (user) {
  if (user.hasCompletedProfile) {
    navigate('MainTabs');  // Profile complete
  } else {
    navigate('ProfileSetup');  // Onboarding needed
  }
} else {
  navigate('Login');  // Not logged in
}
```

### hasCompletedProfile Check
```typescript
hasCompletedProfile: !!(profile?.bio && profile?.location)
```
- Returns true only if BOTH bio AND location are set
- Used to determine if user needs onboarding

## Deep Linking Configuration

### App-native.tsx
```typescript
const linking = {
  prefixes: ['wildpals://', 'https://xikaltnufqbysnrsjzwa.supabase.co'],
  config: {
    screens: {
      ProfileSetup: 'email-verified',  // Email verification redirect
      ResetPassword: 'reset-password',  // Password reset redirect
    },
  },
};
```

## Email Template Configuration

### Supabase Dashboard Settings
- **Site URL**: `https://xikaltnufqbysnrsjzwa.supabase.co`
- **Redirect URLs**: `wildpals://email-verified`

### Email Template (Confirm signup)
```html
<a href="{{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to=wildpals://email-verified">
  Verify My Email
</a>
```

## Summary

The onboarding flow ensures:
1. ✅ New users verify their email before accessing the app
2. ✅ New users complete their profile (or skip) after verification
3. ✅ Returning users with incomplete profiles are prompted to complete onboarding
4. ✅ Returning users with complete profiles go straight to the main app
5. ✅ No website needed - verification happens on Supabase, redirects to app
