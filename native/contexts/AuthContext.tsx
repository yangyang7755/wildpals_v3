import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-expo';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  email: string;
  fullName: string;
  hasCompletedProfile: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();

  // Load profile from Supabase when Clerk user changes
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isSignedIn && clerkUser) {
      loadUserProfile(clerkUser.id, clerkUser.primaryEmailAddress?.emailAddress || '', clerkUser.fullName || '');
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isSignedIn, clerkUser?.id, isClerkLoaded]);

  const loadUserProfile = async (clerkUserId: string, email: string, fullName: string) => {
    try {
      console.log('=== LOADING USER PROFILE ===');
      console.log('Clerk User ID:', clerkUserId);

      // Check if profile exists in Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', clerkUserId)
        .single() as { data: any; error: any };

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet — create it
        console.log('Creating new profile for Clerk user...');
        const newId = Crypto.randomUUID();
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newId,
            clerk_id: clerkUserId,
            email: email,
            full_name: fullName || 'User',
          } as any)
          .select()
          .single() as { data: any; error: any };

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Try to find by email as fallback (for existing users migrating)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single() as { data: any; error: any };

          if (existingProfile) {
            // Link existing profile to Clerk
            await supabase
              .from('profiles')
              .update({ clerk_id: clerkUserId } as any)
              .eq('id', existingProfile.id);

            const userData: User = {
              id: existingProfile.id,
              email: email,
              fullName: existingProfile.full_name || fullName || 'User',
              hasCompletedProfile: !!(existingProfile.gender && existingProfile.location),
            };
            setUser(userData);
            await AsyncStorage.setItem('@user', JSON.stringify(userData));
            setIsLoading(false);
            return;
          }
          // If all else fails, set a temporary user so the app doesn't break
          console.warn('Could not create profile, setting temporary user');
          const tempUser: User = {
            id: newId,
            email: email,
            fullName: fullName || 'User',
            hasCompletedProfile: false,
          };
          setUser(tempUser);
          await AsyncStorage.setItem('@user', JSON.stringify(tempUser));
          setIsLoading(false);
          return;
        }

        const userData: User = {
          id: newProfile.id,
          email: email,
          fullName: fullName || 'User',
          hasCompletedProfile: false,
        };
        setUser(userData);
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
      } else if (error) {
        throw error;
      } else {
        // Profile exists
        const userData: User = {
          id: profile.id,
          email: email,
          fullName: profile.full_name || fullName || 'User',
          hasCompletedProfile: !!(profile.gender && profile.location),
        };
        console.log('✅ User profile loaded:', userData.id);
        setUser(userData);
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set a basic user with a generated UUID so the app doesn't break
      const fallbackId = Crypto.randomUUID();
      const fallbackUser: User = {
        id: fallbackId,
        email: email,
        fullName: fullName || 'User',
        hasCompletedProfile: false,
      };
      setUser(fallbackUser);
      await AsyncStorage.setItem('@user', JSON.stringify(fallbackUser));
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    if (isSignedIn && clerkUser) {
      await loadUserProfile(
        clerkUser.id,
        clerkUser.primaryEmailAddress?.emailAddress || '',
        clerkUser.fullName || ''
      );
    }
  };

  const logout = async () => {
    try {
      console.log('=== LOGOUT ===');
      await signOut();
      setUser(null);
      await AsyncStorage.removeItem('@user');
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const refreshUser = async () => {
    if (!clerkUser || !user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, location, gender')
        .eq('id', user.id)
        .single() as { data: any };

      const updatedUser: User = {
        id: user.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || user.email,
        fullName: profile?.full_name || 'User',
        hasCompletedProfile: !!(profile?.gender && profile?.location),
      };
      setUser(updatedUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isSignedIn: !!isSignedIn, logout, checkAuth, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
