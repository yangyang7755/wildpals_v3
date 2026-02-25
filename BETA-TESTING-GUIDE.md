# Beta Testing Guide for Wildpals

## Option 1: Expo Go (Easiest - 5 minutes) ⭐ RECOMMENDED

**Best for**: Quick testing with 5-10 people, no app store needed

### Setup Steps:

1. **Make sure your app is running locally**
   ```bash
   npm start
   # or
   npx expo start
   ```

2. **Share the QR code or link**
   - When Expo starts, you'll see a QR code in the terminal
   - Testers scan the QR code with:
     - **iOS**: Camera app (opens in Expo Go)
     - **Android**: Expo Go app
   
3. **Or use Expo's tunnel mode for remote testing**
   ```bash
   npx expo start --tunnel
   ```
   This creates a public URL that works anywhere (not just your local network)

### Tester Instructions:
1. Download "Expo Go" app from App Store or Play Store
2. Scan the QR code you send them
3. App loads instantly - no installation needed!

**Pros:**
- ✅ Instant sharing
- ✅ No build process
- ✅ Updates instantly when you make changes
- ✅ Works on iOS and Android

**Cons:**
- ❌ Requires Expo Go app
- ❌ Your computer must be running
- ❌ Some native features may not work
- ❌ Not the "real" app experience

---

## Option 2: EAS Update (Better - 30 minutes)

**Best for**: More professional testing, works without your computer running

### Setup Steps:

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Create a development build**
   ```bash
   # For iOS
   eas build --profile development --platform ios
   
   # For Android
   eas build --profile development --platform android
   ```
   This takes 10-20 minutes

4. **Share the build**
   - EAS gives you a link to download the app
   - Share this link with testers
   - They install it like a regular app

5. **Push updates instantly**
   ```bash
   eas update --branch development
   ```
   Testers get updates without reinstalling!

**Pros:**
- ✅ Real app experience
- ✅ Works without your computer
- ✅ Push updates instantly
- ✅ More professional

**Cons:**
- ❌ Initial build takes time
- ❌ iOS requires Apple Developer account ($99/year)
- ❌ Android requires signing key setup

---

## Option 3: TestFlight (iOS) + Internal Testing (Android) - Most Professional

**Best for**: Serious beta testing before launch

### iOS - TestFlight

1. **Need Apple Developer account** ($99/year)

2. **Build for TestFlight**
   ```bash
   eas build --profile production --platform ios
   eas submit --platform ios
   ```

3. **Add testers in App Store Connect**
   - Go to App Store Connect
   - Add tester emails
   - They get invite link
   - Can have up to 10,000 testers

4. **Testers download TestFlight app**
   - Install from App Store
   - Accept your invite
   - Install Wildpals

### Android - Google Play Internal Testing

1. **Need Google Play Console** ($25 one-time)

2. **Build for Play Store**
   ```bash
   eas build --profile production --platform android
   eas submit --platform android
   ```

3. **Create internal testing track**
   - Go to Google Play Console
   - Create internal testing release
   - Add tester emails

4. **Testers get link to install**
   - No special app needed
   - Install directly from Play Store

**Pros:**
- ✅ Most professional
- ✅ Real app store experience
- ✅ Crash reporting
- ✅ Feedback collection
- ✅ Automatic updates

**Cons:**
- ❌ Costs money ($99 + $25)
- ❌ Takes longer to set up
- ❌ Review process (1-2 days)

---

## Option 4: Expo Snack (Web Preview - 2 minutes)

**Best for**: Quick demo, not full testing

### Setup:
1. Go to https://snack.expo.dev
2. Copy your code
3. Share the Snack URL

**Pros:**
- ✅ Instant
- ✅ No installation
- ✅ Works in browser

**Cons:**
- ❌ Limited functionality
- ❌ Not real app
- ❌ Can't test native features

---

## 🎯 RECOMMENDED APPROACH FOR YOU

### Phase 1: Quick Testing (This Week)
**Use Expo Go with tunnel mode**

```bash
# Start with tunnel
npx expo start --tunnel
```

Share the link with 3-5 friends:
- "Hey, download Expo Go and open this link: exp://..."
- They can test immediately
- You can fix bugs and they see updates instantly

### Phase 2: Serious Testing (Next Week)
**Use EAS Development Build**

```bash
# Build once
eas build --profile development --platform all

# Share the download link
# Push updates anytime with:
eas update --branch development
```

### Phase 3: Pre-Launch (Week 3-4)
**Use TestFlight + Internal Testing**
- Set up proper beta testing
- Collect feedback
- Prepare for launch

---

## Quick Start: Share Your App NOW (5 minutes)

1. **Make sure app is running**
   ```bash
   cd /path/to/wildpals
   npx expo start --tunnel
   ```

2. **You'll see output like:**
   ```
   Metro waiting on exp://192.168.1.x:8081
   
   › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
   
   › Using Expo Go
   › Press s │ switch to development build
   › Press a │ open Android
   › Press i │ open iOS simulator
   › Press w │ open web
   
   › Press r │ reload app
   › Press m │ toggle menu
   › Press ? │ show all commands
   
   Logs for your project will appear below. Press Ctrl+C to exit.
   ```

3. **Share with testers:**
   - Take screenshot of QR code
   - Or copy the `exp://` URL
   - Send via WhatsApp/Email/Slack

4. **Tester instructions:**
   ```
   1. Download "Expo Go" from App Store or Play Store
   2. Open Expo Go
   3. Tap "Scan QR Code" or enter the URL
   4. App loads!
   ```

---

## Troubleshooting

### "Can't connect to Metro"
- Make sure you're using `--tunnel` mode
- Check firewall settings
- Try restarting: `npx expo start --tunnel --clear`

### "App crashes on Expo Go"
- Some features may not work in Expo Go
- Use EAS development build instead

### "Testers can't scan QR code"
- Share the `exp://` URL directly
- Make sure they have Expo Go installed
- Try tunnel mode if on different networks

---

## Cost Comparison

| Method | Cost | Time to Setup | Best For |
|--------|------|---------------|----------|
| Expo Go | Free | 5 min | Quick testing |
| EAS Development | Free* | 30 min | Better testing |
| TestFlight | $99/year | 2-3 days | iOS beta |
| Play Internal | $25 once | 1-2 days | Android beta |

*EAS has free tier with limited builds

---

## Next Steps

1. **Today**: Share via Expo Go tunnel
2. **This week**: Get feedback from 5 testers
3. **Next week**: Set up EAS development build
4. **Week 3**: Apply for Apple Developer + Google Play
5. **Week 4**: TestFlight + Internal Testing beta

---

## Example Message to Send Testers

```
Hey! 👋

I'm building Wildpals - an app to find outdoor activity partners (cycling, climbing, running).

Would love your feedback! Here's how to test:

1. Download "Expo Go" app:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Open Expo Go and scan this QR code:
   [attach QR code screenshot]
   
   Or enter this URL: exp://[your-url]

3. Play around and let me know what you think!

Things to test:
- Sign up and create profile
- Browse activities
- Create an activity
- Join a club
- Send messages

Thanks! 🙏
```

---

## Pro Tips

1. **Keep a testing log**: Track who tested, what device, what bugs they found
2. **Use a shared doc**: Google Doc for feedback collection
3. **Set expectations**: Tell testers it's beta, bugs are expected
4. **Respond quickly**: Fix critical bugs within 24 hours
5. **Thank testers**: They're helping you for free!

---

## Resources

- [Expo Go Documentation](https://docs.expo.dev/get-started/expo-go/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [TestFlight Guide](https://developer.apple.com/testflight/)
- [Google Play Internal Testing](https://support.google.com/googleplay/android-developer/answer/9845334)
