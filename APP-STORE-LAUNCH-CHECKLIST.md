# App Store Launch Checklist

## Overview
This is your complete checklist to launch Wildpals on iOS App Store and Google Play Store. Estimated total time: 4-6 weeks.

---

## 🔴 CRITICAL - Must Complete Before Launch

### 1. Core Features (Week 1-2)

#### Profile Management
- [ ] **Edit Profile** - Users can update name, age, gender, city, bio after signup
- [ ] **Profile Picture Upload** - Allow users to add/change profile photo
- [ ] **Delete Account** - Required by App Store, includes data deletion

#### Notifications System  
- [ ] **Database Setup** - Create notifications table
- [ ] **Join Request Notifications** - Notify when request is accepted/rejected
- [ ] **Chat Notifications** - Notify on new messages
- [ ] **Badge Count** - Show unread count on tab bar
- [ ] **Mark as Read** - Clear notifications after viewing

#### UI Improvements (from spec)
- [ ] **Fix Notifications UI** - Activity name should be largest element (execute spec tasks)
- [ ] **Profile Screen Updates** - Show changes immediately after editing
- [ ] **Activity Detail Page** - Make activities clickable to show full details

### 2. Legal & Compliance (Week 2)

#### Required Documents
- [ ] **Privacy Policy** - Cover data collection, usage, storage, GDPR
- [ ] **Terms of Service** - User responsibilities, liability, account termination
- [ ] **Age Rating Determination** - Likely 12+ or 17+ due to user-generated content
- [ ] **Add Links in App** - Privacy policy and terms in Settings screen

#### Data Privacy
- [ ] **Export User Data** - Allow users to download their data
- [ ] **Delete Account Flow** - Complete data removal process
- [ ] **Cookie/Tracking Disclosure** - If using analytics

### 3. Developer Accounts (Week 1)

- [ ] **Apple Developer Program** - Sign up ($99/year), verification takes 1-2 days
- [ ] **Google Play Console** - Sign up ($25 one-time), verification takes 1-2 days

---

## 🟡 IMPORTANT - Should Complete Before Launch

### 4. Production Infrastructure (Week 2)

#### Supabase Production
- [ ] **Upgrade Plan** - Move from free tier if needed
- [ ] **Enable Backups** - Automatic database backups
- [ ] **Set Up Monitoring** - Alerts for errors/downtime
- [ ] **Configure Rate Limiting** - Prevent abuse
- [ ] **Review RLS Policies** - Ensure security is tight

#### Email Service (Resend)
- [ ] **Verify Domain** - Professional email sending
- [ ] **Set Up SPF/DKIM** - Email authentication
- [ ] **Configure Limits** - Understand sending quotas
- [ ] **Test Email Delivery** - Verify emails don't go to spam

#### Error Tracking (Optional but Recommended)
- [ ] **Set Up Sentry** - Or similar crash reporting
- [ ] **Configure Alerts** - Get notified of critical errors
- [ ] **Test Integration** - Ensure errors are captured

### 5. App Configuration (Week 2-3)

#### app.json Updates
- [ ] **Bundle Identifier** - e.g., com.wildpals.app
- [ ] **Version Number** - Start with 1.0.0
- [ ] **App Name** - "Wildpals"
- [ ] **Description** - Short app description
- [ ] **Privacy Policy URL** - Link to hosted policy
- [ ] **Terms of Service URL** - Link to hosted terms

#### Assets
- [ ] **App Icon** - 1024x1024px for iOS
- [ ] **Adaptive Icon** - Foreground + background for Android
- [ ] **Splash Screen** - Loading screen assets
- [ ] **All Icon Sizes** - Generated from main icon

#### Deep Linking
- [ ] **Configure URL Scheme** - For email verification links
- [ ] **Activity Sharing Links** - Deep links to activities
- [ ] **Test Deep Links** - Verify they open the app correctly

### 6. Testing & Quality Assurance (Week 3)

#### Functional Testing
- [ ] **Sign Up Flow** - Email verification works
- [ ] **Onboarding** - Profile setup completes
- [ ] **Create Activity** - All fields save correctly
- [ ] **Join Activity** - Request and approval flow works
- [ ] **Activity Chat** - Messages send and receive
- [ ] **Club Features** - Create, join, manage clubs
- [ ] **Profile Editing** - Changes save and display
- [ ] **Notifications** - All notification types work
- [ ] **Search** - Find activities and clubs
- [ ] **Delete Account** - Complete data removal

#### Device Testing
- [ ] **iPhone SE** - Small screen testing
- [ ] **iPhone 14/15** - Standard size
- [ ] **iPhone 15 Pro Max** - Large screen
- [ ] **Android Small** - 5" screen
- [ ] **Android Medium** - 6" screen
- [ ] **Android Large** - 6.5"+ screen
- [ ] **iOS 16+** - Minimum supported version
- [ ] **Android 12+** - Minimum supported version

#### Edge Cases
- [ ] **Poor Network** - Slow connection handling
- [ ] **Offline Mode** - Graceful error messages
- [ ] **Empty States** - All screens have empty states
- [ ] **Long Text** - Activity names, messages don't break layout
- [ ] **Special Characters** - Emojis, accents work correctly
- [ ] **Past Dates** - Old activities are hidden/archived
- [ ] **Max Participants** - Activities close when full
- [ ] **Concurrent Actions** - Multiple users joining simultaneously

#### Performance Testing
- [ ] **App Load Time** - Opens quickly
- [ ] **Image Loading** - Photos load efficiently
- [ ] **Scroll Performance** - Smooth 60fps scrolling
- [ ] **Memory Usage** - No memory leaks
- [ ] **Battery Impact** - Not draining battery

#### Security Review
- [ ] **No Hardcoded Secrets** - API keys in environment variables
- [ ] **Secure API Calls** - HTTPS only
- [ ] **Authentication** - Tokens stored securely
- [ ] **Data Encryption** - Sensitive data encrypted
- [ ] **SQL Injection** - Supabase RLS prevents attacks
- [ ] **XSS Prevention** - User input sanitized

### 7. Beta Testing (Week 3-4)

#### TestFlight (iOS)
- [ ] **Create Build** - Using EAS Build
- [ ] **Upload to TestFlight** - Via App Store Connect
- [ ] **Add Testers** - 10-50 beta testers
- [ ] **Collect Feedback** - Use TestFlight feedback or surveys
- [ ] **Fix Critical Bugs** - Address major issues

#### Google Play Internal Testing
- [ ] **Create Build** - Using EAS Build
- [ ] **Upload to Play Console** - Internal testing track
- [ ] **Add Testers** - Email list of testers
- [ ] **Collect Feedback** - Google Forms or similar
- [ ] **Fix Critical Bugs** - Address major issues

---

## 🟢 NICE TO HAVE - Can Add Post-Launch

### 8. Marketing Materials (Week 4)

#### App Store Screenshots (REQUIRED)
- [ ] **iOS 6.7" Display** - iPhone 15 Pro Max
- [ ] **iOS 6.5" Display** - iPhone 14 Plus
- [ ] **iOS 5.5" Display** - iPhone 8 Plus
- [ ] **Android Phone** - Multiple sizes
- [ ] **Android Tablet** - If supporting tablets

#### Screenshot Content (5-6 screens)
1. [ ] **Explore Activities** - Browse screen
2. [ ] **Activity Details** - Full activity info
3. [ ] **Chat Interface** - Activity or club chat
4. [ ] **Profile/Clubs** - User profile
5. [ ] **Create Activity** - Creation flow
6. [ ] **Notifications** - Join requests

#### App Preview Video (Optional)
- [ ] **15-30 Second Video** - Show app in action
- [ ] **No Audio Required** - Visual only
- [ ] **Upload to Stores** - Both iOS and Android

#### App Store Listing
- [ ] **App Name** - "Wildpals - Outdoor Activities" (30 chars max)
- [ ] **Subtitle** - "Find cycling, climbing & running partners" (30 chars iOS, 80 Android)
- [ ] **Description** - 4000 character description
- [ ] **Keywords** - cycling, climbing, running, outdoor, activities, sports (100 chars iOS)
- [ ] **Category** - Health & Fitness or Social Networking
- [ ] **Secondary Category** - Sports

### 9. Production Build & Submit (Week 4)

#### iOS Build
```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure EAS
eas build:configure

# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

- [ ] **Create Build** - Run EAS build command
- [ ] **Upload to App Store Connect** - Via EAS submit
- [ ] **Fill Out Store Listing** - All required fields
- [ ] **Add Screenshots** - All required sizes
- [ ] **Set Pricing** - Free
- [ ] **Submit for Review** - Click submit button
- [ ] **Wait for Review** - 1-3 days typically

#### Android Build
```bash
# Create production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

- [ ] **Create Build** - Run EAS build command
- [ ] **Upload to Play Console** - Via EAS submit
- [ ] **Complete Store Listing** - All required fields
- [ ] **Add Screenshots** - All required sizes
- [ ] **Set Pricing** - Free
- [ ] **Submit for Review** - Click submit button
- [ ] **Wait for Review** - 1-7 days typically

---

## 📋 Pre-Submission Checklist

### Final Verification (Day Before Submit)

#### Functionality
- [ ] All features work end-to-end
- [ ] No crashes or critical bugs
- [ ] Email verification works
- [ ] Push notifications work (if implemented)
- [ ] All links work (privacy policy, terms, external links)
- [ ] No placeholder text or "TODO" items
- [ ] No console errors or warnings

#### Content
- [ ] App name is correct
- [ ] Description is accurate
- [ ] Screenshots show actual app
- [ ] No misleading information
- [ ] Privacy policy is accessible
- [ ] Terms of service is accessible

#### Technical
- [ ] Production Supabase is configured
- [ ] Environment variables are set
- [ ] API keys are secure
- [ ] Error tracking is enabled
- [ ] Analytics is configured (if using)

#### Legal
- [ ] Privacy policy is complete
- [ ] Terms of service is complete
- [ ] Age rating is appropriate
- [ ] Content rating questionnaire completed

---

## 🚨 Common Rejection Reasons (Avoid These!)

### Apple App Store
- [ ] **Incomplete App** - All features must work
- [ ] **Crashes** - Must be stable
- [ ] **Missing Privacy Policy** - Required for data collection
- [ ] **Misleading Screenshots** - Must show actual app
- [ ] **Broken Links** - All URLs must work
- [ ] **Login Issues** - Provide demo account for reviewers
- [ ] **Guideline 4.3** - App must be unique, not a template

### Google Play Store
- [ ] **Privacy Policy Missing** - Required
- [ ] **Inappropriate Content** - User-generated content needs moderation
- [ ] **Crashes on Test Devices** - Must be stable
- [ ] **Misleading Description** - Must be accurate
- [ ] **Broken Functionality** - All features must work
- [ ] **Permissions** - Only request necessary permissions

---

## 💰 Estimated Costs

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

## ⏱️ Realistic Timeline

### Week 1: Core Features
- Day 1-2: Profile editing + delete account
- Day 3-5: Notifications system
- Day 6-7: UI improvements (notifications spec)

### Week 2: Legal & Infrastructure
- Day 1-2: Write privacy policy & terms
- Day 3-4: Set up production Supabase
- Day 5: Configure app.json and assets
- Day 6-7: Developer account setup

### Week 3: Testing
- Day 1-3: Comprehensive testing (all devices)
- Day 4-5: Fix bugs from testing
- Day 6-7: Beta testing setup

### Week 4: Launch Prep
- Day 1-2: Create screenshots and assets
- Day 3: Build production app
- Day 4: Submit to both stores
- Day 5-7: Wait for review, fix any issues

---

## 🎯 Launch Day Checklist

### When App Goes Live
- [ ] **Monitor Crash Reports** - Check Sentry/App Store Connect
- [ ] **Watch User Reviews** - Respond quickly
- [ ] **Check Analytics** - See user behavior
- [ ] **Be Ready for Bugs** - Have hotfix plan ready
- [ ] **Respond to Feedback** - Engage with users

### Marketing
- [ ] **Social Media Announcement** - Twitter, Instagram, Facebook
- [ ] **Email Existing Users** - If you have a list
- [ ] **Local Clubs Outreach** - Cycling, climbing, running clubs
- [ ] **University Sports Clubs** - Student organizations
- [ ] **App Store Optimization** - Monitor keywords and rankings

---

## 📊 Progress Tracking

### Current Status: ~75% Complete

**Completed:**
- ✅ Core features (activities, clubs, chat)
- ✅ Authentication and email verification
- ✅ Basic UI/UX
- ✅ Database structure

**In Progress:**
- 🔄 Notifications UI improvement (spec created)
- 🔄 Profile editing
- 🔄 Activity detail page

**Not Started:**
- ❌ Delete account
- ❌ Privacy policy & terms
- ❌ Production infrastructure
- ❌ Beta testing
- ❌ App store assets

---

## 🎬 Next Immediate Steps

### This Week (Week 1)
1. Execute notifications UI improvement spec (tasks 1-9)
2. Implement profile editing screen
3. Fix profile screen to show updates immediately
4. Add delete account functionality

### Next Week (Week 2)
5. Write privacy policy and terms of service
6. Set up production Supabase
7. Configure app.json for production
8. Create app icons and splash screens

### Week 3
9. Comprehensive testing on multiple devices
10. Set up beta testing (TestFlight + Play Internal)
11. Fix bugs from testing
12. Create app store screenshots

### Week 4
13. Build production app
14. Submit to App Store and Play Store
15. Wait for review
16. Launch! 🚀

---

## 📞 Support & Resources

### Documentation
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)

### Tools
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [App Store Screenshot Templates](https://www.figma.com/community/search?model_type=files&q=app%20store%20screenshots)
- [App Icon Generator](https://www.appicon.co/)

### Questions to Consider
1. **Target Market**: UK only or international?
2. **Monetization**: Free forever or future premium features?
3. **Content Moderation**: How will you handle inappropriate content?
4. **Support**: How will users get help? (Email, in-app, FAQ)
5. **Scaling**: What happens if you get 1000+ users quickly?

---

## ✅ Summary: Minimum Viable Launch

### Must Complete (22-30 hours):
1. Profile editing (2-3h)
2. Notifications system (4-6h)
3. Notifications UI improvement (4-6h)
4. Delete account (1-2h)
5. Privacy policy & terms (4-6h)
6. Comprehensive testing (8-10h)

### Should Complete (10-15 hours):
7. Production infrastructure setup (3-4h)
8. App configuration and assets (3-4h)
9. Beta testing (4-6h)

### Nice to Have (8-12 hours):
10. App store screenshots (3-4h)
11. Marketing materials (2-3h)
12. Error tracking setup (2-3h)

**Total: 40-57 hours of focused work = 4-6 weeks**

You're close! Focus on the critical items first, then iterate based on user feedback. Good luck! 🚀
