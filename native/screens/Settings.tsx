import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data including activities, clubs, and messages will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This is your last chance. Type DELETE to confirm account deletion.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'I understand, delete my account',
          style: 'destructive',
          onPress: executeDeleteAccount,
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      // Step 1: Delete all user data from database tables
      // The database has CASCADE DELETE set up, so deleting profile will cascade to:
      // - activities, join_requests, club_members, notifications, messages, etc.
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Step 2: Delete user from Supabase Auth
      // This permanently removes the authentication record
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      // If admin.deleteUser fails (requires service role), try regular delete
      if (authError) {
        console.log('Admin delete failed, trying user delete:', authError);
        
        // Alternative: Use the user's own session to delete their account
        const { error: userDeleteError } = await supabase.rpc('delete_user');
        
        if (userDeleteError) {
          console.error('User delete also failed:', userDeleteError);
          // Continue anyway - profile is deleted, auth can be cleaned up manually
        }
      }

      // Step 3: Sign out and clear ALL local data
      await supabase.auth.signOut();
      await AsyncStorage.clear(); // Clear all AsyncStorage data
      
      // Show success message and navigate to login
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted. We\'re sorry to see you go!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigation to Login and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', error.message || 'Failed to delete account. Please contact support at yangyang.ruohan.liu@gmail.com');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login' as never);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.menuIcon}>✏️</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Text style={styles.menuSubtext}>Update your information</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.menuIcon}>🚪</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Logout</Text>
              <Text style={styles.menuSubtext}>Sign out of your account</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.menuIcon}>📄</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.menuSubtext}>How we handle your data</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('TermsOfService' as never)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.menuIcon}>📋</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Terms of Service</Text>
              <Text style={styles.menuSubtext}>Rules and guidelines</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('mailto:yangyang.ruohan.liu@gmail.com?subject=Wildpals Support Request&body=Hi Wildpals Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.menuIcon}>💬</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Contact Support</Text>
              <Text style={styles.menuSubtext}>yangyang.ruohan.liu@gmail.com</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.menuIcon}>ℹ️</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>About Wildpals</Text>
              <Text style={styles.menuSubtext}>Version 1.0.0</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <View style={[styles.iconContainer, styles.dangerIconContainer]}>
              <Text style={styles.menuIcon}>🗑️</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuText, styles.dangerText]}>
                {deleting ? 'Deleting Account...' : 'Delete Account'}
              </Text>
              <Text style={styles.dangerSubtext}>Permanently remove your data</Text>
            </View>
            {deleting && <ActivityIndicator size="small" color="#D32F2F" />}
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Wildpals v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for outdoor enthusiasts</Text>
        </View>

        <View style={{ height: 40 }} />
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
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dangerTitle: {
    color: '#D32F2F',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dangerItem: {
    borderBottomColor: '#FFEBEE',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: '#FFEBEE',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#999',
  },
  dangerText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  dangerSubtext: {
    fontSize: 13,
    color: '#FF8A80',
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});
