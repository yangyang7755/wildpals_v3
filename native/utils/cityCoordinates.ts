// City coordinates for map centering
export interface CityCoordinate {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinate> = {
  // UK
  'London': { latitude: 51.5074, longitude: -0.1278, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Oxford': { latitude: 51.7520, longitude: -1.2577, latitudeDelta: 0.1, longitudeDelta: 0.1 },
  'Cambridge': { latitude: 52.2053, longitude: 0.1218, latitudeDelta: 0.1, longitudeDelta: 0.1 },
  'Manchester': { latitude: 53.4808, longitude: -2.2426, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Edinburgh': { latitude: 55.9533, longitude: -3.1883, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Bristol': { latitude: 51.4545, longitude: -2.5879, latitudeDelta: 0.12, longitudeDelta: 0.12 },
  
  // USA
  'Boston': { latitude: 42.3601, longitude: -71.0589, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'New York': { latitude: 40.7128, longitude: -74.0060, latitudeDelta: 0.2, longitudeDelta: 0.2 },
  'San Francisco': { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Los Angeles': { latitude: 34.0522, longitude: -118.2437, latitudeDelta: 0.2, longitudeDelta: 0.2 },
  'Chicago': { latitude: 41.8781, longitude: -87.6298, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Seattle': { latitude: 47.6062, longitude: -122.3321, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  
  // Europe
  'Paris': { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Berlin': { latitude: 52.5200, longitude: 13.4050, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Amsterdam': { latitude: 52.3676, longitude: 4.9041, latitudeDelta: 0.1, longitudeDelta: 0.1 },
  'Barcelona': { latitude: 41.3851, longitude: 2.1734, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  'Rome': { latitude: 41.9028, longitude: 12.4964, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  
  // Default (London)
  'default': { latitude: 51.5074, longitude: -0.1278, latitudeDelta: 0.15, longitudeDelta: 0.15 },
};

export function getCityCoordinates(cityName: string): CityCoordinate {
  // Try exact match first
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }
  
  // Try case-insensitive match
  const cityKey = Object.keys(CITY_COORDINATES).find(
    key => key.toLowerCase() === cityName.toLowerCase()
  );
  
  if (cityKey) {
    return CITY_COORDINATES[cityKey];
  }
  
  // Return default (London)
  return CITY_COORDINATES['default'];
}

export function getActivityIcon(type: string): string {
  switch (type) {
    case 'cycling':
      return '🚴';
    case 'climbing':
      return '🧗';
    case 'running':
      return '🏃';
    case 'social':
      return '🎉';
    default:
      return '📍';
  }
}

export function getActivityColor(type: string): string {
  switch (type) {
    case 'cycling':
      return '#4A7C59'; // Green
    case 'climbing':
      return '#FF6B6B'; // Red
    case 'running':
      return '#4ECDC4'; // Teal
    case 'social':
      return '#FFB84D'; // Orange
    default:
      return '#666666'; // Gray
  }
}
