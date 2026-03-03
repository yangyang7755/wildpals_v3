import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

interface Activity {
  id: string;
  type: 'cycling' | 'climbing' | 'running';
  title: string;
  date: string;
  time: string;
  location: string;
  organizer_id: string;
  max_participants: number;
  current_participants: number;
  distance?: number;
  elevation?: number;
  climbing_level?: string;
  special_comments?: string;
  road_surface?: string;
  route_link?: string;
  cafe_stop?: string;
  climbing_type?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  joinRequestStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

export default function Explore() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'London' | 'Oxford' | 'Boston'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:organizer_id (
            full_name,
            email
          )
        `)
        .gte('date', today) // Only get activities from today onwards
        .order('date', { ascending: true }) // Soonest first
        .order('time', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Filter out private club activities that user doesn't have access to
      let filteredData = data || [];
      
      if (user) {
        // Get user's club memberships
        const { data: userClubMemberships } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id)
          .eq('status', 'active');

        const userClubIds = new Set(
          (userClubMemberships || []).map(m => m.club_id)
        );

        // Filter activities: show public activities OR private activities where user is a club member
        filteredData = data?.filter(activity => {
          // If not club-only, show it
          if (!activity.club_members_only) return true;
          
          // If club-only, check if user is member of any of the visible clubs
          if (activity.visible_to_clubs && Array.isArray(activity.visible_to_clubs)) {
            return activity.visible_to_clubs.some((clubId: string) => userClubIds.has(clubId));
          }
          
          // If club_members_only is true but no clubs specified, hide it
          return false;
        }) || [];

        // Fetch join request statuses for current user
        const activityIds = filteredData.map(a => a.id);
        const { data: joinRequests } = await supabase
          .from('join_requests')
          .select('activity_id, status')
          .eq('requester_id', user.id)
          .in('activity_id', activityIds);

        // Map join request statuses to activities
        const joinRequestMap = new Map(
          (joinRequests || []).map(jr => [jr.activity_id, jr.status])
        );

        const activitiesWithStatus = filteredData.map(activity => ({
          ...activity,
          joinRequestStatus: joinRequestMap.get(activity.id) || null,
        }));

        setActivities(activitiesWithStatus);
      } else {
        // If no user logged in, only show public activities
        filteredData = data?.filter(activity => !activity.club_members_only) || [];
        setActivities(filteredData);
      }
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

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = searchQuery.trim() === '' ||
      (activity.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    
    // Date filtering
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = activityDate >= today && activityDate < tomorrow;
    } else if (dateFilter === 'week') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      matchesDate = activityDate >= today && activityDate < nextWeek;
    } else if (dateFilter === 'month') {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      matchesDate = activityDate >= today && activityDate < nextMonth;
    }
    
    // Location filtering
    let matchesLocation = true;
    if (selectedLocation !== 'all') {
      matchesLocation = (activity.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
    }
    
    return matchesSearch && matchesType && matchesDate && matchesLocation;
  });

  // Sort activities: selected location first (if not 'all'), then by date
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    // If specific location selected, prioritize those activities
    if (selectedLocation !== 'all') {
      const aMatchesLocation = (a.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
      const bMatchesLocation = (b.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
      
      // Local activities come first
      if (aMatchesLocation && !bMatchesLocation) return -1;
      if (!aMatchesLocation && bMatchesLocation) return 1;
    }
    
    // Then sort by date
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cycling': return '🚴';
      case 'climbing': return '🧗';
      case 'running': return '🏃';
      default: return '🏃';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleRequestJoin = (activity: Activity) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join activities');
      return;
    }
    
    setSelectedActivity(activity);
    setJoinMessage(`Hey, I would like to join this ${activity.type} activity!`);
    setShowJoinModal(true);
  };

  const submitJoinRequest = async () => {
    if (!selectedActivity || !user) return;

    try {
      // Check if user already has a join request for this activity
      const { data: existingRequest } = await supabase
        .from('join_requests')
        .select('id, status')
        .eq('activity_id', selectedActivity.id)
        .eq('requester_id', user.id)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          Alert.alert('Already Requested', 'You have already requested to join this activity. Please wait for the organizer to respond.');
        } else if (existingRequest.status === 'accepted') {
          Alert.alert('Already Joined', 'You have already joined this activity!');
        } else if (existingRequest.status === 'rejected') {
          Alert.alert('Request Rejected', 'Your previous request was rejected by the organizer.');
        }
        setShowJoinModal(false);
        return;
      }

      // Create new join request
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          activity_id: selectedActivity.id,
          requester_id: user.id,
          message: joinMessage,
          status: 'pending',
        }]);

      if (error) throw error;

      Alert.alert('Success!', 'Your join request has been sent to the organizer');
      setShowJoinModal(false);
      setSelectedActivity(null);
      setJoinMessage('');
      
      // Reload activities to update button states
      loadActivities();
    } catch (error: any) {
      console.error('Error sending join request:', error);
      Alert.alert('Error', error.message || 'Failed to send join request');
    }
  };

  const renderActivity = ({ item }: { item: Activity }) => {
    const organizerName = item.profiles?.full_name || 'Unknown';
    const organizerInitial = organizerName.charAt(0).toUpperCase();
    const isFull = item.current_participants >= item.max_participants;
    const spotsText = isFull 
      ? `Full (${item.current_participants}/${item.max_participants})`
      : `${item.current_participants}/${item.max_participants} spots`;
    
    // Determine button state based on join request status
    const getButtonState = () => {
      if (isFull) {
        return { text: 'Activity Full', disabled: true, style: styles.joinButtonDisabled };
      }
      
      if (!item.joinRequestStatus) {
        return { text: 'Request to Join', disabled: false, style: styles.joinButton };
      }
      
      switch (item.joinRequestStatus) {
        case 'pending':
          return { text: 'Pending', disabled: true, style: styles.joinButtonPending };
        case 'accepted':
          return { text: 'Joined ✓', disabled: true, style: styles.joinButtonJoined };
        case 'rejected':
          return { text: 'Request Declined', disabled: true, style: styles.joinButtonRejected };
        default:
          return { text: 'Request to Join', disabled: false, style: styles.joinButton };
      }
    };
    
    const buttonState = getButtonState();
    
    return (
      <TouchableOpacity 
        style={styles.activityCard}
        onPress={() => (navigation as any).navigate('ActivityDetail', { activityId: item.id })}
        activeOpacity={0.7}
      >
        {/* Activity Type Label */}
        {(item as any).activity_type === 'recurrent' && (
          <View style={styles.activityTypeLabel}>
            <Text style={styles.activityTypeLabelText}>🔄 RECURRENT</Text>
          </View>
        )}
        {(item as any).activity_type === 'multi_day' && (
          <View style={[styles.activityTypeLabel, styles.activityTypeLabelMultiDay]}>
            <Text style={styles.activityTypeLabelText}>📅 MULTI-DAY</Text>
          </View>
        )}
        
        <View style={styles.activityHeader}>
          <Text style={styles.activityIcon}>{getActivityIcon(item.type)}</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <View style={styles.organizerRow}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerInitial}>{organizerInitial}</Text>
              </View>
              <Text style={styles.organizerName}>by {organizerName}</Text>
            </View>
            <Text style={styles.activityLocation}>📍 {item.location}</Text>
          </View>
        </View>
        
        <View style={styles.activityDetails}>
          <Text style={styles.activityDate}>
            📅 {formatDate(item.date)} at {item.time}
          </Text>
          <Text style={[
            styles.activityParticipants,
            isFull && styles.activityParticipantsFull
          ]}>
            👥 {spotsText}
          </Text>
        </View>

        {item.type === 'cycling' && (
          <>
            {item.distance && (
              <Text style={styles.activityMeta}>
                🚴 {item.distance}km{item.elevation ? ` • ${item.elevation}m elevation` : ''}
              </Text>
            )}
            {item.road_surface && (
              <Text style={styles.activityMeta}>
                🛣️ {item.road_surface.charAt(0).toUpperCase() + item.road_surface.slice(1)}
              </Text>
            )}
            {item.cafe_stop && (
              <Text style={styles.activityMeta}>
                ☕ Cafe stop: {item.cafe_stop}
              </Text>
            )}
          </>
        )}
        {item.type === 'climbing' && (
          <>
            {item.climbing_type && (
              <Text style={styles.activityMeta}>
                🧗 {item.climbing_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Text>
            )}
            {item.climbing_level && (
              <Text style={styles.activityMeta}>
                📊 Level: {item.climbing_level}
              </Text>
            )}
          </>
        )}
        
        {item.special_comments && (
          <Text style={styles.activityComments} numberOfLines={2}>
            {item.special_comments}
          </Text>
        )}

        <TouchableOpacity 
          style={buttonState.style}
          onPress={(e) => {
            e.stopPropagation();
            if (!buttonState.disabled) handleRequestJoin(item);
          }}
          disabled={buttonState.disabled}
        >
          <Text style={styles.joinButtonText}>
            {buttonState.text}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A7C59" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={() => setShowLocationPicker(!showLocationPicker)}
        >
          <Text style={styles.locationButtonText}>
            {selectedLocation === 'all' ? '📍 All' : `📍 ${selectedLocation}`}
          </Text>
        </TouchableOpacity>
      </View>

      {showLocationPicker && (
        <View style={styles.locationPicker}>
          {['all', 'London', 'Oxford', 'Boston'].map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.locationOption,
                selectedLocation === location && styles.locationOptionActive
              ]}
              onPress={() => {
                setSelectedLocation(location as any);
                setShowLocationPicker(false);
              }}
            >
              <Text style={[
                styles.locationOptionText,
                selectedLocation === location && styles.locationOptionTextActive
              ]}>
                {location === 'all' ? 'All Locations' : location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.filterTabs}>
        {['all', 'cycling', 'climbing', 'running'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              selectedType === type && styles.filterTabActive
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[
              styles.filterTabText,
              selectedType === type && styles.filterTabTextActive
            ]}>
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Filter */}
      <View style={styles.dateFilterContainer}>
        <Text style={styles.filterLabel}>When:</Text>
        <View style={styles.dateFilterTabs}>
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.dateFilterTab,
                dateFilter === filter.key && styles.dateFilterTabActive
              ]}
              onPress={() => setDateFilter(filter.key as any)}
            >
              <Text style={[
                styles.dateFilterTabText,
                dateFilter === filter.key && styles.dateFilterTabTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {sortedActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏔️</Text>
          <Text style={styles.emptyTitle}>No activities yet</Text>
          <Text style={styles.emptyText}>
            Be the first to create an activity!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedActivities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4A7C59"
            />
          }
        />
      )}

      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request to Join</Text>
            <Text style={styles.modalSubtitle}>
              Send a message to the organizer
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={joinMessage}
              onChangeText={setJoinMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Your message..."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSend]}
                onPress={submitJoinRequest}
              >
                <Text style={styles.modalButtonTextSend}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#4A7C59',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  locationPicker: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationOptionActive: {
    backgroundColor: '#E8F5E9',
  },
  locationOptionText: {
    fontSize: 15,
    color: '#666',
  },
  locationOptionTextActive: {
    color: '#4A7C59',
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterTabActive: {
    backgroundColor: '#4A7C59',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
  },
  dateFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dateFilterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  dateFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateFilterTabActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4A7C59',
  },
  dateFilterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  dateFilterTabTextActive: {
    color: '#4A7C59',
  },
  listContent: {
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
    position: 'relative',
  },
  activityTypeLabel: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4A7C59',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  activityTypeLabelMultiDay: {
    backgroundColor: '#FF9800',
  },
  activityTypeLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activityHeader: {
    flexDirection: 'row',
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
  activityLocation: {
    fontSize: 14,
    color: '#666',
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
  },
  activityParticipants: {
    fontSize: 14,
    color: '#666',
  },
  activityParticipantsFull: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  activityMeta: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: '500',
    marginBottom: 8,
  },
  activityComments: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  organizerInitial: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  organizerName: {
    fontSize: 13,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  joinButtonDisabled: {
    backgroundColor: '#CCC',
  },
  joinButtonPending: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  joinButtonJoined: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
  joinButtonRejected: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonSend: {
    backgroundColor: '#4A7C59',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSend: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
