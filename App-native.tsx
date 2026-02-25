import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

// Import screens
import SplashScreen from './native/screens/SplashScreen';
import Login from './native/screens/Login';
import SignUp from './native/screens/SignUp';
import EmailVerification from './native/screens/EmailVerification';
import ProfileSetup from './native/screens/ProfileSetup';
import Explore from './native/screens/Explore';
import Joined from './native/screens/Joined';
import Notifications from './native/screens/Notifications';
import CreateActivity from './native/screens/CreateActivity';
import Clubs from './native/screens/Clubs';
import ClubDetail from './native/screens/ClubDetail';
import CreateClub from './native/screens/CreateClub';
import Profile from './native/screens/Profile';
import EditProfile from './native/screens/EditProfile';
import Settings from './native/screens/Settings';
import PrivacyPolicy from './native/screens/PrivacyPolicy';
import TermsOfService from './native/screens/TermsOfService';
import ActivityChat from './native/screens/ActivityChat';
import ActivityDetail from './native/screens/ActivityDetail';
import ActivityManagement from './native/screens/ActivityManagement';
import ClubManagement from './native/screens/ClubManagement';

// Import custom tab bar
import CustomTabBar from './native/navigation/CustomTabBar';

// Import contexts
import { AuthProvider } from './native/contexts/AuthContext';

const Stack = createNativeStackNavigator();

function TabScreens() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Explore" component={Explore} />
          <Stack.Screen name="Joined" component={Joined} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Create" component={CreateActivity} />
          <Stack.Screen name="Clubs" component={Clubs} />
          <Stack.Screen name="ClubDetail" component={ClubDetail} />
          <Stack.Screen name="CreateClub" component={CreateClub} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
          <Stack.Screen name="ActivityChat" component={ActivityChat} />
          <Stack.Screen name="ActivityManagement" component={ActivityManagement} />
          <Stack.Screen name="ClubManagement" component={ClubManagement} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="TermsOfService" component={TermsOfService} />
        </Stack.Navigator>
      </View>
      <CustomTabBar />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="EmailVerification" component={EmailVerification} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
            <Stack.Screen name="MainTabs" component={TabScreens} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
