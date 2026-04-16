import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  onPress?: () => void;
  backgroundColor?: string;
}

export default function Avatar({ uri, name, size = 48, onPress, backgroundColor = '#4A7C59' }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || '?';
  const fontSize = size * 0.42;
  const borderRadius = size / 2;

  const content = uri ? (
    <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius }]} />
  ) : (
    <View style={[styles.fallback, { width: size, height: size, borderRadius, backgroundColor }]}>
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }
  return content;
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: 'white',
    fontWeight: 'bold',
  },
});
