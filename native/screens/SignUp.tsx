import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSignUp, useAuth as useClerkAuth } from '@clerk/clerk-expo';

export default function SignUp() {
  const navigation = useNavigation();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signOut, isSignedIn } = useClerkAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (dateOfBirth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth)) {
        Alert.alert('Error', 'Please enter date in format: YYYY-MM-DD');
        return false;
      }
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        Alert.alert('Error', 'Please enter a valid date');
        return false;
      }
      if (calculateAge(dateOfBirth) < 18) {
        Alert.alert('Age Requirement', 'You must be at least 18 years old to use Wildpals.');
        return false;
      }
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms and Conditions');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm() || !isLoaded) return;
    setLoading(true);
    try {
      // Sign out first if there's an existing session
      if (isSignedIn) {
        await signOut();
      }
      if (signUp.status === 'complete') {
        setPendingVerification(false);
      }
      await signUp.create({
        emailAddress: email,
        password,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || undefined,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (error: any) {
      console.error('SignUp error:', error);
      const msg = error?.errors?.[0]?.longMessage || error?.message || 'Failed to create account';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('taken')) {
        Alert.alert('Email Already Registered', 'Would you like to log in instead?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Login', onPress: () => (navigation as any).navigate('Login') },
        ]);
      } else {
        Alert.alert('Sign Up Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!isLoaded || !verificationCode.trim()) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // AuthContext will pick up the new session and navigate
        (navigation as any).navigate('ProfileSetup');
      } else {
        Alert.alert('Verification Incomplete', 'Please try again.');
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.longMessage || 'Invalid verification code';
      Alert.alert('Verification Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Verification code screen
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPendingVerification(false)}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>We sent a code to {email}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            placeholderTextColor="#999"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            autoFocus
          />
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleVerifyEmail}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>Wildpals</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the adventure community</Text>
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#999"
              value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            <TextInput style={styles.input} placeholder="Date of Birth (Optional, YYYY-MM-DD)" placeholderTextColor="#999"
              value={dateOfBirth} onChangeText={setDateOfBirth} keyboardType="numbers-and-punctuation" maxLength={10} />
            <Text style={styles.ageRequirement}>You must be 18 or older to use Wildpals</Text>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Password (min 8 characters)" placeholderTextColor="#999"
                value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
                <Text style={styles.showButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Confirm Password" placeholderTextColor="#999"
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showButton}>
                <Text style={styles.showButtonText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setAgreeToTerms(!agreeToTerms)} style={styles.checkbox}>
                <View style={[styles.checkboxBox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text style={styles.link} onPress={() => (navigation as any).navigate('TermsOfService')}>Terms and Conditions</Text>
                {' '}and{' '}
                <Text style={styles.link} onPress={() => (navigation as any).navigate('PrivacyPolicy')}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp} disabled={loading}>
              <Text style={styles.signUpButtonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingTop: 60, paddingLeft: 20, paddingBottom: 10 },
  backButton: { fontSize: 32, color: '#4A7C59' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 32, paddingBottom: 40 },
  logoContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  logoImage: { width: 100, height: 100 },
  appName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  form: { gap: 16 },
  input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, fontSize: 16, color: '#000' },
  ageRequirement: { fontSize: 12, color: '#666', marginTop: -8, marginBottom: 8 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12 },
  passwordInput: { flex: 1, paddingVertical: 16, paddingHorizontal: 20, fontSize: 16, color: '#000' },
  showButton: { paddingHorizontal: 16 },
  showButtonText: { color: '#666', fontSize: 14 },

  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  checkbox: { marginRight: 12, paddingTop: 2 },
  checkboxBox: { width: 24, height: 24, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#4A7C59', borderColor: '#4A7C59' },
  checkmark: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#666', flex: 1 },
  link: { color: '#4A7C59', fontWeight: '600', textDecorationLine: 'underline' },
  signUpButton: { backgroundColor: '#4A7C59', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  signUpButtonDisabled: { opacity: 0.6 },
  signUpButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  loginText: { fontSize: 16, color: '#666' },
  loginLink: { fontSize: 16, color: '#4A7C59', fontWeight: '600' },
});
