import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  sport_type: string;
  member_count: number;
  creator_id: string;
  is_private: boolean;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  organizer_id: string;
  location: string;
  profiles?: {
    full_name: string;
  };
}

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function ClubDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { clubId } = route.params as { clubId: string };

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'events' | 'members' | 'chat'>('events');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadClubData();
    loadRecentMessages();
  }, [clubId]);

  const loadRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('club_chat_messages')
        .select(`
          id,
          sender_id,
          message,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentMessages(data || []);
    } catch (error) {
      console.error('Error loading recent messages:', error);
    }
  };

  const loadClubData = async () => {
    try {
      // Load club details
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (clubError) throw clubError;
      setClub(clubData);

      // Check user membership status
      if (user) {
        const { data: memberData } = await supabase
          .from('club_members')
          .select('status, role')
          .eq('club_id', clubId)
          .eq('user_id', user.id)
          .single();

        setMembershipStatus(memberData?.status || null);
        setUserRole(memberData?.role || null);
      }

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('club_members')
        .select(`
          id,
          user_id,
          role,
          status,
          profiles (
            full_name,
            email
          )
        `)
        .eq('club_id', clubId)
        .eq('status', 'active')
        .limit(20);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Load club activities (only show club-specific activities)
      // Get today's date to filter out past activities
      const today = new Date().toISOString().split('T')[0];
      
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id, 
          title, 
          date, 
          time, 
          type, 
          organizer_id,
          location,
          profiles:organizer_id (
            full_name
          )
        `)
        .contains('visible_to_clubs', [clubId]) // Only activities visible to this club
        .gte('date', today) // Only future activities
        .order('date', { ascending: true })
        .limit(20);

      if (activitiesError) throw activitiesError;

      // Transform and sort activities: admin posts first, then by date
      const transformedActivities = (activitiesData || []).map((activity: any) => ({
        ...activity,
        profiles: Array.isArray(activity.profiles) && activity.profiles.length > 0 
          ? activity.profiles[0] 
          : activity.profiles,
      }));

      // Check which organizers are club admins
      const organizerIds = transformedActivities.map((a: any) => a.organizer_id);
      const { data: adminData } = await supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', clubId)
        .eq('role', 'admin')
        .in('user_id', organizerIds);

      const adminIds = new Set((adminData || []).map(a => a.user_id));

      // Sort: admin posts first, then by date
      const sortedActivities = transformedActivities.sort((a: any, b: any) => {
        const aIsAdmin = adminIds.has(a.organizer_id);
        const bIsAdmin = adminIds.has(b.organizer_id);
        
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        
        // If both admin or both not admin, sort by date
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setActivities(sortedActivities);

    } catch (error) {
      console.error('Error loading club data:', error);
      Alert.alert('Error', 'Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a club');
      return;
    }
    setJoinMessage(`Hi! I'd like to join ${club?.name}.`);
    setShowJoinModal(true);
  };

  const submitJoinRequest = async () => {
    if (!user || !club) return;

    try {
      const { error } = await supabase
        .from('club_members')
        .insert([{
          club_id: club.id,
          user_id: user.id,
          join_message: joinMessage,
          status: club.is_private ? 'pending' : 'active', // Auto-approve for public clubs
          role: 'member',
        }]);

      if (error) throw error;

      const message = club.is_private 
        ? 'Your join request has been sent to the club admin'
        : 'You have joined the club!';
      
      Alert.alert('Success!', message);
      setShowJoinModal(false);
      setMembershipStatus(club.is_private ? 'pending' : 'active');
      loadClubData(); // Refresh to update member count
    } catch (error: any) {
      console.error('Error sending join request:', error);
      Alert.alert('Error', error.message || 'Failed to send join request');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const clubInitial = club?.name.charAt(0).toUpperCase() || '?';

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.centerContainer}>
        <Text>Club not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Club</Text>
        {userRole === 'admin' && (
          <TouchableOpacity onPress={() => navigation.navigate('ClubManagement' as never, { clubId } as never)}>
            <Text style={styles.manageButton}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Club Header - Always visible */}
      <View style={styles.clubHeaderContainer}>
        <View style={styles.clubHeader}>
          <View style={styles.clubLogo}>
            <Text style={styles.clubLogoText}>{clubInitial}</Text>
          </View>
          <View style={styles.clubNameRow}>
            <Text style={styles.clubName}>{club.name}</Text>
            {club.is_private && <Text style={styles.privateIcon}>🔒</Text>}
          </View>
          <Text style={styles.clubLocation}>📍 {club.location}</Text>
          <Text style={styles.clubMembers}>👥 {members.length} members</Text>
          <Text style={styles.clubSportType}>{club.sport_type}</Text>
          
          {club.description && (
            <Text style={styles.clubDescription}>{club.description}</Text>
          )}

          {/* Join/Status Button */}
          {membershipStatus === 'active' ? (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>
                {userRole === 'admin' ? '✓ Admin' : '✓ Member'}
              </Text>
            </View>
          ) : membershipStatus === 'pending' ? (
            <View style={[styles.memberBadge, styles.pendingBadge]}>
              <Text style={styles.pendingBadgeText}>⏳ Pending</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinRequest}>
              <Text style={styles.joinButtonText}>
                {club.is_private ? 'Request to Join' : 'Join Club'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'events' && styles.tabActive]}
            onPress={() => setSelectedTab('events')}
          >
            <Text style={[styles.tabText, selectedTab === 'events' && styles.tabTextActive]}>
              Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'members' && styles.tabActive]}
            onPress={() => setSelectedTab('members')}
          >
            <Text style={[styles.tabText, selectedTab === 'members' && styles.tabTextActive]}>
              Members
            </Text>
          </TouchableOpacity>
          {membershipStatus === 'active' && (
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'chat' && styles.tabActive]}
              onPress={() => setSelectedTab('chat')}
            >
              <Text style={[styles.tabText, selectedTab === 'chat' && styles.tabTextActive]}>
                Chat
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Content - No ScrollView wrapper */}
      {selectedTab === 'events' ? (
        <ScrollView style={styles.tabContent}>
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          ) : (
            activities.map((activity) => {
              // Check if organizer is club admin
              const isAdminPost = members.some(
                m => m.user_id === activity.organizer_id && m.role === 'admin'
              );
              
              return (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    isAdminPost && styles.activityCardAdmin
                  ]}
                  onPress={() => (navigation as any).navigate('ActivityDetail', { activityId: activity.id })}
                  activeOpacity={0.7}
                >
                  {/* Activity Type Labels */}
                  {(activity as any).activity_type === 'recurrent' && (
                    <View style={styles.activityTypeLabel}>
                      <Text style={styles.activityTypeLabelText}>🔄</Text>
                    </View>
                  )}
                  {(activity as any).activity_type === 'multi_day' && (
                    <View style={[styles.activityTypeLabel, styles.activityTypeLabelMultiDay]}>
                      <Text style={styles.activityTypeLabelText}>📅</Text>
                    </View>
                  )}
                  
                  <View style={styles.activityInfo}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      {isAdminPost && (
                        <View style={styles.adminLabel}>
                          <Text style={styles.adminLabelText}>ADMIN</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.activityDate}>
                      {formatDate(activity.date)} at {activity.time}
                    </Text>
                    <Text style={styles.activityLocation}>
                      📍 {activity.location}
                    </Text>
                    <Text style={styles.activityOrganizer}>
                      by {activity.profiles?.full_name || 'Unknown'}
                    </Text>
                  </View>
                  <Text style={styles.activityArrow}>→</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      ) : selectedTab === 'members' ? (
        <ScrollView style={styles.tabContent}>
          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No members yet</Text>
            </View>
          ) : (
            <View style={styles.membersGrid}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberCard}
                  onPress={() => navigation.navigate('UserProfile' as never, { userId: member.user_id } as never)}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.profiles?.full_name || 'User'}
                  </Text>
                  {member.role === 'admin' && (
                    <Text style={styles.adminBadge}>Admin</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.tabContent}>
          <TouchableOpacity
            style={styles.chatPreviewCard}
            onPress={() => (navigation as any).navigate('ClubChat', { clubId, clubName: club?.name })}
            activeOpacity={0.7}
          >
            <View style={styles.chatPreviewHeader}>
              <Text style={styles.chatPreviewTitle}>Club Chat</Text>
              <View style={styles.chatPreviewBadge}>
                <Text style={styles.chatPreviewBadgeIcon}>👥</Text>
                <Text style={styles.chatPreviewBadgeText}>{members.length}</Text>
              </View>
            </View>
            
            {recentMessages.length === 0 ? (
              <View style={styles.chatPreviewEmpty}>
                <Text style={styles.chatPreviewEmptyText}>No messages yet. Start the conversation!</Text>
              </View>
            ) : (
              <View style={styles.chatPreviewMessages}>
                {recentMessages.map((msg) => {
                  const isCurrentUser = msg.sender_id === user?.id;
                  const senderName = isCurrentUser ? 'You' : (msg.profiles?.full_name || 'Unknown');
                  const time = new Date(msg.created_at).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  });
                  
                  return (
                    <View key={msg.id} style={styles.chatPreviewMessage}>
                      <View style={styles.chatPreviewMessageHeader}>
                        <Text style={styles.chatPreviewMessageSender}>{senderName}</Text>
                        <Text style={styles.chatPreviewMessageTime}>{time}</Text>
                      </View>
                      <Text style={styles.chatPreviewMessageText} numberOfLines={2}>
                        {msg.message}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
            
            <View style={styles.chatPreviewFooter}>
              <Text style={styles.chatPreviewFooterText}>Tap to view full chat</Text>
              <Text style={styles.chatPreviewFooterArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

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
              Send a message to the club admin
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  backButton: {
    fontSize: 32,
    color: '#4A7C59',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A7C59',
    flex: 1,
  },
  manageButton: {
    fontSize: 24,
  },
  clubHeaderContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  clubHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  clubLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clubLogoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  clubNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginRight: 8,
  },
  privateIcon: {
    fontSize: 18,
  },
  clubLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clubMembers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clubSportType: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: '600',
    marginBottom: 16,
  },
  clubDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  memberBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  memberBadgeText: {
    color: '#4A7C59',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  pendingBadgeText: {
    color: '#F57C00',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A7C59',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#4A7C59',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  activityTypeLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4A7C59',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  activityTypeLabelMultiDay: {
    backgroundColor: '#FF9800',
  },
  activityTypeLabelText: {
    fontSize: 16,
  },
  activityCardAdmin: {
    backgroundColor: '#F0F9F4',
    borderColor: '#4A7C59',
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  adminLabel: {
    backgroundColor: '#4A7C59',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  activityOrganizer: {
    fontSize: 12,
    color: '#999',
  },
  activityArrow: {
    fontSize: 20,
    color: '#999',
    marginLeft: 8,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  memberCard: {
    width: '30%',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
  },
  adminBadge: {
    fontSize: 10,
    color: '#4A7C59',
    fontWeight: '600',
    marginTop: 2,
  },
  chatPreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  chatPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatPreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  chatPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A7C59',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  chatPreviewBadgeIcon: {
    fontSize: 12,
  },
  chatPreviewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  chatPreviewEmpty: {
    padding: 32,
    alignItems: 'center',
  },
  chatPreviewEmptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  chatPreviewMessages: {
    padding: 16,
    gap: 12,
  },
  chatPreviewMessage: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chatPreviewMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatPreviewMessageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59',
  },
  chatPreviewMessageTime: {
    fontSize: 12,
    color: '#999',
  },
  chatPreviewMessageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  chatPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chatPreviewFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59',
  },
  chatPreviewFooterArrow: {
    fontSize: 18,
    color: '#4A7C59',
  },
  chatContainer: {
    flex: 1,
    minHeight: 400,
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
});
