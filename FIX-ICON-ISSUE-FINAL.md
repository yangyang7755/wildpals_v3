# App Icon Display Issue - Fix Guide

## Problem
App icon appears slightly different after uploading to TestFlight/App Store.

## Root Cause
iOS automatically applies visual effects to app icons unless explicitly disabled.

## Solution Applied

### 1. Added `UIPrerenderedIcon` Flag
Updated `app.json` to include `"UIPrerenderedIcon": true` in iOS infoPlist. This tells iOS to use the icon exactly as provided without applying gloss effects.

### 2. Verified Icon Specifications
Current icon meets all Apple requirements:
- ✓ Dimensions: 1024x1024 pixels
- ✓ No transparency (hasAlpha: no)
- ✓ Format: PNG
- ✓ Color space: RGB

## Additional Recommendations

### If Icon Still Looks Different:

1. **Check for rounded corners**: iOS always applies rounded corners to app icons. This is standard and cannot be disabled. Design your icon with this in mind.

2. **Verify icon design**:
   - Ensure important content is not too close to edges (iOS will crop with rounded corners)
   - Use a safe area of approximately 90% of the icon size for critical content

3. **Test in different contexts**:
   - Home screen
   - App Store listing
   - Settings app
   - Spotlight search
   
   Icons may appear slightly different in each context due to iOS rendering.

4. **Regenerate icon assets** (if needed):
   ```bash
   # Use Expo's icon generation
   npx expo prebuild --clean
   ```

## Next Steps

1. Rebuild the app with the updated configuration:
   ```bash
   eas build --platform ios --profile production
   ```

2. Upload to TestFlight and verify the icon appearance

3. If still not satisfied, you may need to adjust the source icon design to account for iOS's rounded corners

## Technical Details

- **UIPrerenderedIcon**: When set to `true`, iOS uses the icon as-is without applying gloss effects
- **Rounded corners**: Applied by iOS automatically (radius ~22.37% of icon size)
- **Icon sizes**: Expo automatically generates all required sizes from the 1024x1024 source

## Reference
- Apple Human Interface Guidelines: App Icons
- Expo documentation: app.json configuration
