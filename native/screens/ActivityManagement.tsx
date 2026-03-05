import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  meetup_location: string;
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
}

interface Participant {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ActivityManagement() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { activityId } = route.params as { activityId: string };

  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedActivity, setEditedActivity] = useState<Partial<Activity>>({});

  useEffect(() => {
    loadActivityData();
  }, [activityId]);

  const loadActivityData = async () => {
    try {
      // Load activity
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);
      setEditedActivity(activityData);

      // Load all join requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('join_requests')
        .select(`
          id,
          user_id: requester_id,
          status,
          created_at,
          profiles:requester_id (
            full_name,
            email
          )
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const accepted = requestsData?.filter(r => r.status === 'accepted') || [];
      const pending = requestsData?.filter(r => r.status === 'pending') || [];
      
      setParticipants(accepted);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error loading activity data:', error);
      Alert.alert('Error', 'Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, userName: string) => {
    setProcessingId(requestId);
    try {
      // Update join request status
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      Alert.alert('Success', `${userName} has been accepted!`);
      loadActivityData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string, userName: string) => {
    Alert.alert(
      'Reject Request',
      `Reject ${userName}'s request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(requestId);
            try {
              console.log('Attempting to reject request:', requestId);
              
              // Try to delete the request instead of updating status
              // This is cleaner and avoids potential RLS issues
              const { error } = await supabase
                .from('join_requests')
                .delete()
                .eq('id', requestId);

              console.log('Reject response:', { error });

              if (error) {
                console.error('Reject error details:', error);
                throw error;
              }
              
              Alert.alert('Request Rejected', `${userName}'s request has been rejected`);
              loadActivityData();
            } catch (error: any) {
              console.error('Caught error:', error);
              const errorMessage = error?.message || error?.error_description || 'Failed to reject request';
              Alert.alert('Error', errorMessage);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRemoveParticipant = async (requestId: string, userName: string) => {
    Alert.alert(
      'Remove Participant',
      `Remove ${userName} from this activity?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(requestId);
            try {
              const { error } = await supabase
                .from('join_requests')
                .delete()
                .eq('id', requestId);

              if (error) throw error;
              Alert.alert('Participant Removed', `${userName} has been removed`);
              loadActivityData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove participant');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveActivity = async () => {
    if (!activity) return;

    try {
      const { error } = await supabase
        .from('activities')
        .update(editedActivity)
        .eq('id', activityId);

      if (error) throw error;
      Alert.alert('Success', 'Activity updated successfully');
      setShowEditModal(false);
      loadActivityData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update activity');
    }
  };

  const handleDeleteActivity = async () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('activities')
                .delete()
                .eq('id', activityId);

              if (error) throw error;
              Alert.alert('Activity Deleted', 'The activity has been deleted');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Manage Activity</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButton}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Activity Info */}
        <View style={styles.section}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityInfo}>
            📅 {activity.date} at {activity.time}
          </Text>
          <Text style={styles.activityInfo}>📍 {activity.location}</Text>
          <Text style={styles.participantCount}>
            {participants.length}/{activity.max_participants} participants
          </Text>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.map((request) => (
              <View key={request.id} style={styles.participantCard}>
                <View style={styles.participantInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {request.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.participantName}>
                      {request.profiles?.full_name || 'User'}
                    </Text>
                    <Text style={styles.participantEmail}>
                      {request.profiles?.email}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectRequest(request.id, request.profiles?.full_name)}
                    disabled={processingId === request.id}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request.id, request.profiles?.full_name)}
                    disabled={processingId === request.id}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Current Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participants ({participants.length})
          </Text>
          {participants.length === 0 ? (
            <Text style={styles.emptyText}>No participants yet</Text>
          ) : (
            participants.map((participant) => (
              <View key={participant.id} style={styles.participantCard}>
                <View style={styles.participantInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {participant.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.participantName}>
                      {participant.profiles?.full_name || 'User'}
                    </Text>
                    <Text style={styles.participantEmail}>
                      {participant.profiles?.email}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveParticipant(participant.id, participant.profiles?.full_name)}
                  disabled={processingId === participant.id}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteActivity}
          >
            <Text style={styles.deleteButtonText}>Delete Activity</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TouchableOpacity onPress={handleSaveActivity}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={editedActivity.title}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, title: text })}
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={editedActivity.date}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, date: text })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={editedActivity.time}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, time: text })}
              placeholder="HH:MM"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={editedActivity.location}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, location: text })}
            />

            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              style={styles.input}
              value={String(editedActivity.max_participants || '')}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, max_participants: parseInt(text) || 0 })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Special Comments</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedActivity.special_comments}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, special_comments: text })}
              multiline
              numberOfLines={4}
            />
          </ScrollView>
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  activityInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7C59',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  participantCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  acceptButton: {
    backgroundColor: '#4A7C59',
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
  removeButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  dangerSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7C59',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
