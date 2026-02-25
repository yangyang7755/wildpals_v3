import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useState, useCallback, useEffect } from 'react';

interface UserSport {
  sport: string;
  skill_level: string;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  type: string;
  location: string;
  max_participants: number;
}

interface JoinedActivity {
  id: string;
  activity: Activity;
  status: string;
}

interface Club {
  id: string;
  name: string;
  sport_type: string;
  role?: string;
}

interface ProfileData {
  bio: string | null;
  location: string | null;
  age: number | null;
  gender: string | null;
  sports: UserSport[];
  createdActivities: Activity[];
  joinedActivities: JoinedActivity[];
  clubs: Club[];
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'cycling' | 'climbing' | 'running'>('cycling');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('bio, location, age, gender')
        .eq('id', user.id)
        .single();

      // Fetch user sports
      const { data: sports } = await supabase
        .from('user_sports')
        .select('sport, skill_level')
        .eq('user_id', user.id);

      // Fetch created activities
      const { data: createdActivities } = await supabase
        .from('activities')
        .select('id, title, date, type, location, max_participants')
        .eq('organizer_id', user.id)
        .order('date', { ascending: false });

      // Fetch joined activities
      const { data: joinedActivities } = await supabase
        .from('join_requests')
        .select(`
          id,
          status,
          activity:activities(id, title, date, type, location, max_participants)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      // Fetch clubs with role
      const { data: clubMemberships } = await supabase
        .from('club_members')
        .select(`
          role,
          club:clubs(id, name, sport_type)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Transform joined activities data - only show completed activities (past date)
      const today = new Date().toISOString().split('T')[0];
      const transformedJoinedActivities = (joinedActivities || [])
        .map((item: any) => ({
          id: item.id,
          status: item.status,
          activity: Array.isArray(item.activity) ? item.activity[0] : item.activity,
        }))
        .filter((item: any) => {
          if (!item.activity) return false;
          // Only show activities that have already happened
          return item.activity.date < today;
        });

      // Transform clubs data with role
      const transformedClubs = (clubMemberships || [])
        .map((item: any) => {
          const club = Array.isArray(item.club) ? item.club[0] : item.club;
          if (!club) return null;
          return {
            ...club,
            role: item.role,
          };
        })
        .filter(Boolean);

      setProfileData({
        bio: profile?.bio || null,
        location: profile?.location || null,
        age: profile?.age || null,
        gender: profile?.gender || null,
        sports: sports || [],
        createdActivities: createdActivities || [],
        joinedActivities: transformedJoinedActivities,
        clubs: transformedClubs,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [user])
  );

  // Reload when screen comes into focus (after editing profile)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileData();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login' as never);
          },
        },
      ]
    );
  };

  const getSportSkillLevel = (sport: string) => {
    const sportData = profileData?.sports.find(s => s.sport === sport);
    return sportData?.skill_level || 'Not set';
  };

  const getFilteredActivities = () => {
    if (!profileData) return { created: [], joined: [] };
    
    return {
      created: profileData.createdActivities.filter(a => a.type === selectedTab),
      joined: profileData.joinedActivities.filter(j => j.activity.type === selectedTab),
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      </View>
    );
  }

  const filteredActivities = getFilteredActivities();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile' as never)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.logoutIcon}>
            <Text style={styles.logoutIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.fullName || 'User'}</Text>
            <View style={styles.userDetails}>
              {profileData?.age && profileData?.gender && (
                <Text style={styles.userDetailsText}>
                  {profileData.age} • {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}
                </Text>
              )}
            </View>
            {profileData?.location && (
              <Text style={styles.location}>📍 {profileData.location}</Text>
            )}
          </View>
        </View>

        {/* Bio */}
        {profileData?.bio && (
          <Text style={styles.bio}>{profileData.bio}</Text>
        )}

        {/* Sport Tabs */}
        <View style={styles.tabs}>
          {profileData?.sports.map((sport) => (
            <TouchableOpacity
              key={sport.sport}
              style={[styles.tab, selectedTab === sport.sport && styles.tabActive]}
              onPress={() => setSelectedTab(sport.sport as any)}
            >
              <Text style={[styles.tabText, selectedTab === sport.sport && styles.tabTextActive]}>
                {sport.sport === 'cycling' ? 'Ride' : sport.sport === 'climbing' ? 'Climb' : 'Run'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Completed Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎖️ Completed Activities</Text>
          {filteredActivities.joined.length === 0 ? (
            <Text style={styles.emptyText}>No completed activities yet</Text>
          ) : (
            filteredActivities.joined.map((joined) => (
              <View key={joined.id} style={styles.activityCard}>
                <Text style={styles.activityTitle}>{joined.activity.title}</Text>
                <Text style={styles.activityDetails}>
                  {joined.activity.date} • {joined.activity.location}
                </Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓ Completed</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Clubs */}
        {profileData && profileData.clubs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clubs</Text>
            <View style={styles.clubsContainer}>
              {profileData.clubs.map((club) => (
                <View key={club.id} style={styles.clubBadge}>
                  <View style={styles.clubIcon}>
                    <Text style={styles.clubIconText}>
                      {club.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    {club.role === 'admin' && (
                      <Text style={styles.clubRole}>Admin</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  logoutIcon: {
    padding: 8,
  },
  logoutIconText: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileIconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  userDetails: {
    marginBottom: 4,
  },
  userDetailsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: '#4A7C59',
    marginBottom: 16,
    lineHeight: 22,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#4A7C59',
    borderColor: '#4A7C59',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59',
  },
  tabTextActive: {
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  activityCard: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  participantBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  participantBadgeText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
  },
  activityDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  completedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#4A7C59',
    fontWeight: '600',
  },
  clubsContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
    width: '100%',
  },
  clubIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  clubRole: {
    fontSize: 11,
    color: '#4A7C59',
    fontWeight: '600',
    marginTop: 2,
  },
});
