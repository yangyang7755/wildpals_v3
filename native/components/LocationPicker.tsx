import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { getCityCoordinates } from '../utils/cityCoordinates';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  initialLocation?: string; // General city/area for centering map
  meetupLocation?: string; // Specific meetup spot name
}

export default function LocationPicker({ 
  visible, 
  onClose, 
  onLocationSelect,
  initialLocation,
  meetupLocation 
}: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: 51.5074,
    longitude: -0.1278,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (initialLocation && visible) {
      // Try to get coordinates from location string
      const locationParts = initialLocation.split(',').map(s => s.trim());
      const city = locationParts[locationParts.length - 1];
      const coords = getCityCoordinates(city);
      
      const newRegion = {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // Animate map to new region
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
      
      // Reset selected coordinate when location changes
      setSelectedCoordinate(null);
    }
  }, [initialLocation, visible]); // Re-run when modal opens or location changes

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoordinate({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (!selectedCoordinate) {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location');
      return;
    }

    // Use the location text input as the address
    onLocationSelect(
      selectedCoordinate.latitude,
      selectedCoordinate.longitude,
      initialLocation || 'Selected Location'
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Drop Meetup Pin</Text>
          <Text style={styles.headerSubtitle}>
            Tap on the map to mark where participants should meet
          </Text>
          {meetupLocation && (
            <Text style={styles.meetupLocationText}>📍 {meetupLocation}</Text>
          )}
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {selectedCoordinate && (
            <Marker
              coordinate={selectedCoordinate}
              draggable
              onDragEnd={(e) => setSelectedCoordinate(e.nativeEvent.coordinate)}
            >
              <View style={styles.pinContainer}>
                <Text style={styles.pinEmoji}>📍</Text>
              </View>
            </Marker>
          )}
        </MapView>

        <View style={styles.footer}>
          {selectedCoordinate && (
            <View style={styles.coordsContainer}>
              <Text style={styles.coordsText}>
                📍 {selectedCoordinate.latitude.toFixed(6)}, {selectedCoordinate.longitude.toFixed(6)}
              </Text>
              <Text style={styles.coordsHint}>Drag the pin to adjust</Text>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, !selectedCoordinate && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!selectedCoordinate}
            >
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  meetupLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A7C59',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinEmoji: {
    fontSize: 40,
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  coordsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  coordsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  coordsHint: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4A7C59',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCC',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
