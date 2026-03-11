# Phase 1 Implementation: Email Verification + Profile Pictures

## Status: In Progress

### 1. Email Verification ✓ (Mostly Complete)

**Current Status:**
- ✅ EmailVerification screen exists
- ✅ SignUp navigates to EmailVerification
- ✅ Resend email functionality
- ✅ Check verification status

**Remaining Tasks:**
1. Configure Supabase email settings (if not done)
2. Test email verification flow
3. Add email verification check on login
4. Block unverified users from accessing main app

**Implementation Steps:**

#### A. Supabase Configuration
- Go to Supabase Dashboard → Authentication → Email Templates
- Customize confirmation email template
- Set redirect URL for email confirmation

#### B. Update AuthContext
- Add email verification check in login
- Prevent unverified users from accessing app

#### C. Add Verification Banner
- Show banner in app if email not verified
- Allow resending verification email from banner

---

### 2. Profile Pictures (To Implement)

**Requirements:**
- Users can upload profile pictures
- Clubs can have profile pictures
- Images stored in Supabase Storage
- Display pictures throughout app

**Database Changes Needed:**
```sql
-- Add profile_image_url to profiles table
ALTER TABLE profiles 
ADD COLUMN profile_image_url TEXT;

-- Add profile_image_url to clubs table
ALTER TABLE clubs 
ADD COLUMN profile_image_url TEXT;
```

**Implementation Steps:**

#### A. Setup Supabase Storage
1. Create storage bucket: `profile-images`
2. Set up RLS policies for bucket
3. Configure public access for images

#### B. Create Image Upload Component
- File: `native/components/ImagePicker.tsx`
- Use expo-image-picker
- Compress images before upload
- Show preview

#### C. Update Screens
1. **EditProfile.tsx** - Add profile picture upload
2. **ProfileSetup.tsx** - Add profile picture during onboarding
3. **CreateClub.tsx** - Add club picture upload
4. **Profile.tsx** - Display user profile picture
5. **UserProfile.tsx** - Display other users' pictures
6. **ClubDetail.tsx** - Display club picture
7. **Clubs.tsx** - Display club pictures in list
8. **ActivityCard** - Show organizer picture
9. **Chat screens** - Show user pictures in messages

#### D. Install Dependencies
```bash
npm install expo-image-picker
```

---

## Priority Order

1. ✅ Email Verification (Critical for App Store)
2. 🔄 Profile Pictures (High priority for UX)

## Testing Checklist

### Email Verification
- [ ] New user receives verification email
- [ ] Verification link works
- [ ] Resend email works
- [ ] Unverified users blocked from app
- [ ] Verification banner shows for unverified users

### Profile Pictures
- [ ] User can upload profile picture
- [ ] Picture displays in profile
- [ ] Picture displays in chat
- [ ] Picture displays in activity cards
- [ ] Club can upload picture
- [ ] Club picture displays everywhere
- [ ] Images are properly compressed
- [ ] Images load quickly

---

## Next Steps

1. Complete email verification testing
2. Implement profile picture upload
3. Update all screens to display pictures
4. Test thoroughly
5. Deploy to production
