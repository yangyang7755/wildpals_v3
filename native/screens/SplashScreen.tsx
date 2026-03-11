import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { useAuth } from '../contexts/AuthContext';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { user, isLoading } = useAuth();
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Preload video
    Asset.loadAsync(require('../../assets/splash-video.MP4'))
      .then(() => setVideoLoaded(true))
      .catch((error) => {
        console.error('Error loading video:', error);
        // If video fails to load, navigate after timeout
        setTimeout(() => {
          navigateToNextScreen();
        }, 2000);
      });

    // Fallback timeout
    const timeout = setTimeout(() => {
      navigateToNextScreen();
    }, 8000);

    return () => clearTimeout(timeout);
  }, [navigation]);

  const navigateToNextScreen = () => {
    if (isLoading) return;

    if (user) {
      // User is logged in
      if (user.hasCompletedProfile) {
        // Profile completed, go to main app
        navigation.navigate('MainTabs' as never);
      } else {
        // Profile not completed, go to onboarding
        navigation.navigate('ProfileSetup' as never);
      }
    } else {
      // No user, go to login
      navigation.navigate('Login' as never);
    }
  };

  const handleVideoEnd = () => {
    navigateToNextScreen();
  };

  if (!videoLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/splash-video.MP4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            handleVideoEnd();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
