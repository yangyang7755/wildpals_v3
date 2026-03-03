// Quick test to verify Supabase connection and email configuration
// Run this with: node test-supabase-connection.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== SUPABASE CONNECTION TEST ===\n');

// Check environment variables
console.log('1. Checking environment variables...');
console.log('   Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('   Anon Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing');
console.log('   URL value:', supabaseUrl);
console.log('   Key (first 20 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'N/A');
console.log();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
console.log('2. Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('   ✅ Client created successfully');
console.log();

// Test connection
console.log('3. Testing connection to Supabase...');
async function testConnection() {
  try {
    // Try to get session (should return null if not logged in)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('   ❌ Connection error:', error.message);
      return false;
    }
    
    console.log('   ✅ Connection successful!');
    console.log('   Current session:', data.session ? 'Logged in' : 'Not logged in (expected)');
    console.log();
    
    return true;
  } catch (err) {
    console.error('   ❌ Connection failed:', err.message);
    return false;
  }
}

// Test signup (with a test email)
async function testSignup() {
  console.log('4. Testing signup functionality...');
  console.log('   NOTE: This will create a test user. Delete it from Supabase Dashboard after.');
  console.log();
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'test123456';
  
  console.log('   Test email:', testEmail);
  console.log('   Attempting signup...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
        },
      },
    });
    
    if (error) {
      console.error('   ❌ Signup error:', error.message);
      console.error('   Full error:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('   ✅ Signup successful!');
    console.log();
    console.log('   User Details:');
    console.log('   - User ID:', data.user?.id);
    console.log('   - Email:', data.user?.email);
    console.log('   - Email confirmed?', data.user?.email_confirmed_at ? 'Yes' : 'No');
    console.log('   - Confirmation sent?', data.user?.confirmation_sent_at ? 'Yes' : 'No');
    
    if (data.user?.confirmation_sent_at) {
      console.log('   - Sent at:', data.user.confirmation_sent_at);
      console.log();
      console.log('   📧 EMAIL WAS SENT! Check your Supabase email service.');
    } else if (data.user?.email_confirmed_at) {
      console.log();
      console.log('   ⚠️  Email was auto-confirmed (email verification is disabled)');
    } else {
      console.log();
      console.log('   ⚠️  WARNING: No confirmation email was sent!');
      console.log('   This means email confirmation might be disabled in Supabase.');
    }
    
    console.log();
    console.log('   🗑️  Remember to delete this test user from Supabase Dashboard:');
    console.log('   Authentication → Users → Find', testEmail, '→ Delete');
    
    return true;
  } catch (err) {
    console.error('   ❌ Signup failed:', err.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log('\n❌ Connection test failed. Fix connection issues before testing signup.');
    process.exit(1);
  }
  
  await testSignup();
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('\nNext steps:');
  console.log('1. Check the output above');
  console.log('2. If "Confirmation sent? Yes" → Email service is working');
  console.log('3. If "Confirmation sent? No" → Email confirmation is disabled');
  console.log('4. Delete the test user from Supabase Dashboard');
  console.log('5. Check Supabase Auth Logs for more details');
}

runTests();
