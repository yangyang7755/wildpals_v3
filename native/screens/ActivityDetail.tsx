import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ReportModal from '../components/ReportModal';

interface Activity {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  location: string;
  meetup_location: string;
  organizer_id: string;
  max_participants: number;
  current_participants: number;
  special_comments: string;
  distance?: number;
  elevation?: number;
  pace?: number;
  road_surface?: string;
  route_link?: string;
  cafe_stop?: string;
  climbing_level?: string;
  climbing_type?: string;
  gear_required?: string;
  activity_type?: 'one_off' | 'recurrent' | 'multi_day';
  recurrence_day_of_week?: number;
  end_date?: string;
  end_time?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Participant {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export default function ActivityDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { activityId } = route.params as { activityId: string };

  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  useEffect(() => {
    loadActivityDetails();
  }, [activityId]);

  const loadActivityDetails = async () => {
    try {
      // Load activity
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:organizer_id (
            full_name,
            email
          )
        `)
        .eq('id', activityId)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);

      // Load participants
      const { data: participantsData } = await supabase
        .from('join_requests')
        .select(`
          id,
          user_id: requester_id,
          profiles:requester_id (
            full_name,
            profile_picture_url
          )
        `)
        .eq('activity_id', activityId)
        .eq('status', 'accepted');

      setParticipants(participantsData || []);

      // Check user's join status
      if (user) {
        const { data: joinData, error: joinError } = await supabase
          .from('join_requests')
          .select('status')
          .eq('activity_id', activityId)
          .eq('requester_id', user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 or 1 rows

        // Only set status if data exists, otherwise explicitly set to null
        if (joinError) {
          console.error('Error fetching join status:', joinError);
          setUserStatus(null);
        } else {
          setUserStatus(joinData?.status || null);
          console.log('User status for activity:', joinData?.status || 'none');
        }
      } else {
        setUserStatus(null);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      Alert.alert('Error', 'Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join activities');
      return;
    }
    setJoinMessage(`Hey, I would like to join this ${activity?.type} activity!`);
    setShowJoinModal(true);
  };

  const submitJoinRequest = async () => {
    if (!activity || !user) return;

    try {
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          activity_id: activity.id,
          requester_id: user.id,
          message: joinMessage,
          status: 'pending',
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Your join request has been sent!');
      setShowJoinModal(false);
      setUserStatus('pending');
    } catch (error: any) {
      console.error('Error sending join request:', error);
      Alert.alert('Error', error.message || 'Failed to send join request');
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel your join request?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: cancelJoinRequest, style: 'destructive' }
      ]
    );
  };

  const cancelJoinRequest = async () => {
    if (!activity || !user) return;

    try {
      const { error } = await supabase
        .from('join_requests')
        .delete()
        .eq('activity_id', activity.id)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      Alert.alert('Success', 'Your join request has been cancelled');
      setUserStatus(null);
    } catch (error: any) {
      console.error('Error cancelling join request:', error);
      Alert.alert('Error', error.message || 'Failed to cancel join request');
    }
  };

  const handleLeaveActivity = () => {
    Alert.alert(
      'Leave Activity',
      `Are you sure you want to leave "${activity?.title}"?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Leave', onPress: leaveActivity, style: 'destructive' }
      ]
    );
  };

  const leaveActivity = async () => {
    if (!activity || !user) return;

    try {
      console.log('Attempting to leave activity:', activity.id, 'for user:', user.id);
      
      const { error, data } = await supabase
        .from('join_requests')
        .delete()
        .eq('activity_id', activity.id)
        .eq('requester_id', user.id)
        .eq('status', 'accepted')
        .select(); // Add select to see what was deleted

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Successfully deleted join request:', data);
      
      Alert.alert('Left Activity', 'You have left the activity');
      setUserStatus(null);
      // Update participants list
      setParticipants(prev => prev.filter(p => p.user_id !== user.id));
    } catch (error: any) {
      console.error('Error leaving activity:', error);
      Alert.alert('Error', error.message || 'Failed to leave activity');
    }
  };

  const openRouteLink = async () => {
    if (activity?.route_link) {
      try {
        const supported = await Linking.canOpenURL(activity.route_link);
        if (supported) {
          await Linking.openURL(activity.route_link);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      } catch (error) {
        console.error('Error opening link:', error);
        Alert.alert('Error', 'Failed to open link');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDayOfWeekName = (dayNum: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || '';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cycling': return '🚴';
      case 'climbing': return '🧗';
      case 'running': return '🏃';
      default: return '🏃';
    }
  };

  const isOrganizer = user?.id === activity?.organizer_id;
  const isFull = participants.length >= (activity?.max_participants || 0);
  const canJoin = !isOrganizer && !userStatus && !isFull;
  // Only show chat if user has been explicitly accepted (joined the activity)
  // Organizers should NOT see the chat button
  const canViewChat = !isOrganizer && userStatus === 'accepted';

  // Debug logging
  console.log('Activity Detail Debug:', {
    userId: user?.id,
    organizerId: activity?.organizer_id,
    isOrganizer,
    userStatus,
    canViewChat,
    canJoin
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.centerContainer}>
        <Text>Activity not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Details</Text>
        {isOrganizer ? (
          <TouchableOpacity onPress={() => navigation.navigate('ActivityManagement' as never, { activityId } as never)}>
            <Text style={styles.editButton}>⚙️</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
            <Text style={styles.editButton}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Activity Header */}
        <View style={styles.activityHeader}>
          <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityType}>
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
          </Text>
          
          {/* Activity Schedule Type Badge */}
          {activity.activity_type === 'recurrent' && (
            <View style={styles.activityScheduleBadge}>
              <Text style={styles.activityScheduleBadgeText}>🔄 RECURRENT</Text>
            </View>
          )}
          {activity.activity_type === 'multi_day' && (
            <View style={[styles.activityScheduleBadge, styles.activityScheduleBadgeMultiDay]}>
              <Text style={styles.activityScheduleBadgeText}>📅 MULTI-DAY</Text>
            </View>
          )}
        </View>

        {/* Organizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organized by</Text>
          <TouchableOpacity
            style={styles.organizerCard}
            onPress={() => navigation.navigate('UserProfile' as never, { userId: activity.organizer_id } as never)}
          >
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerInitial}>
                {activity.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.organizerName}>{activity.profiles?.full_name || 'Unknown'}</Text>
          </TouchableOpacity>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When</Text>
          
          {activity.activity_type === 'multi_day' ? (
            <>
              <Text style={styles.infoText}>📅 {formatDate(activity.date)}</Text>
              <Text style={styles.infoText}>🕐 {activity.time}</Text>
              <Text style={styles.infoText}>
                📅 to {activity.end_date ? formatDate(activity.end_date) : 'TBD'}
              </Text>
              <Text style={styles.infoText}>🕐 {activity.end_time || 'TBD'}</Text>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>📅 {formatDate(activity.date)}</Text>
              <Text style={styles.infoText}>🕐 {activity.time}</Text>
              {activity.activity_type === 'recurrent' && !activity.is_recurrent_template && (
                <Text style={styles.infoTextSecondary}>
                  🔄 Part of recurring series
                </Text>
              )}
            </>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where</Text>
          <Text style={styles.infoText}>📍 {activity.location}</Text>
          {activity.meetup_location && activity.meetup_location !== activity.location && (
            <Text style={styles.infoTextSecondary}>
              Meetup: {activity.meetup_location}
            </Text>
          )}
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <Text style={[
            styles.participantCount,
            isFull && styles.participantCountFull
          ]}>
            {participants.length}/{activity.max_participants} spots
            {isFull && ' (Full)'}
          </Text>
          
          {participants.length > 0 ? (
            <View style={styles.participantBubbles}>
              {participants.map((participant) => (
                <TouchableOpacity
                  key={participant.id}
                  style={styles.participantBubble}
                  onPress={() => navigation.navigate('UserProfile' as never, { userId: participant.user_id } as never)}
                  activeOpacity={0.7}
                >
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {participant.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <Text style={styles.participantBubbleName} numberOfLines={1}>
                    {participant.profiles?.full_name || 'User'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noParticipantsText}>No participants yet</Text>
          )}
        </View>

        {/* Sport-Specific Details */}
        {activity.type === 'cycling' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cycling Details</Text>
            {activity.road_surface && (
              <Text style={styles.infoText}>
                🛣️ Surface: {activity.road_surface.charAt(0).toUpperCase() + activity.road_surface.slice(1)}
              </Text>
            )}
            {activity.distance && (
              <Text style={styles.infoText}>📏 Distance: {activity.distance} km</Text>
            )}
            {activity.elevation && (
              <Text style={styles.infoText}>⛰️ Elevation: {activity.elevation} m</Text>
            )}
            {activity.pace && (
              <Text style={styles.infoText}>⚡ Pace: {activity.pace} kph</Text>
            )}
            {activity.cafe_stop && (
              <Text style={styles.infoText}>☕ Cafe Stop: {activity.cafe_stop}</Text>
            )}
            {activity.route_link && (
              <TouchableOpacity onPress={openRouteLink} style={styles.linkButton}>
                <Text style={styles.linkButtonText}>🗺️ View Route</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {activity.type === 'climbing' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Climbing Details</Text>
            {activity.climbing_type && (
              <Text style={styles.infoText}>
                🧗 Type: {activity.climbing_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Text>
            )}
            {activity.climbing_level && (
              <Text style={styles.infoText}>📊 Level: {activity.climbing_level}</Text>
            )}
            {activity.gear_required && (
              <Text style={styles.infoText}>🎒 Gear: {activity.gear_required}</Text>
            )}
          </View>
        )}

        {/* Special Comments */}
        {activity.special_comments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            <Text style={styles.commentsText}>{activity.special_comments}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {/* Show Chat button only if user is organizer OR accepted */}
        {canViewChat && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('ActivityChat' as never, { activityId } as never)}
          >
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}

        {/* Show Request to Join button if user hasn't joined and activity not full */}
        {!isOrganizer && !userStatus && !isFull && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinRequest}
          >
            <Text style={styles.joinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        )}

        {/* Show Activity Complete when full */}
        {!isOrganizer && isFull && !userStatus && (
          <View style={[styles.statusBadge, styles.completeBadge]}>
            <Text style={[styles.statusText, styles.completeText]}>Activity Complete</Text>
            <Text style={[styles.statusSubtext, styles.completeSubtext]}>Max participants reached</Text>
          </View>
        )}
          <TouchableOpacity
            style={styles.statusBadge}
            onPress={handleCancelRequest}
          >
            <Text style={styles.statusText}>⏳ Request Pending</Text>
            <Text style={styles.statusSubtext}>Tap to cancel</Text>
          </TouchableOpacity>
        )}

        {/* Show joined status - clickable to leave */}
        {!isOrganizer && userStatus === 'accepted' && (
          <TouchableOpacity
            style={[styles.statusBadge, styles.joinedBadge]}
            onPress={handleLeaveActivity}
          >
            <Text style={[styles.statusText, styles.joinedText]}>✓ Joined</Text>
            <Text style={[styles.statusSubtext, styles.joinedSubtext]}>Tap to leave</Text>
          </TouchableOpacity>
        )}

        {/* Show Activity Complete when full */}
        {!isOrganizer && isFull && !userStatus && (
          <View style={[styles.statusBadge, styles.completeBadge]}>
            <Text style={[styles.statusText, styles.completeText]}>Activity Complete</Text>
            <Text style={[styles.statusSubtext, styles.completeSubtext]}>Max participants reached</Text>
          </View>
        )}
      </View>

      {/* Join Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Request</Text>
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

      {/* Options Menu */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setShowReportModal(true);
              }}
            >
              <Text style={styles.menuItemIcon}>🚨</Text>
              <Text style={styles.menuItemText}>Report Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemCancel]}
              onPress={() => setShowOptionsMenu(false)}
            >
              <Text style={styles.menuItemTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      {activity && (
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="activity_content"
          targetId={activity.id}
          targetUserId={activity.organizer_id}
          targetName={activity.title}
          currentUserId={user?.id || ''}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 32,
    color: '#4A7C59',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  activityHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  activityType: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activityScheduleBadge: {
    backgroundColor: '#4A7C59',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  activityScheduleBadgeMultiDay: {
    backgroundColor: '#FF9800',
  },
  activityScheduleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  organizerInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  infoText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    lineHeight: 24,
  },
  infoTextSecondary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  participantCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A7C59',
    marginBottom: 12,
  },
  participantCountFull: {
    color: '#FF3B30',
  },
  participantBubbles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  participantBubble: {
    alignItems: 'center',
    width: 70,
  },
  participantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  participantInitial: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  participantBubbleName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  noParticipantsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantName: {
    fontSize: 14,
    color: '#000',
  },
  commentsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  linkButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#4A7C59',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullBadge: {
    backgroundColor: '#FFEBEE',
  },
  completeBadge: {
    backgroundColor: '#E0E0E0',
  },
  completeText: {
    color: '#666',
  },
  completeSubtext: {
    color: '#666',
  },
  joinedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    color: '#F57C00',
    fontSize: 16,
    fontWeight: '600',
  },
  joinedText: {
    color: '#4A7C59',
  },
  statusSubtext: {
    color: '#F57C00',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  joinedSubtext: {
    color: '#4A7C59',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  menuItemCancel: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  menuItemTextCancel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
});
