import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  read?: boolean; // Support old column name
  created_at: string;
}

interface JoinRequest {
  id: string;
  message: string;
  created_at: string;
  status: string;
  requester: {
    id: string;
    full_name: string;
  };
  activity: {
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
  };
}

interface ClubChat {
  club_id: string;
  club_name: string;
  last_message: string;
  last_message_time: string;
  sender_name: string;
  member_count: number;
}

export default function NotificationsImproved() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [clubChats, setClubChats] = useState<ClubChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load general notifications - only unread ones
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // Load join requests (for organizers) - these stay visible
      const { data: requestData, error: requestError } = await supabase
        .from('join_requests')
        .select(`
          id,
          message,
          created_at,
          status,
          requester:profiles!join_requests_requester_id_fkey(id, full_name),
          activity:activities(id, title, date, time, type)
        `)
        .eq('activities.organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (requestError) throw requestError;

      const transformedRequests = (requestData || [])
        .map((item: any) => ({
          id: item.id,
          message: item.message,
          created_at: item.created_at,
          status: item.status,
          requester: Array.isArray(item.requester) ? item.requester[0] : item.requester,
          activity: Array.isArray(item.activity) ? item.activity[0] : item.activity,
        }))
        .filter((item: any) => item.requester && item.activity);

      setJoinRequests(transformedRequests);

      // Load club chats with recent messages
      const { data: clubMemberships } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (clubMemberships && clubMemberships.length > 0) {
        const clubIds = clubMemberships.map(m => m.club_id);

        // Get latest message for each club
        const clubChatsData: ClubChat[] = [];
        
        for (const clubId of clubIds) {
          const { data: clubData } = await supabase
            .from('clubs')
            .select('name, member_count')
            .eq('id', clubId)
            .single();

          const { data: lastMessage } = await supabase
            .from('club_chat_messages')
            .select(`
              message,
              created_at,
              profiles (
                full_name
              )
            `)
            .eq('club_id', clubId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (clubData) {
            const profiles: any = lastMessage?.profiles;
            const senderName = Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name;
            
            clubChatsData.push({
              club_id: clubId,
              club_name: clubData.name,
              last_message: lastMessage?.message || 'No messages yet',
              last_message_time: lastMessage?.created_at || new Date().toISOString(),
              sender_name: senderName || '',
              member_count: clubData.member_count || 0,
            });
          }
        }

        // Sort by most recent message
        clubChatsData.sort((a, b) => 
          new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
        );

        setClubChats(clubChatsData);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Remove from state immediately
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read immediately
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.related_type === 'activity' && notification.related_id) {
      (navigation as any).navigate('ActivityDetail', { activityId: notification.related_id });
    }
  };

  const handleAccept = async (requestId: string, requesterName: string, activityId: string) => {
    setProcessingId(requestId);

    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert(
        'Accepted!',
        `${requesterName} can now join the activity`,
        [
          {
            text: 'View Chat',
            onPress: () => {
              (navigation as any).navigate('ActivityChat', { activityId });
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
      loadData();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', error.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, requesterName: string) => {
    Alert.alert(
      'Reject Request',
      `Reject ${requesterName}'s request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(requestId);

            try {
              const { error } = await supabase
                .from('join_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId);

              if (error) throw error;

              Alert.alert('Rejected', `${requesterName}'s request has been rejected`);
              loadData();
            } catch (error: any) {
              console.error('Error rejecting request:', error);
              Alert.alert('Error', error.message || 'Failed to reject request');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderJoinRequest = (item: JoinRequest) => (
    <View key={item.id} style={styles.requestCard}>
      {/* Activity Title - PRIMARY (20px, bold 700) */}
      <Text style={styles.activityTitle}>{item.activity.title}</Text>

      {/* Activity Details - SECONDARY (13px, gray) */}
      <Text style={styles.activityDetails}>
        {item.activity.date} at {item.activity.time}
      </Text>

      {/* User Info Row - SECONDARY */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.requester.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.requester.full_name}</Text>
          <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
        </View>
        {item.status !== 'pending' && (
          <View
            style={[
              styles.statusBadge,
              item.status === 'accepted' ? styles.acceptedBadge : styles.rejectedBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status === 'accepted' ? '✓' : '✗'}</Text>
          </View>
        )}
      </View>

      {/* Message - DISTINCT BACKGROUND */}
      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      )}

      {/* Actions - PROPER SPACING */}
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item.id, item.requester.full_name)}
            disabled={processingId === item.id}
          >
            <Text style={styles.rejectButtonText}>
              {processingId === item.id ? 'Processing...' : 'Reject'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(item.id, item.requester.full_name, item.activity.id)}
            disabled={processingId === item.id}
          >
            <Text style={styles.acceptButtonText}>
              {processingId === item.id ? 'Processing...' : 'Accept'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'accepted' && (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => {
            (navigation as any).navigate('ActivityChat', { activityId: item.activity.id });
          }}
        >
          <Text style={styles.chatButtonText}>💬 View Chat</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotification = (item: Notification) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.notificationBanner}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationBannerContent}>
          <Text style={styles.notificationBannerText}>{item.title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              markAsRead(item.id);
            }}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderClubChat = (item: ClubChat) => {
    const clubInitial = item.club_name.charAt(0).toUpperCase();
    
    return (
      <TouchableOpacity
        key={item.club_id}
        style={styles.clubChatCard}
        onPress={() => {
          (navigation as any).navigate('ClubChat', { 
            clubId: item.club_id, 
            clubName: item.club_name 
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.clubAvatar}>
          <Text style={styles.clubAvatarText}>{clubInitial}</Text>
        </View>
        
        <View style={styles.clubChatContent}>
          <View style={styles.clubChatHeader}>
            <Text style={styles.clubChatName}>{item.club_name}</Text>
            <Text style={styles.clubChatTime}>{formatDate(item.last_message_time)}</Text>
          </View>
          
          <Text style={styles.clubChatMessage} numberOfLines={2}>
            {item.sender_name ? `${item.sender_name}: ` : ''}{item.last_message}
          </Text>
          
          <View style={styles.clubChatFooter}>
            <Text style={styles.clubMemberCount}>👥 {item.member_count} members</Text>
          </View>
        </View>
        
        <Text style={styles.clubChatArrow}>→</Text>
      </TouchableOpacity>
    );
  };

  const pendingRequests = joinRequests.filter(r => r.status === 'pending');
  const processedRequests = joinRequests.filter(r => r.status !== 'pending');
  const unreadCount = notifications.length + pendingRequests.length;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      </View>
    );
  }

  const hasAnyContent =
    pendingRequests.length > 0 || processedRequests.length > 0 || notifications.length > 0 || clubChats.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Banner - Small at top */}
        {notifications.length > 0 && (
          <View style={styles.notificationsBannerSection}>
            {notifications.map(renderNotification)}
          </View>
        )}

        {/* Club Chats */}
        {clubChats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Club Chats</Text>
            {clubChats.map(renderClubChat)}
          </View>
        )}

        {/* Pending Join Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {pendingRequests.map(renderJoinRequest)}
          </View>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {processedRequests.map(renderJoinRequest)}
          </View>
        )}

        {/* Empty State */}
        {!hasAnyContent && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              Join requests and activity updates will appear here
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Join Request Card Styles (Per Spec)
  requestCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 20, // PRIMARY: 20px, bold 700
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  activityDetails: {
    fontSize: 13, // SECONDARY: 13px, gray
    color: '#666',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15, // SECONDARY: 15px, semibold 600
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12, // METADATA: 12px, 60% opacity
    color: '#999',
    opacity: 0.6,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptedBadge: {
    backgroundColor: '#E8F5E9', // Green for accepted
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE', // Red for rejected
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59',
  },
  messageContainer: {
    backgroundColor: '#F5F5F5', // DISTINCT BACKGROUND
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20, // 1.4 line height (14 * 1.4 ≈ 20)
  },
  actions: {
    flexDirection: 'row',
    gap: 12, // 12px spacing between buttons
    marginTop: 12, // 12px spacing from content above
  },
  actionButton: {
    flex: 1,
    minHeight: 44, // 44px minimum touch target
    minWidth: 80, // 80px minimum width
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  acceptButton: {
    backgroundColor: '#4A7C59', // Primary color
  },
  rejectButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    minHeight: 44,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Notification Banner Styles (Small, compact at top)
  notificationsBannerSection: {
    marginBottom: 16,
  },
  notificationBanner: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 3,
    borderLeftColor: '#4A7C59',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 6,
  },
  notificationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationBannerText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  // General Notification Card Styles (REMOVED - using banner instead)
  notificationCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadCard: {
    borderColor: '#4A7C59',
    backgroundColor: '#F9FFF9',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A7C59',
    marginLeft: 12,
  },
  // Club Chat Card Styles
  clubChatCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clubAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clubChatContent: {
    flex: 1,
  },
  clubChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubChatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  clubChatTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  clubChatMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  clubChatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubMemberCount: {
    fontSize: 12,
    color: '#999',
  },
  clubChatArrow: {
    fontSize: 20,
    color: '#999',
    marginLeft: 8,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
