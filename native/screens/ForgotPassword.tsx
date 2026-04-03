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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSignIn, useAuth as useClerkAuth } from '@clerk/clerk-expo';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const { signIn, isLoaded } = useSignIn();
  const { signOut } = useClerkAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');

  const handleSendCode = async () => {
    if (!email.trim() || !isLoaded) return;
    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('code');
      Alert.alert('Code Sent', `A reset code has been sent to ${email}`);
    } catch (error: any) {
      const msg = error?.errors?.[0]?.longMessage || 'Failed to send reset code';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword || !isLoaded) return;
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        // Sign out so user can log in fresh with new password
        await signOut();
        Alert.alert('Success', 'Your password has been reset. Please log in.', [
          { text: 'OK', onPress: () => (navigation as any).navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', 'Password reset incomplete. Please try again.');
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.longMessage || 'Failed to reset password';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{step === 'email' ? 'Reset Password' : 'Enter Code'}</Text>
        <Text style={styles.subtitle}>
          {step === 'email'
            ? 'Enter your email and we\'ll send you a reset code'
            : `Enter the code sent to ${email}`}
        </Text>

        {step === 'email' ? (
          <>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleSendCode} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Code'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput style={styles.input} placeholder="Verification Code" placeholderTextColor="#999"
              value={code} onChangeText={setCode} keyboardType="number-pad" />
            <TextInput style={styles.input} placeholder="New Password (min 8 characters)" placeholderTextColor="#999"
              value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm New Password" placeholderTextColor="#999"
              value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleResetPassword} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')} style={{ marginTop: 16 }}>
              <Text style={{ color: '#4A7C59', textAlign: 'center', fontSize: 16 }}>Use a different email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingTop: 60, paddingLeft: 20, paddingBottom: 10 },
  backButton: { fontSize: 32, color: '#4A7C59' },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, fontSize: 16, color: '#000', marginBottom: 16 },
  button: { backgroundColor: '#4A7C59', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
