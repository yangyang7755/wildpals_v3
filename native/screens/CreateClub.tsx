import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function CreateClub() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [sportType, setSportType] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !location || !sportType) {
      Alert.alert('Error', 'Please fill in club name, location, and sport type');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a club');
      return;
    }

    setCreating(true);

    try {
      // Create club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert([{
          name,
          description,
          location,
          sport_type: sportType,
          creator_id: user.id,
          member_count: 1,
          is_private: isPrivate,
        }])
        .select()
        .single();

      if (clubError) throw clubError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('club_members')
        .insert([{
          club_id: clubData.id,
          user_id: user.id,
          role: 'admin',
          status: 'active',
        }]);

      if (memberError) throw memberError;

      Alert.alert(
        'Success!',
        'Your club has been created',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Clubs' as never);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating club:', error);
      Alert.alert('Error', error.message || 'Failed to create club');
    } finally {
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Club</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <Text style={styles.sectionTitle}>Club Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Club name *"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Location *"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
        />

        <TextInput
          style={styles.input}
          placeholder="Sport/Activity type * (e.g., Cycling, Climbing, Running)"
          placeholderTextColor="#999"
          value={sportType}
          onChangeText={setSportType}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.privacyOptions}>
          <TouchableOpacity
            style={[
              styles.privacyCard,
              isPrivate && styles.privacyCardActive
            ]}
            onPress={() => setIsPrivate(true)}
          >
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={[
              styles.privacyTitle,
              isPrivate && styles.privacyTitleActive
            ]}>
              Private
            </Text>
            <Text style={styles.privacyDescription}>
              Requires admin approval to join
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.privacyCard,
              !isPrivate && styles.privacyCardActive
            ]}
            onPress={() => setIsPrivate(false)}
          >
            <Text style={styles.privacyIcon}>🌐</Text>
            <Text style={[
              styles.privacyTitle,
              !isPrivate && styles.privacyTitleActive
            ]}>
              Public
            </Text>
            <Text style={styles.privacyDescription}>
              Anyone can join instantly
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create Club'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    fontSize: 32,
    color: '#4A7C59',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  privacyCard: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
  },
  privacyCardActive: {
    borderColor: '#4A7C59',
    backgroundColor: '#E8F5E9',
  },
  privacyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  privacyTitleActive: {
    color: '#4A7C59',
  },
  privacyDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
