import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicy() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: February 25, 2026</Text>

        <Text style={styles.intro}>
          At Wildpals, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, including:
        </Text>
        <Text style={styles.bulletPoint}>• Account information (name, email, age, gender, city)</Text>
        <Text style={styles.bulletPoint}>• Profile information (bio, sports preferences)</Text>
        <Text style={styles.bulletPoint}>• Activity data (activities you create or join)</Text>
        <Text style={styles.bulletPoint}>• Messages and communications within the app</Text>
        <Text style={styles.bulletPoint}>• Club memberships and interactions</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide and maintain our services</Text>
        <Text style={styles.bulletPoint}>• Connect you with other outdoor enthusiasts</Text>
        <Text style={styles.bulletPoint}>• Send you notifications about activities and requests</Text>
        <Text style={styles.bulletPoint}>• Improve and personalize your experience</Text>
        <Text style={styles.bulletPoint}>• Ensure safety and prevent misuse</Text>
        <Text style={styles.bulletPoint}>• Communicate with you about updates and support</Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We share your information only in the following circumstances:
        </Text>
        <Text style={styles.bulletPoint}>• With other users: Your profile information, activities, and club memberships are visible to other users to facilitate connections</Text>
        <Text style={styles.bulletPoint}>• With your consent: We may share information when you explicitly agree</Text>
        <Text style={styles.bulletPoint}>• For legal reasons: We may disclose information if required by law or to protect rights and safety</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your information, including:
        </Text>
        <Text style={styles.bulletPoint}>• Encrypted data transmission (HTTPS)</Text>
        <Text style={styles.bulletPoint}>• Secure authentication via Supabase</Text>
        <Text style={styles.bulletPoint}>• Row-level security policies on our database</Text>
        <Text style={styles.bulletPoint}>• Regular security updates and monitoring</Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access your personal information</Text>
        <Text style={styles.bulletPoint}>• Update or correct your information</Text>
        <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
        <Text style={styles.bulletPoint}>• Export your data</Text>
        <Text style={styles.bulletPoint}>• Opt out of certain communications</Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your information for as long as your account is active. When you delete your account, we permanently remove your personal data from our systems within 30 days, except where we're required to retain it for legal purposes.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Wildpals is intended for users aged 13 and older. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>8. International Users</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and processed in countries other than your own. By using Wildpals, you consent to such transfers.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy in the app and updating the "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy or your data, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>Email: privacy@wildpals.com</Text>
        <Text style={styles.contactInfo}>Support: support@wildpals.com</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Wildpals, you agree to this Privacy Policy.
          </Text>
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
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A7C59',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contactInfo: {
    fontSize: 15,
    color: '#4A7C59',
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
