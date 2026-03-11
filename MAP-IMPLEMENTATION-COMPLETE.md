# Map Feature Implementation - Complete Guide

## Overview
Added interactive map functionality to the Explore page with pin-drop capability for activity creation.

## Features Implemented

### 1. Map View on Explore Page
- Toggle between List and Map views using button in header
- Auto-zooms to user's city from their profile location
- Shows activity markers with sport emoji (🚴 🧗 🏃 🎉)
- Tap markers to view activity details
- All filters (type, location, date) work on map view

### 2. Pin Drop for Activity Creation
- "Drop Pin on Map" button in CreateActivity form
- Interactive map modal to select exact location
- Draggable pin for precise positioning
- Coordinates saved to database (latitude, longitude)
- Visual confirmation when pin is dropped

## Files Created

1. **native/components/MapView.tsx**
   - Map component for Explore page
   - Renders activity markers with emoji icons
   - Handles marker press to navigate to details
   - Auto-centers on user's city

2. **native/components/LocationPicker.tsx**
   - Modal with interactive map for pin dropping
   - Draggable marker for precise location
   - Shows coordinates in real-time
   - Validates location before confirming

3. **database-migrations/ADD-LOCATION-COORDINATES.sql**
   - Adds `latitude` and `longitude` columns to activities table
   - Creates index for location-based queries

## Files Modified

1. **native/screens/Explore.tsx**
   - Added map/list view toggle
   - Integrated MapViewComponent
   - Added map toggle button in header

2. **native/screens/CreateActivity.tsx**
   - Added "Drop Pin on Map" button
   - Integrated LocationPicker modal
   - Saves coordinates when creating activity
   - Shows confirmation when pin is dropped

3. **native/utils/cityCoordinates.ts**
   - Already existed with city coordinate mappings
   - Used for auto-centering map on user's city

## Installation Steps

### 1. Install Dependencies
```bash
npx expo install react-native-maps
```

### 2. Run Database Migration
Execute the SQL in Supabase SQL Editor:
```sql
-- From database-migrations/ADD-LOCATION-COORDINATES.sql
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(latitude, longitude);
```

### 3. Add Permissions to app.json
Add location permissions (if not already present):

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to show nearby activities on the map"
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

**Note:** 
- iOS uses Apple Maps (no API key needed)
- Android uses Google Maps (API key optional for basic usage)

### 4. Test the Feature
```bash
npm start
# or
npx expo start
```

## How It Works

### Creating Activity with Pin
1. User fills in activity details in CreateActivity
2. User enters location address (e.g., "Hyde Park, London")
3. **Map auto-calibrates to the city from location input**
4. User taps "Drop Pin on Map" button
5. Map modal opens, centered on the city extracted from location
6. User taps map to place pin (or drags existing pin)
7. User confirms location
8. Coordinates saved with activity
9. **If user changes location text, map recalibrates when reopened**

### Viewing Activities on Map
1. User navigates to Explore page
2. User taps "🗺️ Map" button in header
3. Map loads, centered on user's city from profile
4. Activities shown as emoji markers at their locations
5. Activities without coordinates use city center + random offset
6. User taps marker to view activity details

## Location Input Integration

The pin-drop feature is **fully integrated** with the location text input:

- **Dynamic Calibration**: Map centers on the city from location input
- **Real-time Updates**: Changing location text updates map center
- **Smart Parsing**: Extracts city from full address (e.g., "Hyde Park, London" → "London")
- **Helpful Hint**: Shows tip to include city name for accurate centering
- **Visual Feedback**: Button shows "✓ Pin Dropped" when coordinates are set

## Coordinate Handling

### Activities WITH Coordinates
- Uses exact latitude/longitude from database
- Pin shows precise location on map

### Activities WITHOUT Coordinates
- Falls back to city-based geocoding
- Uses city name from location string
- Adds small random offset to prevent overlap
- Still functional but less precise

## City Coordinate Mapping

Supported cities in `native/utils/cityCoordinates.ts`:
- UK: London, Oxford, Cambridge, Manchester, Edinburgh, Bristol
- USA: Boston, New York, San Francisco, Los Angeles, Chicago, Seattle
- Europe: Paris, Berlin, Amsterdam, Barcelona, Rome

Default: London (if city not found)

## User Experience

### Explore Page
- Clean toggle between list and map views
- Map shows all filtered activities
- Emoji markers color-coded by activity type
- Tap marker → navigate to activity detail

### Create Activity
- Optional pin drop (not required)
- Visual feedback when pin is set
- Shows coordinates after dropping pin
- Can re-drop pin to adjust location

## Future Enhancements (Optional)

1. **Clustering**: Group nearby markers when zoomed out
2. **User Location**: Show user's current location on map
3. **Directions**: Link to navigation apps (Google Maps, Apple Maps)
4. **Search**: Search for address while dropping pin
5. **Radius Filter**: Show activities within X km of location
6. **Heatmap**: Show activity density by area

## Testing Checklist

- [ ] Run database migration in Supabase
- [ ] Install react-native-maps package
- [ ] Add location permissions to app.json
- [ ] Test map toggle on Explore page
- [ ] Test pin drop in CreateActivity
- [ ] Test marker tap navigation
- [ ] Test with activities that have coordinates
- [ ] Test with activities without coordinates
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator

## Notes

- Maps work better on physical devices than simulators
- iOS simulator may show blank map (normal behavior)
- Android requires Google Play Services for maps
- Coordinates are optional - app works without them
- Existing activities without coordinates still show on map (using city center)

## Support

If you encounter issues:
1. Check that react-native-maps is installed
2. Verify database migration ran successfully
3. Check app.json has location permissions
4. Test on physical device if simulator shows issues
5. Check console for error messages

