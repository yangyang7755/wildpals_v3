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

interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  sport_type: string;
  member_count: number;
  is_private: boolean;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ClubManagement() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { clubId } = route.params as { clubId: string };

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedClub, setEditedClub] = useState<Partial<Club>>({});

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      // Load club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (clubError) throw clubError;
      setClub(clubData);
      setEditedClub(clubData);

      // Load all members
      const { data: membersData, error: membersError } = await supabase
        .from('club_members')
        .select(`
          id,
          user_id,
          role,
          status,
          joined_at,
          profiles (
            full_name,
            email
          )
        `)
        .eq('club_id', clubId)
        .order('joined_at', { ascending: false });

      if (membersError) throw membersError;

      const active = membersData?.filter(m => m.status === 'active') || [];
      const pending = membersData?.filter(m => m.status === 'pending') || [];
      
      setMembers(active);
      setPendingMembers(pending);
    } catch (error) {
      console.error('Error loading club data:', error);
      Alert.alert('Error', 'Failed to load club data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMember = async (memberId: string, userName: string) => {
    setProcessingId(memberId);
    try {
      const { error } = await supabase
        .from('club_members')
        .update({ status: 'active' })
        .eq('id', memberId);

      if (error) throw error;
      Alert.alert('Success', `${userName} has been approved!`);
      loadClubData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectMember = async (memberId: string, userName: string) => {
    Alert.alert(
      'Reject Member',
      `Reject ${userName}'s request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(memberId);
            try {
              const { error } = await supabase
                .from('club_members')
                .update({ status: 'rejected' })
                .eq('id', memberId);

              if (error) throw error;
              Alert.alert('Request Rejected', `${userName}'s request has been rejected`);
              loadClubData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject member');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleAdmin = async (memberId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';

    Alert.alert(
      `${action === 'promote' ? 'Make Admin' : 'Remove Admin'}`,
      `${action === 'promote' ? 'Give' : 'Remove'} admin privileges ${action === 'promote' ? 'to' : 'from'} ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'promote' ? 'Make Admin' : 'Remove Admin',
          onPress: async () => {
            setProcessingId(memberId);
            try {
              const { error } = await supabase
                .from('club_members')
                .update({ role: newRole })
                .eq('id', memberId);

              if (error) throw error;
              Alert.alert('Success', `${userName} is now ${newRole === 'admin' ? 'an admin' : 'a member'}`);
              loadClubData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update role');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (memberId: string, userName: string) => {
    Alert.alert(
      'Remove Member',
      `Remove ${userName} from this club?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(memberId);
            try {
              const { error } = await supabase
                .from('club_members')
                .delete()
                .eq('id', memberId);

              if (error) throw error;
              Alert.alert('Member Removed', `${userName} has been removed`);
              loadClubData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove member');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveClub = async () => {
    if (!club) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .update(editedClub)
        .eq('id', clubId);

      if (error) throw error;
      Alert.alert('Success', 'Club updated successfully');
      setShowEditModal(false);
      loadClubData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update club');
    }
  };

  const handleDeleteClub = async () => {
    Alert.alert(
      'Delete Club',
      'Are you sure? This will delete all club data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('clubs')
                .delete()
                .eq('id', clubId);

              if (error) throw error;
              Alert.alert('Club Deleted', 'The club has been deleted');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete club');
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
        <Text style={styles.headerTitle}>Manage Club</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButton}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Club Info */}
        <View style={styles.section}>
          <Text style={styles.clubTitle}>{club.name}</Text>
          <Text style={styles.clubInfo}>📍 {club.location}</Text>
          <Text style={styles.clubInfo}>🏃 {club.sport_type}</Text>
          <Text style={styles.memberCount}>
            {club.member_count} members
          </Text>
        </View>

        {/* Pending Members */}
        {pendingMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Requests ({pendingMembers.length})
            </Text>
            {pendingMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {member.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.memberName}>
                      {member.profiles?.full_name || 'User'}
                    </Text>
                    <Text style={styles.memberEmail}>
                      {member.profiles?.email}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectMember(member.id, member.profiles?.full_name)}
                    disabled={processingId === member.id}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleApproveMember(member.id, member.profiles?.full_name)}
                    disabled={processingId === member.id}
                  >
                    <Text style={styles.acceptButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Current Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Members ({members.length})
          </Text>
          {members.length === 0 ? (
            <Text style={styles.emptyText}>No members yet</Text>
          ) : (
            members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {member.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.memberName}>
                      {member.profiles?.full_name || 'User'}
                    </Text>
                    <Text style={styles.memberEmail}>
                      {member.profiles?.email}
                    </Text>
                    {member.role === 'admin' && (
                      <Text style={styles.adminBadge}>Admin</Text>
                    )}
                  </View>
                </View>
                {member.user_id !== user?.id && (
                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      style={styles.roleButton}
                      onPress={() => handleToggleAdmin(member.id, member.role, member.profiles?.full_name)}
                      disabled={processingId === member.id}
                    >
                      <Text style={styles.roleButtonText}>
                        {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveMember(member.id, member.profiles?.full_name)}
                      disabled={processingId === member.id}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteClub}
          >
            <Text style={styles.deleteButtonText}>Delete Club</Text>
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
            <Text style={styles.modalTitle}>Edit Club</Text>
            <TouchableOpacity onPress={handleSaveClub}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Club Name</Text>
            <TextInput
              style={styles.input}
              value={editedClub.name}
              onChangeText={(text) => setEditedClub({ ...editedClub, name: text })}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedClub.description}
              onChangeText={(text) => setEditedClub({ ...editedClub, description: text })}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={editedClub.location}
              onChangeText={(text) => setEditedClub({ ...editedClub, location: text })}
            />

            <Text style={styles.label}>Sport Type</Text>
            <View style={styles.sportTypeButtons}>
              {['cycling', 'climbing', 'running', 'mixed'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.sportTypeButton,
                    editedClub.sport_type === type && styles.sportTypeButtonActive,
                  ]}
                  onPress={() => setEditedClub({ ...editedClub, sport_type: type })}
                >
                  <Text
                    style={[
                      styles.sportTypeButtonText,
                      editedClub.sport_type === type && styles.sportTypeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Private Club</Text>
              <TouchableOpacity
                style={[styles.switch, editedClub.is_private && styles.switchActive]}
                onPress={() => setEditedClub({ ...editedClub, is_private: !editedClub.is_private })}
              >
                <View style={[styles.switchThumb, editedClub.is_private && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>
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
  clubTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  clubInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  memberCount: {
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
  memberCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberInfo: {
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
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    fontSize: 12,
    color: '#4A7C59',
    fontWeight: '600',
    marginTop: 4,
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
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonText: {
    color: '#1976D2',
    fontSize: 13,
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
  sportTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  sportTypeButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4A7C59',
  },
  sportTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sportTypeButtonTextActive: {
    color: '#4A7C59',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#4A7C59',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
});
