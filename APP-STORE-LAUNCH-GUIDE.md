# App Store Launch Guide for Wildpals

## Timeline Overview
**Total estimated time: 4-8 weeks**

---

## Phase 1: Pre-Launch Preparation (2-3 weeks)

### Week 1-2: Technical Requirements

#### 1. App Store Developer Accounts
- **Apple Developer Program** ($99/year)
  - Sign up at developer.apple.com
  - Verification takes 1-2 days
  - Required for iOS App Store
  
- **Google Play Console** ($25 one-time)
  - Sign up at play.google.com/console
  - Verification takes 1-2 days
  - Required for Android Play Store

#### 2. App Configuration
- [ ] Update app.json with production values:
  - Bundle identifier (e.g., com.wildpals.app)
  - Version number (start with 1.0.0)
  - App name and description
  - Privacy policy URL
  - Terms of service URL

- [ ] Configure app icons and splash screens
  - iOS: 1024x1024px icon
  - Android: Adaptive icon (foreground + background)
  - Splash screen assets

- [ ] Set up deep linking (for email verification, activity sharing)

#### 3. Legal & Compliance
- [ ] **Privacy Policy** (REQUIRED)
  - Must cover: data collection, usage, storage, sharing
  - Include GDPR compliance if targeting EU
  - Host on your website or use a generator
  
- [ ] **Terms of Service** (REQUIRED)
  - User responsibilities
  - Liability limitations
  - Account termination policies
  
- [ ] **Age Rating**
  - Determine appropriate age rating (likely 12+ or 17+)
  - Consider user-generated content implications

#### 4. Production Infrastructure
- [ ] Supabase production setup
  - Upgrade from free tier if needed
  - Enable backups
  - Set up monitoring/alerts
  - Configure rate limiting
  
- [ ] Email service (Resend)
  - Verify domain for professional emails
  - Set up SPF/DKIM records
  - Configure sending limits
  
- [ ] Error tracking (optional but recommended)
  - Sentry or similar service
  - Track crashes and errors in production

### Week 2-3: Testing & Quality Assurance

#### 5. Testing Checklist
- [ ] **Functional Testing**
  - All user flows work end-to-end
  - Sign up → onboarding → create activity → join → chat
  - Club creation and management
  - Profile editing
  
- [ ] **Device Testing**
  - Test on multiple iOS devices (iPhone SE, 14, 15 Pro)
  - Test on multiple Android devices (various screen sizes)
  - Test on different OS versions
  
- [ ] **Performance Testing**
  - App loads quickly
  - Images load efficiently
  - No memory leaks
  - Smooth scrolling
  
- [ ] **Edge Cases**
  - Poor network conditions
  - Offline behavior
  - Empty states
  - Error handling
  
- [ ] **Security Review**
  - No hardcoded secrets
  - Secure API calls
  - Proper authentication
  - Data encryption

#### 6. Beta Testing (Recommended)
- [ ] TestFlight (iOS) - 1-2 weeks
  - Invite 10-50 beta testers
  - Gather feedback
  - Fix critical bugs
  
- [ ] Google Play Internal Testing (Android)
  - Similar to TestFlight
  - Test with real users

---

## Phase 2: App Store Assets (1 week)

### 7. Marketing Materials

#### App Store Screenshots (REQUIRED)
- **iOS**: 6.7", 6.5", 5.5" displays
- **Android**: Phone and tablet sizes
- Show key features:
  1. Explore activities
  2. Activity details
  3. Chat interface
  4. Profile/clubs
  5. Create activity

#### App Preview Video (Optional but recommended)
- 15-30 seconds
- Show app in action
- No audio required

#### App Store Listing
- [ ] **App Name** (30 chars max)
  - "Wildpals - Outdoor Activities"
  
- [ ] **Subtitle** (30 chars iOS, 80 chars Android)
  - "Find cycling, climbing & running partners"
  
- [ ] **Description** (4000 chars)
  - What is Wildpals
  - Key features
  - How it works
  - Benefits
  
- [ ] **Keywords** (100 chars, iOS only)
  - cycling, climbing, running, outdoor, activities, sports, social, fitness
  
- [ ] **Category**
  - Primary: Health & Fitness or Social Networking
  - Secondary: Sports

---

## Phase 3: Build & Submit (1 week)

### 8. Production Build

#### iOS Build (using EAS Build)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Android Build
```bash
# Create production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### 9. App Store Submission

#### Apple App Store
- [ ] Upload build via EAS or Xcode
- [ ] Fill out App Store Connect form
- [ ] Add screenshots and description
- [ ] Set pricing (free)
- [ ] Submit for review
- **Review time**: 1-3 days typically

#### Google Play Store
- [ ] Upload APK/AAB
- [ ] Complete store listing
- [ ] Add screenshots and description
- [ ] Set pricing (free)
- [ ] Submit for review
- **Review time**: 1-7 days typically

---

## Phase 4: Post-Launch (Ongoing)

### 10. Launch Day
- [ ] Monitor crash reports
- [ ] Watch user reviews
- [ ] Be ready to fix critical bugs
- [ ] Respond to user feedback

### 11. Marketing & Growth
- [ ] Social media announcement
- [ ] Email existing users (if any)
- [ ] Local cycling/climbing clubs outreach
- [ ] University sports clubs
- [ ] App Store Optimization (ASO)

### 12. Ongoing Maintenance
- [ ] Regular updates (monthly recommended)
- [ ] Bug fixes
- [ ] New features based on feedback
- [ ] Performance improvements

---

## Critical Pre-Launch Checklist

### Must-Have Before Launch
- ✅ Email verification working
- ✅ All core features functional
- ✅ Privacy policy and terms of service
- ✅ App icons and splash screens
- ✅ Production Supabase setup
- ✅ Error handling for all user actions
- ✅ Tested on real devices
- ✅ No placeholder text or "TODO" items
- ✅ Professional app store assets

### Nice-to-Have (Can add later)
- ⭕ Push notifications
- ⭕ In-app messaging
- ⭕ Activity map view
- ⭕ Photo uploads
- ⭕ Activity ratings/reviews
- ⭕ Social sharing
- ⭕ Analytics dashboard

---

## Common Rejection Reasons (Avoid These!)

### Apple App Store
1. **Incomplete app** - All features must work
2. **Crashes** - Must be stable
3. **Missing privacy policy** - Required for data collection
4. **Misleading screenshots** - Must show actual app
5. **Broken links** - All URLs must work
6. **Login issues** - Reviewers must be able to test

### Google Play Store
1. **Privacy policy missing** - Required
2. **Inappropriate content** - User-generated content needs moderation
3. **Crashes on test devices**
4. **Misleading description**
5. **Broken functionality**

---

## Estimated Costs

### One-Time
- Apple Developer: $99/year
- Google Play: $25 one-time
- Domain (if needed): $10-15/year
- Legal docs (if using service): $0-500

### Monthly (Ongoing)
- Supabase: $0-25/month (start free)
- Resend: $0-20/month (start free)
- Error tracking: $0-26/month (optional)
- **Total**: $0-70/month initially

---

## Realistic Timeline

### Optimistic (4 weeks)
- Week 1: Setup accounts, legal docs, testing
- Week 2: Beta testing, fix bugs
- Week 3: Create assets, build app
- Week 4: Submit and wait for approval

### Realistic (6-8 weeks)
- Weeks 1-2: Accounts, legal, infrastructure
- Weeks 3-4: Thorough testing, beta program
- Week 5: Marketing assets, screenshots
- Week 6: Build and submit
- Weeks 7-8: Review process, potential revisions

---

## Next Immediate Steps

1. **This Week**
   - Sign up for Apple Developer Program
   - Sign up for Google Play Console
   - Write privacy policy and terms of service
   - Create app icons

2. **Next Week**
   - Set up production Supabase
   - Configure app.json for production
   - Start beta testing with friends
   - Create app store screenshots

3. **Week 3**
   - Fix bugs from beta testing
   - Create app store listing copy
   - Prepare marketing materials

4. **Week 4**
   - Build production app
   - Submit to both stores
   - Prepare launch announcement

---

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [App Store Screenshot Templates](https://www.figma.com/community/search?model_type=files&q=app%20store%20screenshots)

---

## Questions to Consider

1. **Target Market**: UK only or international?
2. **Monetization**: Free forever or future premium features?
3. **Content Moderation**: How will you handle inappropriate content?
4. **Support**: How will users get help? (Email, in-app, FAQ)
5. **Scaling**: What happens if you get 1000+ users quickly?

Good luck with your launch! 🚀
