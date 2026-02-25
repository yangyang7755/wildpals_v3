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

export default function NotificationsImproved() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load general notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // Delete all notifications after viewing (they've been seen)
      if (notifData && notifData.length > 0) {
        const notificationIds = notifData.map(n => n.id);
        
        // Delete notifications in background (don't wait for response)
        supabase
          .from('notifications')
          .delete()
          .in('id', notificationIds)
          .then(() => {
            // After deletion, clear from state after a short delay so user can see them
            setTimeout(() => {
              setNotifications([]);
            }, 2000); // Show for 2 seconds then remove
          });
      }

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
      // Try both column names for compatibility
      const { error: isReadError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (isReadError) {
        // Fallback to 'read' column if 'is_read' doesn't exist
        await supabase
          .from('notifications')
          .update({ read: true } as any)
          .eq('id', notificationId);
      }

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    const isUnread = notification.is_read === false || notification.read === false;
    if (isUnread) {
      await markAsRead(notification.id);
    }

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
    const isUnread = item.is_read === false || item.read === false;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {item.message && <Text style={styles.notificationMessage}>{item.message}</Text>}
          <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const pendingRequests = joinRequests.filter(r => r.status === 'pending');
  const processedRequests = joinRequests.filter(r => r.status !== 'pending');
  const unreadCount = notifications.filter(n => n.is_read === false || n.read === false).length + pendingRequests.length;

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
    pendingRequests.length > 0 || processedRequests.length > 0 || notifications.length > 0;

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
        {/* Pending Join Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {pendingRequests.map(renderJoinRequest)}
          </View>
        )}

        {/* General Notifications */}
        {notifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Updates</Text>
            {notifications.map(renderNotification)}
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
  // General Notification Card Styles
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
