# Android Release Guide for Wildpals

## Prerequisites

- EAS CLI installed: `npm install -g eas-cli`
- Expo account (same one used for iOS)
- Google Play Console account ($25 one-time fee)

## Step 1: Configure Android Build

Your `app.json` already has most settings. Verify these:

```json
{
  "expo": {
    "android": {
      "package": "com.wildpals.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

## Step 2: Create Android Icons

Android needs different icon formats than iOS:

**Required:**
- `icon.png` - 1024x1024px (already have)
- `adaptive-icon.png` - 1024x1024px with safe zone (center 66%)

**Create adaptive-icon.png:**
- Use your existing icon
- Ensure important content is in center 66% (684x684px area)
- Outer edges may be cropped on some devices

## Step 3: Configure EAS Build for Android

Your `eas.json` should include Android:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## Step 4: Build Android APK/AAB

**For testing (APK):**
```bash
eas build --platform android --profile preview
```

**For Google Play (AAB):**
```bash
eas build --platform android --profile production
```

Build takes 10-20 minutes. You'll get a download link when done.

## Step 5: Set Up Google Play Console

1. **Create App:**
   - Go to: https://play.google.com/console
   - Click "Create app"
   - App name: "Wildpals"
   - Default language: English (US)
   - App type: App
   - Category: Health & Fitness
   - Click "Create app"

2. **Set Up App Content:**
   - Privacy Policy URL: (your website URL)
   - App access: All functionality available without restrictions
   - Ads: No (unless you have ads)
   - Content rating: Complete questionnaire (likely PEGI 3 or Everyone)
   - Target audience: 18+
   - Data safety: Complete form about data collection

3. **Store Listing:**
   - App name: Wildpals
   - Short description (80 chars): "Connect with outdoor sports enthusiasts for cycling, climbing, running & social events"
   - Full description (4000 chars):
   ```
   Wildpals brings together outdoor sports enthusiasts for cycling, climbing, running, and social gatherings.

   FEATURES:
   • Find and join local outdoor activities
   • Create your own events and meet like-minded people
   • Join clubs for regular meetups
   • Chat with participants
   • Track your joined activities
   • Discover new routes and locations

   ACTIVITIES:
   • Cycling: Road, gravel, MTB, track rides
   • Climbing: Indoor & outdoor climbing sessions
   • Running: Road, trail, track runs
   • Social: Coffee meetups, dinners, casual hangouts

   Whether you're looking for training partners, casual rides, or new friends who share your passion for the outdoors, Wildpals makes it easy to connect and get active together.

   Join the community today!
   ```

4. **Screenshots (Required):**
   - Phone: At least 2 screenshots (1080x1920px or similar)
   - Tablet (optional): 7" and 10" screenshots
   - Take screenshots from Android emulator or device

5. **Graphic Assets:**
   - Feature graphic: 1024x500px banner
   - App icon: 512x512px (will be generated from your icon.png)

## Step 6: Upload Build to Google Play

**Option A: Manual Upload**
1. Download AAB from EAS build
2. Go to Google Play Console → Production → Create new release
3. Upload AAB file
4. Add release notes
5. Save (don't publish yet)

**Option B: Automatic with EAS Submit**
```bash
# First, create service account in Google Cloud Console
# Download JSON key file
# Save as google-play-service-account.json

eas submit --platform android --profile production
```

## Step 7: Complete Pre-Launch Checklist

**Content Rating:**
- Complete questionnaire
- Get rating certificate

**Data Safety:**
- Declare data collection practices
- Privacy policy required

**App Content:**
- Target audience: 18+
- News apps: No
- COVID-19 contact tracing: No
- Data safety form: Complete

**Store Listing:**
- All required fields filled
- Screenshots uploaded
- Descriptions complete

## Step 8: Testing Track (Recommended)

Before public release, use Internal Testing:

1. Go to Testing → Internal testing
2. Create new release
3. Upload AAB
4. Add testers (email addresses)
5. Testers get link to download and test
6. Collect feedback
7. Fix issues
8. Promote to Production when ready

## Step 9: Submit for Review

1. Go to Production → Create new release
2. Upload AAB (or promote from testing)
3. Add release notes:
   ```
   Initial release of Wildpals!
   
   Features:
   - Find and join outdoor activities
   - Create cycling, climbing, running, and social events
   - Join clubs and communities
   - Chat with participants
   - Track your activities
   ```
4. Click "Review release"
5. Click "Start rollout to Production"

**Review time:** Usually 1-3 days (faster than iOS)

## Step 10: App Signing

Google Play requires app signing. Two options:

**Option A: Google Play App Signing (Recommended)**
- Google manages signing keys
- Easier and more secure
- Select this during first upload

**Option B: Manual Signing**
- You manage keystore
- More complex
- Not recommended for beginners

## Android vs iOS Differences

| Aspect | iOS | Android |
|--------|-----|---------|
| Review time | 1-3 days | 1-3 days |
| Cost | $99/year | $25 one-time |
| Build time | 20-30 min | 10-20 min |
| Testing | TestFlight | Internal testing |
| Updates | Slower rollout | Faster rollout |
| Approval | Stricter | More lenient |

## Common Issues

### Build Fails
- Check `eas.json` configuration
- Verify `app.json` has correct package name
- Check for Android-specific dependencies

### App Rejected
- Privacy policy missing
- Content rating incomplete
- Data safety form not filled
- Screenshots don't match app

### Deep Links Not Working
- Add intent filters in `app.json`:
```json
{
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "data": [
          {
            "scheme": "wildpals"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

## Post-Release

**Monitor:**
- Crashes in Google Play Console
- User reviews and ratings
- Download statistics

**Update Process:**
1. Increment `versionCode` in `app.json`
2. Build new version: `eas build --platform android`
3. Upload to Google Play
4. Add release notes
5. Rollout (can do staged rollout: 10% → 50% → 100%)

## Quick Commands Reference

```bash
# Build for testing
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android

# Build both iOS and Android
eas build --platform all

# Check build status
eas build:list
```

## Estimated Timeline

- **Setup:** 2-3 hours (first time)
- **Build:** 10-20 minutes
- **Store listing:** 1-2 hours
- **Review:** 1-3 days
- **Total:** ~1 week for first release

## Cost Breakdown

- Google Play Developer Account: $25 (one-time)
- EAS Build: Free tier (limited builds) or $29/month
- Total minimum: $25

## Tips

1. **Test thoroughly** on Android devices (different from iOS)
2. **Use Internal Testing** before public release
3. **Staged rollout** for updates (10% → 50% → 100%)
4. **Monitor crashes** in Google Play Console
5. **Respond to reviews** to improve ratings
6. **Update regularly** (monthly or as needed)

## Next Steps After Android Release

1. Monitor both iOS and Android for issues
2. Collect user feedback
3. Plan feature updates
4. Consider cross-platform testing
5. Track metrics (downloads, retention, engagement)

Good luck with your Android release! 🚀
