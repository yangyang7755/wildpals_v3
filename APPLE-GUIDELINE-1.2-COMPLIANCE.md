# Apple App Store Guideline 1.2 Compliance Checklist

## Guideline 1.2: User-Generated Content

**Requirement**: Apps with user-generated content or social networking services must include specific safety features.

---

## ✅ Compliance Status: FULLY COMPLIANT

### Your App's User-Generated Content

Wildpals includes the following user-generated content:
- ✅ Chat messages (activity chat, club chat)
- ✅ User profiles (name, bio, location)
- ✅ Activity descriptions and details
- ✅ Club names and descriptions

---

## Required Features & Implementation Status

### 1. ✅ Method for Filtering Objectionable Material

**Requirement**: "A method for filtering objectionable material from being posted to the app"

**Implementation**: Text Moderation System
- **Location**: `native/services/TextModerationService.ts`
- **Features**:
  - Profanity filter with configurable word list
  - Spam detection (excessive caps, repeated characters)
  - Real-time validation before message submission
  - Database-backed filter list (can be updated without app update)

**How it works**:
```typescript
// In ActivityChat.tsx and ClubChat.tsx
const validation = await TextModerationService.validateMessage(newMessage.trim());
if (!validation.valid) {
  Alert.alert('Message Not Allowed', validation.errorMessage);
  return;
}
```

**Evidence for Reviewers**:
- Try sending a message with profanity → Gets blocked
- Try sending "HELLO!!!!!!!" (excessive caps) → Gets blocked
- Try sending "aaaaaaa" (repeated chars) → Gets blocked

---

### 2. ✅ Mechanism to Report Offensive Content

**Requirement**: "A mechanism to report offensive content and timely responses to concerns"

**Implementation**: Comprehensive Reporting System
- **Location**: `native/services/ReportingService.ts`, `native/components/ReportModal.tsx`

**What can be reported**:
- ✅ Users (from profile or chat)
- ✅ Messages (from chat long-press menu)
- ✅ Activities (from activity detail page)

**Report categories**:
- Harassment or bullying
- Spam
- Inappropriate content
- Hate speech
- Dangerous activity
- Misleading information
- Fake profile
- Other

**How to report**:
1. **From User Profile**: Tap ⋯ menu → "Report User"
2. **From Chat**: Long-press message → "Report Message"
3. **From Activity**: Tap ⋯ menu → "Report Activity"

**Admin notification**:
- Reports are sent to admin email: yangyang.ruohan.liu@gmail.com
- Email includes all report details
- Admin can review and take action

**Evidence for Reviewers**:
- Navigate to any user profile → Tap ⋯ → See "Report User" option
- In any chat → Long-press message → See "Report Message" option
- View activity detail → Tap ⋯ → See "Report Activity" option

---

### 3. ✅ Ability to Block Abusive Users

**Requirement**: "The ability to block abusive users from the service"

**Implementation**: Bidirectional Blocking System
- **Location**: `native/services/BlockingService.ts`

**Where users can block**:
- ✅ From user profile (tap ⋯ menu → "Block User")
- ✅ From chat (long-press message → "Block User")
- ✅ When reporting (checkbox to "Also block user")

**What blocking does**:
- Prevents blocked user from sending messages
- Prevents blocked user from viewing your profile
- Hides blocked user's content from your view
- Bidirectional (both users can't see each other)
- Reversible (can unblock anytime)

**Block management**:
- Users can view blocked users list (Settings → Blocked Users)
- Users can unblock at any time

**Evidence for Reviewers**:
- Navigate to any user profile → Tap ⋯ → See "Block User" option
- In any chat → Long-press message → See "Block User" option
- Block a user → Their messages disappear immediately
- Blocked user cannot view your profile

---

### 4. ✅ Published Contact Information

**Requirement**: "Published contact information so users can easily reach you"

**Implementation**: Multiple Contact Points

**In-App Contact**:
- **Settings → Support**: Full support page with contact email
- **Settings → Privacy Policy**: Includes contact information
- **Settings → Terms of Service**: Includes contact information

**Contact Email**: yangyang.ruohan.liu@gmail.com

**Where contact info appears**:
1. Settings screen → "Support" option
2. Support screen → Displays email prominently
3. Privacy Policy → Contact section
4. Terms of Service → Contact section
5. App Store listing → Support URL

**Evidence for Reviewers**:
- Open app → Profile tab → Settings icon → "Support"
- See contact email clearly displayed
- Tap email to compose message

---

## Additional Safety Features (Beyond Requirements)

### Community Guidelines
- **Location**: Settings → Community Guidelines
- Explains acceptable behavior
- Lists prohibited content
- Describes consequences

### Email Verification
- All users must verify email before using app
- Prevents anonymous accounts
- Enables account recovery

### Privacy Controls
- Users control profile visibility
- Activity visibility settings
- Club privacy options

---

## App Store Connect Information

### App Review Notes

Include this in your App Store Connect submission:

```
SAFETY FEATURES COMPLIANCE (Guideline 1.2)

Wildpals includes user-generated content (chat messages, profiles, activities) 
and implements all required safety features:

1. CONTENT FILTERING:
   - Text moderation filters profanity and spam
   - Real-time validation before message posting
   - Try sending profanity or "AAAAAAA" to see blocking

2. REPORTING SYSTEM:
   - Report users: Profile → ⋯ menu → "Report User"
   - Report messages: Long-press message → "Report Message"
   - Report activities: Activity detail → ⋯ → "Report Activity"
   - Reports sent to: yangyang.ruohan.liu@gmail.com

3. BLOCKING SYSTEM:
   - Block users: Profile → ⋯ menu → "Block User"
   - Block from chat: Long-press message → "Block User"
   - Bidirectional blocking prevents all interaction
   - Manage blocks: Settings → Blocked Users

4. CONTACT INFORMATION:
   - In-app: Settings → Support
   - Email: yangyang.ruohan.liu@gmail.com
   - Also in Privacy Policy and Terms of Service

All features are fully functional and ready for testing.
```

---

## Testing Instructions for Apple Reviewers

### Test Content Filtering
1. Open any chat (activity or club)
2. Try typing a profanity word → Message blocked
3. Try typing "HELLO!!!!!!!" → Blocked (excessive caps)
4. Try typing "aaaaaaa" → Blocked (repeated chars)
5. Type normal message → Sends successfully

### Test Reporting
1. **Report User**:
   - Tap any user's name to view profile
   - Tap ⋯ menu in top right
   - Select "Report User"
   - Choose reason and submit

2. **Report Message**:
   - In any chat, long-press a message
   - Select "Report Message"
   - Choose reason and submit

3. **Report Activity**:
   - View any activity detail
   - Tap ⋯ menu in top right
   - Select "Report Activity"
   - Choose reason and submit

### Test Blocking
1. **Block from Profile**:
   - View any user's profile
   - Tap ⋯ menu
   - Select "Block User"
   - Confirm blocking
   - User is now blocked

2. **Block from Chat**:
   - In any chat, long-press a message
   - Select "Block User"
   - Confirm blocking
   - Messages disappear immediately

3. **Manage Blocks**:
   - Go to Profile tab
   - Tap Settings icon
   - Tap "Blocked Users"
   - See list of blocked users
   - Tap user to unblock

### Test Contact Information
1. Go to Profile tab
2. Tap Settings icon (⚙️)
3. Tap "Support"
4. See contact email: yangyang.ruohan.liu@gmail.com
5. Also check Privacy Policy and Terms for contact info

---

## Compliance Checklist for Submission

Before submitting to App Store, verify:

- [x] Text moderation is active and working
- [x] Profanity filter blocks inappropriate words
- [x] Spam detection blocks excessive caps and repeated chars
- [x] Report user option is accessible from profiles
- [x] Report message option is accessible from chats
- [x] Report activity option is accessible from activity details
- [x] Block user option is accessible from profiles
- [x] Block user option is accessible from chats
- [x] Blocking is bidirectional (both users affected)
- [x] Blocked users list is accessible in Settings
- [x] Contact email is displayed in Support screen
- [x] Contact email is in Privacy Policy
- [x] Contact email is in Terms of Service
- [x] All features work on real device
- [x] Demo account has sample data to test features

---

## Common Rejection Reasons & How You're Protected

### "App lacks content moderation"
✅ **Protected**: Text moderation filters profanity and spam in real-time

### "No way to report offensive content"
✅ **Protected**: Report buttons in profiles, chats, and activity details

### "Cannot block abusive users"
✅ **Protected**: Block option in profiles and chats, with management screen

### "No contact information"
✅ **Protected**: Email displayed in Support, Privacy Policy, and Terms

### "Features not easily discoverable"
✅ **Protected**: Clear ⋯ menus, long-press actions, Settings navigation

---

## Response to Potential Reviewer Questions

**Q: How do you moderate user-generated content?**
A: We use real-time text moderation that filters profanity and spam before messages are posted. Users can also report any content that violates our guidelines, and we review all reports promptly.

**Q: How quickly do you respond to reports?**
A: Reports are sent immediately to our admin email (yangyang.ruohan.liu@gmail.com) and we review them within 24 hours. Users can also block abusive users immediately for instant protection.

**Q: Can users protect themselves from harassment?**
A: Yes, users can block any user from their profile or from chat. Blocking is bidirectional and immediate - the blocked user cannot send messages or view the blocker's profile.

**Q: How do users contact you?**
A: Contact information is available in multiple places: Settings → Support, Privacy Policy, and Terms of Service. Our email is yangyang.ruohan.liu@gmail.com.

---

## Summary

Wildpals is **FULLY COMPLIANT** with Apple App Store Guideline 1.2:

✅ Content filtering (text moderation)
✅ Reporting mechanism (users, messages, activities)
✅ User blocking (bidirectional, reversible)
✅ Contact information (multiple locations)

All features are implemented, tested, and ready for App Store review.
