# Local Xcode Build Guide

## Step 1: Generate Native iOS Project

Run this command to create the native iOS project:

```bash
npx expo prebuild --platform ios --clean
```

This will:
- Create an `ios/` folder with native Xcode project
- Generate all necessary native files
- Set up the app icon asset catalog properly

## Step 2: Open in Xcode

```bash
open ios/wildpals.xcworkspace
```

**IMPORTANT:** Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

## Step 3: Configure Signing in Xcode

1. In Xcode, select the "wildpals" project in the left sidebar
2. Select the "wildpals" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Apple Developer Team from the dropdown
6. Verify Bundle Identifier is: `com.wildpals.app`

## Step 4: Verify App Icon

1. Still in the "wildpals" target
2. Go to "General" tab
3. Scroll to "App Icons and Launch Screen"
4. Verify "AppIcon" is selected in the dropdown
5. Click on the icon to open Assets.xcassets
6. You should see all icon sizes (120x120, 180x180, etc.)

If icons are missing:
- The prebuild should have generated them automatically
- If not, you may need to manually add the 1024x1024 icon to the asset catalog

## Step 5: Update Version/Build Number

In Xcode, under "General" tab:
- Version: 1.0.0
- Build: 7 (or increment from your last build)

## Step 6: Create Archive

1. In Xcode menu: Product > Destination > "Any iOS Device (arm64)"
2. In Xcode menu: Product > Archive
3. Wait for the archive to complete (5-10 minutes)

## Step 7: Upload to App Store Connect

1. When archive completes, Xcode Organizer opens automatically
2. Select your archive
3. Click "Distribute App"
4. Select "App Store Connect"
5. Click "Upload"
6. Select "Automatically manage signing"
7. Click "Upload"
8. Wait for upload to complete

## Step 8: Wait for Processing

1. Go to App Store Connect: https://appstoreconnect.apple.com
2. Go to your app > TestFlight or App Store tab
3. Wait 10-30 minutes for Apple to process the build
4. You'll get an email when processing is complete

## Troubleshooting

### "No signing certificate found"
- Go to Xcode > Settings > Accounts
- Add your Apple ID if not already added
- Select your team and click "Manage Certificates"
- Create a new certificate if needed

### "Provisioning profile doesn't match"
- In Signing & Capabilities, uncheck "Automatically manage signing"
- Then check it again to regenerate profiles

### "Archive option is grayed out"
- Make sure you selected "Any iOS Device (arm64)" as destination
- Don't select a simulator

### Icons still missing after prebuild
1. In Xcode, open Assets.xcassets
2. Right-click AppIcon > Show in Finder
3. Manually drag your 1024x1024 icon.png into the 1024x1024 slot
4. Xcode will auto-generate other sizes

## After Upload

Once uploaded and processed:
1. Add build to TestFlight internal testing
2. Install via TestFlight app on your iPhone
3. Test the app
4. Submit for App Store review when ready

## Benefits of Local Build

- Full control over build process
- Can verify icons are correct before archiving
- Faster iteration (no waiting for EAS)
- Can debug build issues directly in Xcode
- Guaranteed to work (no EAS bugs)
