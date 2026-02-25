# Expo Setup Instructions

This guide will help you run the Wildpals app on your phone using Expo Go.

## Prerequisites

1. Install Node.js (v18 or higher)
2. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```
3. Install Expo Go app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Setup Steps

### 1. Install Dependencies

First, backup your current package.json and install Expo dependencies:

```bash
# Backup current package.json
cp package.json package-web.json

# Use Expo package.json
cp package-expo.json package.json

# Install dependencies
npm install
```

### 2. Create Asset Files

Create placeholder assets (you can replace these with your own later):

```bash
# Create assets directory if it doesn't exist
mkdir -p assets

# You'll need to add these files manually or use placeholders:
# - assets/icon.png (1024x1024)
# - assets/splash.png (1284x2778)
# - assets/adaptive-icon.png (1024x1024)
# - assets/favicon.png (48x48)
```

### 3. Start Expo Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code in your terminal
- Open Expo DevTools in your browser

### 4. Run on Your Phone

**iOS:**
1. Open Camera app
2. Point at the QR code
3. Tap the notification to open in Expo Go

**Android:**
1. Open Expo Go app
2. Tap "Scan QR Code"
3. Point at the QR code in terminal

## Troubleshooting

### "Unable to resolve module"
- Make sure all dependencies are installed: `npm install`
- Clear cache: `expo start -c`

### "Network response timed out"
- Ensure your phone and computer are on the same WiFi network
- Try using tunnel mode: `expo start --tunnel`

### App crashes on startup
- Check the error in Expo Go app
- Look at terminal logs for detailed error messages
- Common issues:
  - Missing dependencies
  - TypeScript errors
  - Navigation setup issues

## Development Tips

1. **Hot Reload**: Shake your phone to open developer menu
2. **Debugging**: Enable "Debug Remote JS" from developer menu
3. **Logs**: Check terminal for console.log output

## Switching Back to Web

To switch back to the web version:

```bash
# Restore web package.json
cp package-web.json package.json

# Reinstall dependencies
npm install

# Run web version
npm run dev
```

## Next Steps

Once the app is running:
1. Test the authentication flow
2. Browse activities
3. Create new activities
4. Test the profile screen

## Known Limitations

Current MVP limitations:
- No real backend (data stored in memory)
- No authentication (bypassed)
- Limited to 3 activity types (cycling, climbing, running)
- No map view
- No chat functionality
- No image uploads

These will be addressed in the full implementation.
