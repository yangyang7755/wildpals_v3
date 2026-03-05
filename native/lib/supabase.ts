import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let supabaseUrl = '';
let supabaseAnonKey = '';
let supabase: ReturnType<typeof createClient>;

try {
  console.log('=== SUPABASE INITIALIZATION START ===');
  console.log('Constants.expoConfig:', Constants.expoConfig ? 'exists' : 'missing');
  console.log('Constants.expoConfig.extra:', Constants.expoConfig?.extra ? 'exists' : 'missing');
  
  supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || '';
  supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  console.log('=== SUPABASE CONFIGURATION ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Anon Key length:', supabaseAnonKey.length);
  console.log('Anon Key (first 20 chars):', supabaseAnonKey.length > 20 ? supabaseAnonKey.substring(0, 20) + '...' : 'TOO SHORT');
  console.log('URL is valid?', supabaseUrl.startsWith('https://'));
  console.log('Key is valid?', supabaseAnonKey.length > 0);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key is missing. Please check your app.json extra config.');
    console.error('URL:', supabaseUrl || 'MISSING');
    console.error('Key:', supabaseAnonKey ? `${supabaseAnonKey.length} chars` : 'MISSING');
    
    // Create a dummy client to prevent crashes
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    console.warn('⚠️ Created placeholder Supabase client - app will not function correctly');
  } else {
    console.log('✅ Supabase configuration loaded successfully');
    
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    
    console.log('✅ Supabase client created successfully');
  }
} catch (error) {
  console.error('❌ FATAL ERROR creating Supabase client:', error);
  console.error('Error details:', JSON.stringify(error, null, 2));
  
  // Create a dummy client to prevent app crash
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  console.warn('⚠️ Created placeholder Supabase client after error - app will not function correctly');
}

export { supabase };

