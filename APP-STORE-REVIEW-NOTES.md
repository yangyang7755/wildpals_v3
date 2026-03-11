# WildPals - App Store Review Notes

## Test Account Credentials

**Email:** reviewer@wildpals.app  
**Password:** ReviewTest2024!

**Important:** This test account is pre-configured with sample data including clubs, activities, and connections to demonstrate full app functionality.

**Note on Email Verification:**
- Email verification is enabled in the app
- The test account above is pre-verified for your convenience
- New users will receive verification emails (may take a few minutes to arrive)
- Verification emails may go to spam folder initially

---

## App Overview

WildPals is a social fitness platform that connects outdoor sports enthusiasts for cycling, climbing, and running activities. Users can create and join activities, form clubs, and build a community around their favorite outdoor sports.

**Target Audience:** Adults 18+ interested in outdoor sports and fitness activities  
**Primary Markets:** United Kingdom (London, Oxford), United States (Boston)

---

## Key Features to Review

### 1. User Authentication & Onboarding
- Email/password registration with email verification
- Profile setup with sport preferences (cycling, climbing, running)
- Age verification (18+ requirement)
- Location and bio information

### 2. Activity Discovery & Management
- Browse upcoming activities by sport type
- Filter by location, date, and sport
- Request to join activities (organizer approval required)
- Create new activities with detailed information
- Activity types: one-off, recurrent, multi-day events
- Real-time participant management

### 3. Club System
- Browse and join sports clubs
- Public and private club options
- Club-specific activities
- Member management with admin roles
- Club chat functionality

### 4. Social Features
- User profiles with activity history
- Direct messaging through activity/club chats
- User blocking and reporting system
- Content moderation for inappropriate messages

### 5. Safety & Moderation
- Report system for users, messages, and activities
- Block users to prevent unwanted interactions
- Text moderation for chat messages
- Age verification (18+ only)
- Privacy policy and terms of service

---

## Testing Flow

### Quick Start (5 minutes)
1. Launch app and log in with test credentials above
2. Navigate to "Explore" tab to see available activities
3. Tap any activity to view details
4. Navigate to "Clubs" tab to browse clubs
5. Check "Profile" tab to see user information
6. Test "Saved" tab to see joined activities

### Comprehensive Testing (15 minutes)

#### Activity Flow
1. Go to Explore tab
2. Filter activities by sport type (cycling/climbing/running)
3. Tap an activity to view full details
4. Request to join an activity
5. Check "Saved" tab → "Pending" to see your request
6. View activity chat (only visible after joining)

#### Club Flow
1. Go to Clubs tab
2. Browse available clubs
3. Tap a club to view details
4. View club members and activities
5. Request to join a club (if private)

#### Profile & Settings
1. Go to Profile tab
2. View completed activities
3. Tap Settings icon
4. Review privacy policy
5. Test blocking/reporting features

---

## Important Notes for Reviewers

### Age Restriction
- App requires users to be 18 years or older
- Age is collected during profile setup
- This is enforced to ensure user safety in outdoor activities

### Location Services
- App requests location permission for activity discovery
- Location is used to show nearby activities and clubs
- Users can manually enter location if they prefer

### Social Features
- All activities require organizer approval before joining
- Chat features are only available to activity/club members
- Users can report inappropriate content or behavior
- Blocking prevents all interactions between users

### Content Moderation
- Automated text moderation for chat messages
- Report system sends notifications to administrators
- Users can block others to prevent harassment

### Privacy & Data
- Email verification required for account security
- User data stored securely with Supabase
- Privacy policy accessible in Settings
- Users can manage their profile visibility

---

## Known Limitations

1. **Geographic Focus:** Currently optimized for UK and US markets (London, Oxford, Boston)
2. **Activity Types:** Limited to cycling, climbing, and running
3. **Language:** English only at this time
4. **Offline Mode:** Requires internet connection for full functionality

---

## Technical Information

**Platform:** React Native with Expo  
**Backend:** Supabase (PostgreSQL database, authentication, real-time features)  
**Minimum iOS Version:** iOS 13.0+  
**Bundle ID:** com.wildpals.app

---

## Support & Contact

**Developer:** WildPals Team  
**Support Email:** support@wildpals.app  
**Privacy Policy:** Available in-app (Settings → Privacy Policy)

---

## Compliance Notes

### Apple Guidelines Addressed

**Guideline 1.2 (User Safety):**
- Age verification (18+)
- User blocking and reporting system
- Content moderation for inappropriate messages
- Clear privacy policy

**Guideline 2.1 (App Completeness):**
- Fully functional app with test account
- All features accessible and working
- No placeholder content or broken features

**Guideline 4.0 (Design):**
- Native iOS design patterns
- Intuitive navigation
- Consistent user interface
- Accessibility considerations

**Guideline 5.1 (Privacy):**
- Clear privacy policy
- Transparent data collection
- User consent for location services
- Secure data storage

---

## Testing Checklist

- [ ] Sign in with test account
- [ ] Browse activities in Explore tab
- [ ] View activity details
- [ ] Browse clubs
- [ ] View club details
- [ ] Check user profile
- [ ] View saved/pending activities
- [ ] Test chat functionality
- [ ] Review privacy policy
- [ ] Test blocking feature
- [ ] Test reporting feature

---

## Additional Information

If you encounter any issues during review or need additional test accounts, please contact us at support@wildpals.app. We're committed to providing a safe, engaging platform for outdoor sports enthusiasts.

Thank you for reviewing WildPals!
