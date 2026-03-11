# Fix Build Error: expo-image-picker Not Found

## Problem
Build fails with: `Unable to resolve module expo-image-picker from ImageService.ts`

## Root Cause
The error references a file in the build cache (`/Users/expo/workingdir/build/`) that no longer exists in your source code. This is a stale build artifact.

## Solution

Clear the build cache and rebuild:

```bash
# Clear Expo cache
npx expo start --clear

# Or clear all caches
rm -rf node_modules
rm -rf .expo
npm install

# Then rebuild
eas build --platform ios --profile production
```

## Why This Happened
- ImageService.ts was previously in the codebase (for profile picture uploads)
- It was removed from source code
- But the build cache still references it
- Clearing cache removes the stale reference

## Verification
The ImageService is not in your current codebase:
- ✅ No ImageService.ts file
- ✅ No expo-image-picker imports
- ✅ No image upload functionality

After clearing cache, the build should succeed.
