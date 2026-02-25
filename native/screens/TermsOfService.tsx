import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TermsOfService() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: February 25, 2026</Text>

        <Text style={styles.intro}>
          Welcome to Wildpals! By using our app, you agree to these Terms of Service. Please read them carefully.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account and using Wildpals, you agree to be bound by these Terms of Service and our Privacy Policy. If you don't agree, please don't use our app.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 13 years old to use Wildpals. By using the app, you represent that you meet this age requirement and have the legal capacity to enter into these terms.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for:
        </Text>
        <Text style={styles.bulletPoint}>• Maintaining the security of your account credentials</Text>
        <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
        <Text style={styles.bulletPoint}>• Providing accurate and truthful information</Text>
        <Text style={styles.bulletPoint}>• Updating your information to keep it current</Text>
        <Text style={styles.bulletPoint}>• Notifying us immediately of any unauthorized access</Text>

        <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          When using Wildpals, you agree NOT to:
        </Text>
        <Text style={styles.bulletPoint}>• Harass, bully, or threaten other users</Text>
        <Text style={styles.bulletPoint}>• Post false, misleading, or fraudulent content</Text>
        <Text style={styles.bulletPoint}>• Share inappropriate, offensive, or illegal content</Text>
        <Text style={styles.bulletPoint}>• Impersonate others or create fake accounts</Text>
        <Text style={styles.bulletPoint}>• Spam or send unsolicited messages</Text>
        <Text style={styles.bulletPoint}>• Attempt to hack, disrupt, or damage the app</Text>
        <Text style={styles.bulletPoint}>• Use the app for commercial purposes without permission</Text>
        <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>

        <Text style={styles.sectionTitle}>5. User Content</Text>
        <Text style={styles.paragraph}>
          You retain ownership of content you post on Wildpals. However, by posting content, you grant us a license to use, display, and distribute it within the app.
        </Text>
        <Text style={styles.paragraph}>
          You are solely responsible for your content and any consequences of posting it. We reserve the right to remove content that violates these terms.
        </Text>

        <Text style={styles.sectionTitle}>6. Safety and Liability</Text>
        <Text style={styles.paragraph}>
          Wildpals is a platform to connect outdoor enthusiasts. However:
        </Text>
        <Text style={styles.bulletPoint}>• We are not responsible for the actions of other users</Text>
        <Text style={styles.bulletPoint}>• You participate in activities at your own risk</Text>
        <Text style={styles.bulletPoint}>• We don't verify user identities or backgrounds</Text>
        <Text style={styles.bulletPoint}>• Always exercise caution when meeting people from the app</Text>
        <Text style={styles.bulletPoint}>• Outdoor activities carry inherent risks - be prepared and responsible</Text>
        <Text style={styles.paragraph}>
          We strongly recommend meeting in public places and informing someone of your plans.
        </Text>

        <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          Wildpals is provided "as is" without warranties of any kind. We don't guarantee that the app will be error-free, secure, or always available. Use at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, Wildpals and its creators are not liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including but not limited to:
        </Text>
        <Text style={styles.bulletPoint}>• Injuries or accidents during activities</Text>
        <Text style={styles.bulletPoint}>• Loss of data or content</Text>
        <Text style={styles.bulletPoint}>• Interactions with other users</Text>
        <Text style={styles.bulletPoint}>• Service interruptions or errors</Text>

        <Text style={styles.sectionTitle}>9. Account Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate your account if you violate these terms or engage in harmful behavior. You may also delete your account at any time through the app settings.
        </Text>

        <Text style={styles.sectionTitle}>10. Modifications to Service</Text>
        <Text style={styles.paragraph}>
          We may modify, suspend, or discontinue any part of Wildpals at any time without notice. We're not liable for any modifications or discontinuation of the service.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these Terms of Service from time to time. Continued use of the app after changes constitutes acceptance of the new terms. We'll notify you of significant changes.
        </Text>

        <Text style={styles.sectionTitle}>12. Governing Law</Text>
        <Text style={styles.paragraph}>
          These terms are governed by the laws of the United Kingdom. Any disputes will be resolved in UK courts.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>Email: legal@wildpals.com</Text>
        <Text style={styles.contactInfo}>Support: support@wildpals.com</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Wildpals, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
