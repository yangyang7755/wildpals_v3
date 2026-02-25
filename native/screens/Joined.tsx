import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface JoinRequest {
  id: string;
  activity_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  activities: {
    id: string;
    type: 'cycling' | 'climbing' | 'running';
    title: string;
    date: string;
    time: string;
    location: string;
    organizer_id: string;
    max_participants: number;
    distance?: number;
    elevation?: number;
    climbing_level?: string;
    profiles?: {
      full_name: string;
      email: string;
    };
  };
}

interface ChatPreview {
  activity_id: string;
  last_message: string;
  last_message_time: string;
  sender_name: string;
  sender_id: string;
  unread_count: number;
}

export default function Joined() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [chatPreviews, setChatPreviews] = useState<Record<string, ChatPreview>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'joined' | 'pending'>('joined');

  useEffect(() => {
    loadJoinRequests();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJoinRequests();
    }, [])
  );

  const loadJoinRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          *,
          activities:activity_id (
            *,
            profiles:organizer_id (
              full_name,
              email
            )
          )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);

      // Load chat previews for accepted activities
      const acceptedActivityIds = (data || [])
        .filter(req => req.status === 'accepted')
        .map(req => req.activity_id);

      if (acceptedActivityIds.length > 0) {
        await loadChatPreviews(acceptedActivityIds);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadChatPreviews = async (activityIds: string[]) => {
    if (!user) return;
    
    try {
      const previews: Record<string, ChatPreview> = {};

      for (const activityId of activityIds) {
        // Get last message
        const { data: lastMessageData, error: messageError } = await supabase
          .from('chat_messages')
          .select(`
            id,
            message,
            created_at,
            activity_id,
            sender_id,
            profiles:sender_id (
              full_name
            )
          `)
          .eq('activity_id', activityId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!messageError && lastMessageData) {
          // Count unread messages (messages not sent by current user and created after user's last read)
          const { count: unreadCount } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('activity_id', activityId)
            .neq('sender_id', user.id)
            .gt('created_at', lastMessageData.created_at);

          previews[activityId] = {
            activity_id: activityId,
            last_message: lastMessageData.message,
            last_message_time: lastMessageData.created_at,
            sender_name: (lastMessageData.profiles as any)?.full_name || 'Someone',
            sender_id: lastMessageData.sender_id,
            unread_count: unreadCount || 0,
          };
        }
      }

      setChatPreviews(previews);
    } catch (error) {
      console.error('Error loading chat previews:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJoinRequests();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleOpenChat = (activityId: string) => {
    navigation.navigate('ActivityChat' as never, { activityId } as never);
  };

  const filteredRequests = joinRequests.filter((request) => {
    if (selectedTab === 'joined') return request.status === 'accepted';
    if (selectedTab === 'pending') return request.status === 'pending';
    return true;
  });

  const renderJoinRequest = ({ item }: { item: JoinRequest }) => {
    const activity = item.activities;
    if (!activity) return null;

    const chatPreview = chatPreviews[activity.id];
    const hasUnread = chatPreview && chatPreview.unread_count > 0;

    // For accepted activities, show chat preview
    if (item.status === 'accepted') {
      return (
        <TouchableOpacity
          style={styles.activityCard}
          onPress={() => handleOpenChat(activity.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>
                {activity.type === 'cycling' ? '🚴' : activity.type === 'climbing' ? '🧗' : '🏃'}
              </Text>
            </View>

            <View style={styles.activityInfo}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {activity.title}
                </Text>
                {chatPreview && (
                  <Text style={styles.messageTime}>
                    {formatTimeAgo(chatPreview.last_message_time)}
                  </Text>
                )}
              </View>

              {chatPreview ? (
                <View style={styles.messagePreview}>
                  <Text style={styles.messageText} numberOfLines={1}>
                    {chatPreview.sender_id === user?.id ? 'You: ' : `${chatPreview.sender_name}: `}
                    {chatPreview.last_message}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noMessageText}>No messages yet</Text>
              )}
            </View>

            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{chatPreview.unread_count}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // For pending activities, show status
    return (
      <View style={styles.activityCard}>
        <View style={styles.cardContent}>
          <View style={styles.activityIcon}>
            <Text style={styles.activityIconText}>
              {activity.type === 'cycling' ? '🚴' : activity.type === 'climbing' ? '🧗' : '🏃'}
            </Text>
          </View>

          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle} numberOfLines={1}>
              {activity.title}
            </Text>
            <Text style={styles.pendingStatusText}>⏳ Waiting for approval</Text>
          </View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Recent Activity</Text>
      </View>

      <View style={styles.filterTabs}>
        {[
          { id: 'joined', label: 'Joined' },
          { id: 'pending', label: 'Requests' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              selectedTab === tab.id && styles.filterTabActive
            ]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Text style={[
              styles.filterTabText,
              selectedTab === tab.id && styles.filterTabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>No activities yet</Text>
          <Text style={styles.emptyText}>
            {selectedTab === 'pending' 
              ? 'No pending requests'
              : 'Join activities from the Explore page to see them here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderJoinRequest}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 28,
  },
  activityInfo: {
    flex: 1,
    marginRight: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 13,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  noMessageText: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  pendingStatusText: {
    fontSize: 14,
    color: '#F57C00',
    marginTop: 2,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
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
