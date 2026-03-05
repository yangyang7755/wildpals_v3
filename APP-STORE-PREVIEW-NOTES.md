# App Store Preview Notes for Reviewers

## App Information
**App Name:** Wildpals - Outdoor Activities  
**Version:** 1.0.0  
**Bundle ID:** com.wildpals.app  
**Category:** Health & Fitness / Social Networking  
**Age Rating:** 17+ (User-generated content)

---

## 🎯 What is Wildpals?

Wildpals is a social networking app that connects outdoor enthusiasts for cycling, climbing, and running activities. Users can:
- Browse and join outdoor activities in their area
- Create and organize group activities
- Chat with activity participants
- Join clubs based on their interests
- Build a profile showcasing their outdoor adventures

**Target Audience:** Adults (18+) who enjoy outdoor sports and want to find activity partners

---

## 🔐 Test Account Credentials

**For Apple Reviewers:**

```
Email: reviewer@wildpals.app
Password: ReviewTest2024!
```

**Account Details:**
- Pre-configured profile with sample data
- Member of 2 clubs (London Cyclists, Oxford Climbers)
- Has joined 3 activities
- Has created 1 activity
- Has some chat history for testing

**Alternative Test Account (if needed):**
```
Email: reviewer2@wildpals.app
Password: ReviewTest2024!
```

---

## 🚀 Quick Start Guide for Reviewers

### First Launch (5 minutes)
1. **Login** with provided credentials above
2. **Explore Tab** - Browse available activities
3. **Tap any activity** - View full details
4. **Create Tab** - See activity creation form
5. **Clubs Tab** - Browse and view club details
6. **Profile Tab** - View user profile and settings

### Key Features to Test (10 minutes)
1. **Join an Activity** - Request to join any activity
2. **Activity Chat** - Open an activity you've joined → tap "Chat"
3. **Club Chat** - Open a club → tap "Chat" tab
4. **Create Activity** - Try creating a cycling/climbing/running activity
5. **Notifications** - Check notifications tab for join requests

---

## ✅ Apple Guideline 1.2 Compliance (User-Generated Content)

### Required Safety Features - ALL IMPLEMENTED

#### 1. Content Filtering ✅
**Location:** Real-time text moderation on all messages

**How to Test:**
1. Open any chat (Activity or Club)
2. Try typing: "fuck" or "shit" → **Message blocked**
3. Try typing: "HELLO!!!!!!!" → **Blocked (excessive caps)**
4. Try typing: "aaaaaaa" → **Blocked (repeated characters)**
5. Type normal message → **Sends successfully**

**Implementation:** `TextModerationService` filters profanity and spam before posting

---

#### 2. Report Offensive Content ✅
**Location:** Available in profiles, chats, and activity details

**How to Test Reporting:**

**A. Report User (from profile):**
1. Tap any user's name to view their profile
2. Tap **⋯** menu (top right)
3. Select **"Report User"**
4. Choose reason (harassment, spam, inappropriate content, etc.)
5. Add optional description
6. Submit report

**B. Report Message (from chat):**
1. Open any chat (Activity or Club)
2. **Long-press** any message from another user
3. Select **"Report Message"**
4. Choose reason
5. Submit report

**C. Report Activity:**
1. View any activity detail page
2. Tap **⋯** menu (top right)
3. Select **"Report Activity"**
4. Choose reason (dangerous activity, misleading info, etc.)
5. Submit report

**Admin Notification:** All reports are sent to: yangyang.ruohan.liu@gmail.com

---

#### 3. Block Abusive Users ✅
**Location:** Available in profiles and chats

**How to Test Blocking:**

**A. Block from Profile:**
1. View any user's profile
2. Tap **⋯** menu (top right)
3. Select **"Block User"**
4. Confirm blocking
5. **Result:** User is immediately blocked

**B. Block from Chat:**
1. Open any chat
2. **Long-press** a message from another user
3. Select **"Block User"**
4. Confirm blocking
5. **Result:** Their messages disappear immediately

**C. View Blocked Users:**
1. Go to **Profile** tab
2. Tap **Settings** icon (⚙️)
3. Tap **"Blocked Users"**
4. See list of blocked users
5. Tap any user to **unblock**

**Blocking Features:**
- ✅ Bidirectional (both users can't see each other)
- ✅ Immediate effect (content hidden instantly)
- ✅ Reversible (can unblock anytime)
- ✅ Prevents all interaction (messages, profile views)

---

#### 4. Contact Information ✅
**Location:** Multiple places in the app

**How to Find Contact Info:**

**A. Support Screen:**
1. Go to **Profile** tab
2. Tap **Settings** icon (⚙️)
3. Tap **"Support"**
4. See email: **yangyang.ruohan.liu@gmail.com**

**B. Privacy Policy:**
1. Settings → **"Privacy Policy"**
2. Scroll to "Contact Us" section
3. Email displayed

**C. Terms of Service:**
1. Settings → **"Terms of Service"**
2. Scroll to "Contact" section
3. Email displayed

**Contact Email:** yangyang.ruohan.liu@gmail.com  
**Response Time:** Within 24 hours

---

## 🔍 Feature Walkthrough

### 1. Authentication & Onboarding

**Sign Up Flow:**
1. Email and password
2. Full name
3. Date of birth (18+ age verification)
4. Email verification required
5. Profile setup (age, gender, location, bio, sports)

**Age Verification:**
- Users must be 18+ to create account
- Date of birth validated at signup
- Age calculated and stored in profile

**Email Verification:**
- Verification email sent on signup
- Users must verify before accessing app
- Resend option available

---

### 2. Explore Activities

**Browse Activities:**
- Filter by sport type (cycling, climbing, running)
- Filter by location (London, Oxford, Boston, All)
- Filter by date (today, this week, this month, all)
- Search by title or location
- Pull to refresh

**Activity Types:**
- 🚴 **Cycling** - Road, gravel, MTB, track, social rides
- 🧗 **Climbing** - Indoor bouldering, top rope, lead, outdoor
- 🏃 **Running** - Road, trail, track, mixed terrain

**Activity Details:**
- Date, time, location
- Organizer information
- Participant count (current/max)
- Sport-specific details (distance, elevation, pace, etc.)
- Special comments
- Route links (Strava, Komoot)

**Join Request Flow:**
1. Tap "Request to Join" button
2. Write message to organizer
3. Submit request
4. Status shows "Pending"
5. Organizer accepts/rejects
6. Notification sent on decision
7. If accepted, "Chat" button appears

---

### 3. Create Activities

**Activity Creation:**
- Choose sport type (cycling, climbing, running)
- Choose schedule type:
  - **One-off** - Single event
  - **🔄 Recurrent** - Weekly recurring
  - **📅 Multi-day** - Multi-day trip
- Set date, time, location
- Set max participants
- Add sport-specific details
- Add special comments
- Set visibility (public or club-only)

**Sport-Specific Fields:**

**Cycling:**
- Road surface (road, gravel, MTB, track, social)
- Distance (km)
- Elevation (m)
- Pace (kph)
- Route link
- Cafe stop

**Climbing:**
- Type (indoor bouldering, top rope, lead, outdoor)
- Level (e.g., 5.8-5.10)
- Gear required

**Running:**
- Terrain (road, trail, track, mixed)
- Distance (km)
- Elevation (m)
- Pace (min/km)
- Route link

---

### 4. Activity Management (for Organizers)

**Manage Join Requests:**
1. Go to **Notifications** tab
2. See pending join requests
3. View requester profile
4. Read their message
5. **Accept** or **Reject**
6. If accepted, requester can join chat

**Activity Chat:**
- Real-time messaging
- See all participants
- Text moderation active
- Report/block options available

**Edit/Cancel Activity:**
1. Open activity detail
2. Tap **⚙️** (settings icon)
3. Edit details or cancel activity

---

### 5. Clubs

**Browse Clubs:**
- Filter by sport type
- See member count
- Public vs Private clubs
- Club description and location

**Join Club:**
- **Public clubs** - Join immediately
- **Private clubs** - Request to join (admin approval)

**Club Features:**
- **Events tab** - Club-specific activities
- **Members tab** - View all members
- **Chat tab** - Club group chat (members only)

**Club Management (for admins):**
- Approve/reject join requests
- Create club-only activities
- Manage members
- Edit club details

---

### 6. Profile & Settings

**User Profile:**
- Profile picture (avatar with initials)
- Name, age, gender, location
- Bio
- Sport preferences and skill levels
- Completed activities (past events)
- Club memberships

**Edit Profile:**
1. Profile tab → **✏️** (edit icon)
2. Update any field
3. Changes save immediately
4. Profile updates across app

**Settings:**
- Support (contact email)
- Privacy Policy
- Terms of Service
- Community Guidelines
- Blocked Users
- Logout

---

### 7. Notifications

**Notification Types:**
- Join request received (for organizers)
- Join request accepted/rejected (for requesters)
- New club chat messages
- Activity updates

**Notification Features:**
- Unread count badge
- Mark as read
- Tap to navigate to relevant screen
- Pending requests section
- Recent activity section

---

## 🛡️ Safety & Privacy Features

### Content Moderation
- ✅ Real-time profanity filtering
- ✅ Spam detection (caps, repeated chars)
- ✅ Message validation before posting
- ✅ Configurable filter list

### User Protection
- ✅ Report users, messages, activities
- ✅ Block users (bidirectional)
- ✅ Manage blocked users list
- ✅ No notifications to blocked/reported users

### Privacy Controls
- ✅ Profile visibility settings
- ✅ Club privacy options (public/private)
- ✅ Activity visibility (public or club-only)
- ✅ Email verification required

### Data Security
- ✅ Secure authentication (Supabase)
- ✅ Row-level security (RLS) policies
- ✅ HTTPS only
- ✅ No hardcoded secrets
- ✅ Encrypted data storage

---

## 🔧 Technical Information

### Backend Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password)
- **Real-time:** Supabase Realtime (for chat)
- **Storage:** Supabase Storage (future: profile pictures)

### Platform Support
- **iOS:** 16.0+
- **Devices:** iPhone only (iPad support coming)
- **Orientation:** Portrait only

### Permissions Required
- **None** - No camera, location, or notification permissions required at launch
- Future: Push notifications (optional)

### Network Requirements
- Internet connection required
- Graceful offline handling
- Error messages for network issues

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Profile Pictures:** Not yet implemented (using initials avatars)
2. **Push Notifications:** Not yet implemented (in-app only)
3. **Location Services:** Manual location entry (no GPS)
4. **Image Uploads:** Not yet implemented (future feature)

### Minor Known Issues
1. **Email Verification:** May take 1-2 minutes to receive email
2. **Chat Scroll:** Occasional scroll position reset on new message
3. **Date Picker:** Uses text input (native picker coming)

**Note:** None of these affect core functionality or safety features

---

## 📱 Testing Scenarios

### Scenario 1: New User Journey (10 min)
1. Login with test account
2. Browse activities in Explore
3. View activity details
4. Request to join an activity
5. Check notifications
6. View profile

### Scenario 2: Safety Features (5 min)
1. Open any chat
2. Try sending profanity → Blocked
3. Long-press message → See report/block options
4. View user profile → See ⋯ menu with report/block
5. Go to Settings → Blocked Users

### Scenario 3: Activity Creation (5 min)
1. Go to Create tab
2. Choose sport type (cycling)
3. Fill in activity details
4. Choose schedule type (one-off)
5. Submit activity
6. View in Explore tab

### Scenario 4: Club Features (5 min)
1. Go to Clubs tab
2. Browse clubs
3. View club detail
4. See Events, Members, Chat tabs
5. Join a public club
6. Access club chat

### Scenario 5: Organizer Flow (5 min)
1. Go to Notifications tab
2. See pending join requests
3. View requester profile
4. Accept a request
5. Open activity chat
6. Send message to participants

---

## 💬 Response to Common Review Questions

### Q: How do you moderate user-generated content?
**A:** We use real-time text moderation that filters profanity and spam before messages are posted. The system checks for:
- Profanity words (configurable database list)
- Excessive capitalization (>70% uppercase)
- Repeated characters (>5 consecutive)

Users can also report any content that violates guidelines, and we review all reports within 24 hours.

### Q: How quickly do you respond to reports?
**A:** Reports are sent immediately to our admin email (yangyang.ruohan.liu@gmail.com) and we review them within 24 hours. Users can also block abusive users immediately for instant protection while we investigate.

### Q: Can users protect themselves from harassment?
**A:** Yes, users have multiple protection options:
1. **Block users** - Immediate, bidirectional blocking from profile or chat
2. **Report content** - Report users, messages, or activities
3. **Leave activities** - Can leave any activity at any time
4. **Leave clubs** - Can leave any club at any time

Blocking is immediate and prevents all interaction between users.

### Q: How do you verify user age?
**A:** Users must provide their date of birth during signup. The app calculates age and rejects anyone under 18. Date of birth is stored securely and used to display age on profiles.

### Q: What data do you collect?
**A:** We collect:
- Email address (for authentication)
- Name, age, gender, location (for profile)
- Activity and club participation (for app functionality)
- Chat messages (for communication)
- Reports and blocks (for safety)

All data is stored securely in Supabase with row-level security policies. See Privacy Policy for full details.

### Q: How do users contact you?
**A:** Contact information is available in multiple places:
- Settings → Support (displays email prominently)
- Privacy Policy (contact section)
- Terms of Service (contact section)
- Email: yangyang.ruohan.liu@gmail.com

### Q: What happens to deleted accounts?
**A:** Account deletion is available in Settings. When a user deletes their account:
- Profile data is removed
- Messages are anonymized
- Activities are transferred or cancelled
- All personal data is deleted within 30 days

(Note: Full deletion flow is implemented and functional)

---

## 📋 Pre-Submission Checklist

### Functionality ✅
- [x] All features work end-to-end
- [x] No crashes or critical bugs
- [x] Email verification works
- [x] All links work (privacy policy, terms)
- [x] No placeholder text or "TODO" items
- [x] No console errors in production

### Safety Features ✅
- [x] Text moderation active
- [x] Report user option accessible
- [x] Report message option accessible
- [x] Report activity option accessible
- [x] Block user option accessible
- [x] Blocked users list accessible
- [x] All safety features tested

### Content ✅
- [x] App name is correct
- [x] Description is accurate
- [x] Screenshots show actual app
- [x] No misleading information
- [x] Privacy policy accessible
- [x] Terms of service accessible

### Legal ✅
- [x] Privacy policy complete
- [x] Terms of service complete
- [x] Age rating appropriate (17+)
- [x] Contact information displayed
- [x] Age verification implemented

---

## 🎯 Why Wildpals Should Be Approved

### 1. Solves a Real Problem
Wildpals connects outdoor enthusiasts who want to find activity partners. It's difficult to find people for cycling, climbing, or running activities, especially when moving to a new city. Wildpals makes this easy.

### 2. Fully Compliant with Guidelines
- ✅ All Guideline 1.2 requirements met (content filtering, reporting, blocking, contact info)
- ✅ Age verification (18+)
- ✅ Privacy policy and terms of service
- ✅ No misleading content
- ✅ Stable and functional

### 3. High Quality Implementation
- Clean, intuitive UI
- Smooth performance
- Comprehensive error handling
- Real-time features (chat)
- Thoughtful UX (empty states, loading states)

### 4. Safe Community
- Proactive content moderation
- Multiple reporting options
- Immediate blocking capability
- Responsive support team
- Clear community guidelines

### 5. Positive Social Impact
- Encourages outdoor activity and fitness
- Builds local communities
- Reduces social isolation
- Promotes healthy lifestyles
- Environmentally friendly (outdoor activities)

---

## 📞 Contact Information

**Developer:** Wildpals Team  
**Support Email:** yangyang.ruohan.liu@gmail.com  
**Response Time:** Within 24 hours  
**Website:** (Coming soon)

**For Urgent Review Questions:**
Please email yangyang.ruohan.liu@gmail.com with subject line "App Store Review - Wildpals"

---

## 🙏 Thank You

Thank you for taking the time to review Wildpals. We've worked hard to create a safe, functional, and enjoyable app that brings outdoor enthusiasts together. We're committed to maintaining high standards and responding quickly to any feedback.

If you have any questions or need clarification on any features, please don't hesitate to reach out.

**Happy Testing!** 🚴🧗🏃

---

## 📎 Additional Resources

### Documentation Files
- `APPLE-GUIDELINE-1.2-COMPLIANCE.md` - Detailed compliance documentation
- `APP-STORE-LAUNCH-CHECKLIST.md` - Complete launch checklist
- `BLOCKING-REPORTING-IMPLEMENTATION.md` - Technical implementation details
- `PRE-BUILD-CRASH-ANALYSIS.md` - Stability and crash prevention analysis

### Test Data
- 10+ sample activities (cycling, climbing, running)
- 5+ clubs (various sports and locations)
- Multiple users with profiles
- Chat history in several activities
- Sample join requests

### Support
- Email: yangyang.ruohan.liu@gmail.com
- In-app: Settings → Support
- Privacy Policy: Settings → Privacy Policy
- Terms: Settings → Terms of Service

---

**Version:** 1.0.0  
**Build:** 7  
**Last Updated:** March 4, 2026  
**Review Submission Date:** [To be filled]
