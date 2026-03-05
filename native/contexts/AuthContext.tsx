import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  fullName: string;
  hasCompletedProfile: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string, dateOfBirth?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: profile?.full_name || 'User',
        hasCompletedProfile: !!(profile?.bio && profile?.location),
      };

      setUser(userData);
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    dateOfBirth?: string
  ): Promise<boolean> => {
    try {
      console.log('=== SIGNUP ATTEMPT ===');
      console.log('Email:', email);
      console.log('Full Name:', fullName);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            date_of_birth: dateOfBirth,
          },
          // Don't specify emailRedirectTo - let Supabase use its default configuration
        },
      });

      console.log('=== SIGNUP RESPONSE ===');
      console.log('Error:', error);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('User ID:', data?.user?.id);
      console.log('User Email:', data?.user?.email);
      console.log('Email Confirmed At:', data?.user?.email_confirmed_at);
      console.log('Confirmation Sent At:', data?.user?.confirmation_sent_at);

      if (error) {
        console.error('❌ Signup error:', error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        // Provide more specific error messages
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        } else if (error.message.includes('confirmation email') || error.message.includes('Error sending')) {
          throw new Error('Email service is not configured. Please contact support or try again later.');
        } else if (error.message.includes('Invalid email') || error.message.includes('email')) {
          throw new Error('Unable to send verification email. Please check your email address or try again later.');
        } else if (error.message.includes('password')) {
          throw new Error('Password does not meet requirements. Please use at least 6 characters.');
        } else {
          throw new Error(error.message || 'Failed to create account. Please try again.');
        }
      }

      // Check if user was created
      if (data?.user) {
        console.log('✅ User created successfully!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Email confirmed?', !!data.user.email_confirmed_at);
        console.log('Confirmation sent?', !!data.user.confirmation_sent_at);
        
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at && !data.user.confirmation_sent_at) {
          console.warn('⚠️ WARNING: User created but no confirmation email was sent!');
          console.warn('This means email confirmation might be disabled in Supabase.');
        } else if (data.user.confirmation_sent_at) {
          console.log('📧 Confirmation email sent at:', data.user.confirmation_sent_at);
        }
        
        return true;
      }

      console.log('✅ Signup completed (no user object returned - might be auto-confirmed)');
      return true;
    } catch (error: any) {
      console.error('❌ Signup error caught:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('=== LOGIN RESPONSE ===');
      console.log('Error:', error);
      console.log('User ID:', data?.user?.id);

      if (error) {
        console.error('❌ Login error:', error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Invalid email or password');
      }

      if (data.user) {
        console.log('✅ Login successful');
        await loadUserProfile(data.user);
        return true;
      }

      console.log('⚠️ Login completed but no user returned');
      return false;
    } catch (error: any) {
      console.error('❌ Login error caught:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      await AsyncStorage.removeItem('@user');
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
          bio: updates.hasCompletedProfile ? 'Profile completed' : null,
        })
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
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (!supabaseUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, location')
        .eq('id', supabaseUser.id)
        .single();

      const updatedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: profile?.full_name || 'User',
        hasCompletedProfile: !!(profile?.bio && profile?.location),
      };

      setUser(updatedUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, checkAuth, updateProfile, refreshUser }}
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
