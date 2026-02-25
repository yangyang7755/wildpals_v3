import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import Explore from '../screens/Explore';
import Joined from '../screens/Joined';
import CreateActivity from '../screens/CreateActivity';
import Clubs from '../screens/Clubs';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Joined" component={Joined} />
      <Tab.Screen name="Create" component={CreateActivity} />
      <Tab.Screen name="Clubs" component={Clubs} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
