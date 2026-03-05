import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  location: string;
  organizer_id: string;
  profiles?: {
    full_name: string;
  };
}

interface JoinRequest {
  id: string;
  status: 'pending' | 'accepted';
  activity: Activity;
}

export default function Saved() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'joined'>('joined');

  useEffect(() => {
    loadActivities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          id,
          status,
          activity:activities (
            id,
            title,
            date,
            time,
            type,
            location,
            organizer_id,
            profiles:organizer_id (
              full_name
            )
          )
        `)
        .eq('requester_id', user.id)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out past activities and transform data
      const transformedData = (data || [])
        .map((item: any) => ({
          id: item.id,
          status: item.status,
          activity: Array.isArray(item.activity) ? item.activity[0] : item.activity,
        }))
        .filter((item: any) => {
          if (!item.activity) return false;
          return item.activity.date >= today;
        });

      setActivities(transformedData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const handleLeaveActivity = (requestId: string, activityTitle: string, status: string) => {
    const actionText = status === 'pending' ? 'cancel your request for' : 'leave';
    
    Alert.alert(
      'Leave Activity',
      `Are you sure you want to ${actionText} "${activityTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('join_requests')
                .delete()
                .eq('id', requestId);

              if (error) throw error;

              Alert.alert('Success', `You have left the activity`);
              loadActivities();
            } catch (error: any) {
              console.error('Error leaving activity:', error);
              Alert.alert('Error', error.message || 'Failed to leave activity');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cycling': return '🚴';
      case 'climbing': return '🧗';
      case 'running': return '🏃';
      default: return '🏃';
    }
  };

  const filteredActivities = activities.filter(a => a.status === selectedTab);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Activities</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activities</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'joined' && styles.tabActive]}
          onPress={() => setSelectedTab('joined')}
        >
          <Text style={[styles.tabText, selectedTab === 'joined' && styles.tabTextActive]}>
            Joined
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4A7C59"
          />
        }
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {selectedTab === 'joined' ? '📅' : '⏳'}
            </Text>
            <Text style={styles.emptyTitle}>
              {selectedTab === 'joined' ? 'No joined activities' : 'No pending requests'}
            </Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'joined' 
                ? 'Activities you join will appear here'
                : 'Your pending join requests will appear here'}
            </Text>
          </View>
        ) : (
          filteredActivities.map((item) => (
            <View key={item.id} style={styles.activityCard}>
              <TouchableOpacity
                style={styles.activityContent}
                onPress={() => (navigation as any).navigate('ActivityDetail', { activityId: item.activity.id })}
                activeOpacity={0.7}
              >
                <View style={styles.activityHeader}>
                  <Text style={styles.activityIcon}>
                    {getActivityIcon(item.activity.type)}
                  </Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{item.activity.title}</Text>
                    <Text style={styles.activityOrganizer}>
                      by {item.activity.profiles?.full_name || 'Unknown'}
                    </Text>
                  </View>
                  {item.status === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>

                <View style={styles.activityDetails}>
                  <Text style={styles.activityDate}>
                    📅 {formatDate(item.activity.date)} at {item.activity.time}
                  </Text>
                  <Text style={styles.activityLocation}>
                    📍 {item.activity.location}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveActivity(item.id, item.activity.title, item.status)}
              >
                <Text style={styles.leaveButtonText}>
                  {item.status === 'pending' ? 'Cancel Request' : 'Leave Activity'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#4A7C59',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activityOrganizer: {
    fontSize: 13,
    color: '#666',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  activityDetails: {
    gap: 4,
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
  },
  leaveButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  leaveButtonText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
