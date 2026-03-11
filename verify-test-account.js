/**
 * Script to verify test account setup for App Store submission
 * Run with: node verify-test-account.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xikaltnufqbysnrsjzwa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa2FsdG51ZnFieXNucnNqendhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODUxNzcsImV4cCI6MjA4NzM2MTE3N30.XOl4QElrOuAsuRUjgurr2HHCsamgKivfElYJhtU_0tU';

const TEST_EMAIL = 'reviewer@wildpals.app';
const TEST_PASSWORD = 'ReviewTest2024!';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyTestAccount() {
  console.log('🔍 Verifying test account for App Store submission...\n');

  try {
    // Try to login with test account
    console.log('1️⃣ Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Go to Supabase Dashboard → Authentication → Users');
      console.log('   2. Create user with:');
      console.log('      - Email: reviewer@wildpals.app');
      console.log('      - Password: ReviewTest2024!');
      console.log('      - Auto Confirm User: YES');
      return;
    }

    console.log('✅ Login successful!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);

    // Check email verification status
    console.log('\n2️⃣ Checking email verification...');
    if (loginData.user.email_confirmed_at) {
      console.log('✅ Email is verified!');
      console.log('   Confirmed at:', loginData.user.email_confirmed_at);
    } else {
      console.error('❌ Email is NOT verified!');
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Go to Supabase Dashboard → Authentication → Users');
      console.log('   2. Find user: reviewer@wildpals.app');
      console.log('   3. Click "..." menu → "Confirm email"');
      await supabase.auth.signOut();
      return;
    }

    // Check profile exists
    console.log('\n3️⃣ Checking profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile not found:', profileError.message);
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Create profile for this user in Supabase');
      console.log('   2. Or login to the app and complete profile setup');
      await supabase.auth.signOut();
      return;
    }

    console.log('✅ Profile exists!');
    console.log('   Full Name:', profile.full_name || '(not set)');
    console.log('   Location:', profile.location || '(not set)');
    console.log('   Bio:', profile.bio || '(not set)');
    console.log('   Date of Birth:', profile.date_of_birth || '(not set)');

    // Check if profile is complete
    console.log('\n4️⃣ Checking profile completeness...');
    const isComplete = profile.full_name && profile.location && profile.bio && profile.date_of_birth;
    
    if (isComplete) {
      console.log('✅ Profile is complete!');
    } else {
      console.log('⚠️  Profile is incomplete (this is OK for testing)');
      console.log('   Missing fields:');
      if (!profile.full_name) console.log('   - Full Name');
      if (!profile.location) console.log('   - Location');
      if (!profile.bio) console.log('   - Bio');
      if (!profile.date_of_birth) console.log('   - Date of Birth');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Test account is ready for App Store submission!');
    console.log('\nTest Credentials:');
    console.log('   Email:', TEST_EMAIL);
    console.log('   Password:', TEST_PASSWORD);
    console.log('\nStatus:');
    console.log('   ✅ Account exists');
    console.log('   ✅ Login works');
    console.log('   ✅ Email verified');
    console.log('   ✅ Profile exists');
    console.log('\nNext Steps:');
    console.log('   1. Test login in your app');
    console.log('   2. Verify full app functionality');
    console.log('   3. Submit to App Store');
    console.log('='.repeat(60));

    // Cleanup
    await supabase.auth.signOut();

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.log('\nPlease check:');
    console.log('   1. Supabase URL is correct');
    console.log('   2. Supabase anon key is correct');
    console.log('   3. Internet connection is working');
  }
}

// Run the verification
verifyTestAccount();
