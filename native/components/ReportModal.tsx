import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ReportingService, { ReportType, ReportReason } from '../services/ReportingService';
import BlockingService from '../services/BlockingService';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportType: ReportType;
  targetId: string;
  targetUserId: string;
  targetName: string;
  currentUserId: string;
  chatType?: 'club' | 'activity';
  onReportSubmitted?: () => void;
}

export default function ReportModal({
  visible,
  onClose,
  reportType,
  targetId,
  targetUserId,
  targetName,
  currentUserId,
  chatType,
  onReportSubmitted,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reasons = ReportingService.getReportReasons(reportType);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    if (description.length > 500) {
      Alert.alert('Error', 'Description must be 500 characters or less');
      return;
    }

    setSubmitting(true);

    try {
      // Submit report based on type
      if (reportType === 'user_behavior') {
        await ReportingService.reportUser({
          reporter_id: currentUserId,
          reported_user_id: targetUserId,
          reason: selectedReason,
          description: description || undefined,
        });
      } else if (reportType === 'message_content' && chatType) {
        await ReportingService.reportMessage({
          reporter_id: currentUserId,
          reported_user_id: targetUserId,
          message_id: targetId,
          chat_type: chatType,
          reason: selectedReason,
          description: description || undefined,
        });
      } else if (reportType === 'activity_content') {
        await ReportingService.reportActivity({
          reporter_id: currentUserId,
          reported_user_id: targetUserId,
          activity_id: targetId,
          reason: selectedReason,
          description: description || undefined,
        });
      }

      // Block user if requested
      if (alsoBlock) {
        await BlockingService.blockUser(currentUserId, targetUserId);
      }

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it shortly.',
        [{ text: 'OK', onPress: () => {
          onClose();
          onReportSubmitted?.();
        }}]
      );

      // Reset form
      setSelectedReason('');
      setDescription('');
      setAlsoBlock(false);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setAlsoBlock(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Report {reportType === 'user_behavior' ? 'User' : reportType === 'message_content' ? 'Message' : 'Activity'}</Text>
            <TouchableOpacity onPress={handleClose} disabled={submitting}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Reporting: {targetName}
            </Text>

            <Text style={styles.label}>Reason *</Text>
            <View style={styles.reasonsList}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason.value && styles.reasonOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                  disabled={submitting}
                >
                  <View style={[
                    styles.radio,
                    selectedReason === reason.value && styles.radioSelected,
                  ]}>
                    {selectedReason === reason.value && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason.value && styles.reasonTextSelected,
                  ]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Additional Details (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide more context about this report..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              editable={!submitting}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            {reportType !== 'activity_content' && (
              <TouchableOpacity
                style={styles.blockOption}
                onPress={() => setAlsoBlock(!alsoBlock)}
                disabled={submitting}
              >
                <View style={[styles.checkbox, alsoBlock && styles.checkboxChecked]}>
                  {alsoBlock && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.blockOptionText}>
                  Also block this user
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.disclaimer}>
              Reports are reviewed by our team. False reports may result in action against your account.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!selectedReason || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  reasonsList: {
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonOptionSelected: {
    borderColor: '#4A7C59',
    backgroundColor: '#F0F8F4',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#4A7C59',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A7C59',
  },
  reasonText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#000',
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000',
    minHeight: 100,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  blockOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#F57C00',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  blockOptionText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4A7C59',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
