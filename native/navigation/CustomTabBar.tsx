import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CustomTabBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;

  const tabs = [
    { name: 'Explore', icon: '🔍', label: 'Explore' },
    { name: 'Notifications', icon: '🔔', label: 'Requests' },
    { name: 'Create', icon: '+', label: 'Create', isSpecial: true },
    { name: 'Clubs', icon: '👥', label: 'Clubs' },
    { name: 'Profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.name;
        
        if (tab.isSpecial) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.specialButton}
              onPress={() => navigation.navigate(tab.name as never)}
            >
              <Text style={styles.specialIcon}>{tab.icon}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name as never)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 10,
    paddingTop: 10,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
    marginBottom: 4,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  labelActive: {
    color: '#4A7C59',
  },
  specialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A7C59',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  specialIcon: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
});
