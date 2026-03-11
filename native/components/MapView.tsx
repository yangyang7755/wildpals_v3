import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getCityCoordinates, getActivityIcon, getActivityColor } from '../utils/cityCoordinates';

interface Activity {
  id: string;
  type: 'cycling' | 'climbing' | 'running' | 'social';
  title: string;
  date: string;
  time: string;
  location: string;
  organizer_id: string;
  max_participants: number;
  current_participants: number;
  latitude?: number;
  longitude?: number;
}

interface MapViewComponentProps {
  activities: Activity[];
  onMarkerPress: (activity: Activity) => void;
}

export default function MapViewComponent({ activities, onMarkerPress }: MapViewComponentProps) {
  const { user } = useAuth();
  const [region, setRegion] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserLocation();
  }, [user]);

  const loadUserLocation = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();

      if (profile?.location) {
        // Extract city from location string (e.g., "Hyde Park, London" -> "London")
        const locationParts = profile.location.split(',').map((s: string) => s.trim());
        const city = locationParts[locationParts.length - 1];
        
        const coordinates = getCityCoordinates(city);
        setRegion(coordinates);
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get coordinates for activities
  const activitiesWithCoords = activities.map(activity => {
    // If activity has coordinates, use them directly
    if (activity.latitude && activity.longitude) {
      return {
        ...activity,
        coordinate: {
          latitude: activity.latitude,
          longitude: activity.longitude,
        },
      };
    }

    // Otherwise, geocode from location string with random offset
    const locationParts = activity.location.split(',').map(s => s.trim());
    const city = locationParts[locationParts.length - 1];
    const coords = getCityCoordinates(city);
    
    // Add small random offset to prevent markers from overlapping
    const offset = 0.005;
    const randomLat = (Math.random() - 0.5) * offset;
    const randomLng = (Math.random() - 0.5) * offset;
    
    return {
      ...activity,
      coordinate: {
        latitude: coords.latitude + randomLat,
        longitude: coords.longitude + randomLng,
      },
    };
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {activitiesWithCoords.map((activity) => (
          <Marker
            key={activity.id}
            coordinate={activity.coordinate}
            onPress={() => onMarkerPress(activity)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getActivityColor(activity.type) }]}>
              <Text style={styles.markerEmoji}>{getActivityIcon(activity.type)}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 20,
  },
});
