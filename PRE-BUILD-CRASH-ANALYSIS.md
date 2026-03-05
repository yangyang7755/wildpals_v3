# Pre-Build Crash Analysis - Wildpals App

## Analysis Date: March 4, 2026

## Summary
Comprehensive review of the Wildpals React Native app to identify potential crash issues before rebuilding for TestFlight.

---

## ✅ FIXED ISSUES (Already Resolved)

### 1. Supabase Configuration ✓
**Status:** FIXED
- **Issue:** `process.env` usage in production build causing "Invalid API key" errors
- **Fix Applied:** Updated `native/lib/supabase.ts` to use `Constants.expoConfig?.extra`
- **Verification:** Credentials properly configured in `app.json`
  - URL: `https://xikaltnufqbysnrsjzwa.supabase.co`
  - Anon Key: 208 characters (valid JWT format)

### 2. Environment Variables ✓
**Status:** VERIFIED
- **Check:** No `process.env` usage in native code
- **Result:** All server-side code only (not bundled in production)
- **Files Checked:** All `.ts` and `.tsx` files in `native/` directory

---

## ⚠️ POTENTIAL CRASH RISKS IDENTIFIED

### 1. NULL/UNDEFINED ACCESS - MEDIUM RISK

#### A. Explore.tsx - Activity Profiles
**Location:** `native/screens/Explore.tsx:62-65`
```typescript
profiles:organizer_id (
  full_name,
  email
)
```
**Risk:** If profile doesn't exist, `activity.profiles` could be null
**Impact:** Crash when accessing `activity.profiles?.full_name`
**Recommendation:** Add null checks before rendering organizer name

#### B. ActivityDetail.tsx - Activity Profiles
**Location:** `native/screens/ActivityDetail.tsx:45-48`
```typescript
profiles:organizer_id (
  full_name,
  email
)
```
**Risk:** Same as above - profile might not exist
**Impact:** Crash when displaying organizer information
**Recommendation:** Add fallback for missing profiles

#### C. Notifications.tsx - Join Request Data
**Location:** `native/screens/Notifications.tsx:95-100`
```typescript
requester:profiles!join_requests_requester_id_fkey(id, full_name),
activity:activities(id, title, date, time, type)
```
**Risk:** Foreign key relationships might return null if data deleted
**Impact:** Crash when rendering join requests
**Current Mitigation:** Has `.filter((item: any) => item.requester && item.activity)` ✓

### 2. ARRAY ACCESS - LOW RISK

#### A. Multiple Screens - Array Transformation
**Pattern Found In:**
- `ActivityDetail.tsx`
- `ClubDetail.tsx`
- `Notifications.tsx`

**Code Pattern:**
```typescript
const transformedData = data.map((item: any) => ({
  ...item,
  profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
}))
```
**Risk:** If `item.profiles` is an empty array, `item.profiles[0]` returns undefined
**Impact:** Potential crash when accessing profile properties
**Recommendation:** Add additional check for array length

### 3. DATE PARSING - LOW RISK

#### A. Date Filtering
**Location:** Multiple screens (Explore, ClubDetail, Profile)
```typescript
const today = new Date().toISOString().split('T')[0];
```
**Risk:** If date field is null or invalid format
**Impact:** Comparison might fail silently or crash
**Current Mitigation:** Database should enforce date format ✓

### 4. NAVIGATION PARAMETERS - LOW RISK

#### A. Route Parameters
**Pattern:**
```typescript
const { activityId } = route.params as { activityId: string };
```
**Risk:** If navigation doesn't pass required params
**Impact:** Crash when trying to load data with undefined ID
**Recommendation:** Add parameter validation at screen entry

---

## 🔍 SPECIFIC SCREEN ANALYSIS

### Explore Screen
- **Status:** MOSTLY SAFE
- **Issues:** 
  - Profile access needs null check
  - Club membership filtering looks solid
- **Recommendation:** Add `|| 'Unknown'` fallback for organizer names

### CreateActivity Screen
- **Status:** SAFE
- **Validation:** Good form validation before submission
- **No Issues Found**

### ActivityDetail Screen
- **Status:** NEEDS ATTENTION
- **Issues:**
  - Profile access at line 45-48
  - Route link opening (external URL)
- **Recommendation:** Add try-catch around `Linking.openURL`

### ActivityChat Screen
- **Status:** SAFE
- **Good Practices:**
  - Proper null checks on message data
  - Text moderation validation
  - Error handling in place

### Profile Screen
- **Status:** SAFE
- **Good Practices:**
  - Loading states handled
  - Empty states for no data
  - Proper array filtering

### ClubDetail Screen
- **Status:** MOSTLY SAFE
- **Issues:**
  - Array transformation pattern (line 150-160)
- **Recommendation:** Add length check before accessing array[0]

### Notifications Screen
- **Status:** SAFE
- **Good Practices:**
  - Filters out null data
  - Handles empty states
  - Proper error handling

---

## 🛡️ RECOMMENDED FIXES

### Priority 1: Add Null Checks for Profiles

**File:** `native/screens/Explore.tsx`
```typescript
// Line 280 - Add fallback
const organizerName = item.profiles?.full_name || 'Unknown Organizer';
```

**File:** `native/screens/ActivityDetail.tsx`
```typescript
// Line 150 - Add fallback
const organizerName = activity.profiles?.full_name || 'Unknown Organizer';
```

### Priority 2: Safe Array Access

**Pattern to Apply:**
```typescript
// Instead of:
profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles

// Use:
profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
  ? item.profiles[0] 
  : item.profiles
```

### Priority 3: Add Try-Catch for External Links

**File:** `native/screens/ActivityDetail.tsx`
```typescript
const openRouteLink = async () => {
  if (activity?.route_link) {
    try {
      const supported = await Linking.canOpenURL(activity.route_link);
      if (supported) {
        await Linking.openURL(activity.route_link);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  }
};
```

---

## 📊 RISK ASSESSMENT

| Category | Risk Level | Impact | Likelihood |
|----------|-----------|--------|------------|
| Supabase Config | ✅ FIXED | High | N/A |
| Profile Access | ⚠️ MEDIUM | Medium | Low |
| Array Access | ⚠️ LOW | Medium | Very Low |
| Date Parsing | ✅ SAFE | Low | Very Low |
| Navigation | ⚠️ LOW | Medium | Very Low |

---

## 🎯 OVERALL ASSESSMENT

**Crash Risk Level: LOW-MEDIUM**

The app is generally well-structured with good error handling practices. The main Supabase configuration issue has been fixed. Remaining risks are edge cases that are unlikely to occur in normal usage but should be addressed for production stability.

### Key Strengths:
1. ✅ Proper loading states throughout
2. ✅ Good empty state handling
3. ✅ Error boundaries in data fetching
4. ✅ Validation before database operations
5. ✅ Supabase credentials properly configured

### Areas for Improvement:
1. ⚠️ Add more defensive null checks for profile data
2. ⚠️ Safer array access patterns
3. ⚠️ External link handling with try-catch

---

## 🚀 RECOMMENDATION

**You can proceed with the rebuild**, but consider applying the Priority 1 fixes first for maximum stability. The current code should work for most use cases, but the suggested improvements will make it more robust against edge cases.

### Build Command:
```bash
eas build --platform ios --profile production --clear-cache
```

### After Build:
```bash
eas submit --platform ios --latest
```

---

## 📝 TESTING CHECKLIST

After deploying to TestFlight, test these scenarios:

1. ✅ Login/Signup flow
2. ✅ Browse activities (Explore screen)
3. ✅ Create new activity
4. ✅ Join activity request
5. ✅ Activity chat
6. ✅ Club browsing and joining
7. ✅ Club chat
8. ✅ Profile viewing (own and others)
9. ✅ Notifications
10. ✅ Settings and logout

---

## 🔧 BACKEND DEPENDENCIES

The app relies on these Supabase features:
- ✅ Authentication (email/password)
- ✅ Profiles table
- ✅ Activities table
- ✅ Join requests table
- ✅ Clubs and club members
- ✅ Chat messages (activity and club)
- ✅ Notifications table
- ✅ Real-time subscriptions (for chat)

All tables should have proper RLS (Row Level Security) policies configured.

---

## 📞 SUPPORT NOTES

If crashes still occur after rebuild:
1. Check Supabase logs for database errors
2. Review RLS policies for permission issues
3. Check for missing foreign key relationships
4. Verify all required tables exist
5. Test with fresh user account (no cached data)
