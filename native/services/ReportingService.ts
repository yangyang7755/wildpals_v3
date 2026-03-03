import { supabase } from '../lib/supabase';

export type ReportType = 'user_behavior' | 'message_content' | 'activity_content';

export interface ReportReason {
  value: string;
  label: string;
}

export interface ReportUserParams {
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description?: string;
}

export interface ReportMessageParams {
  reporter_id: string;
  reported_user_id: string;
  message_id: string;
  chat_type: 'club' | 'activity';
  reason: string;
  description?: string;
}

export interface ReportActivityParams {
  reporter_id: string;
  reported_user_id: string;
  activity_id: string;
  reason: string;
  description?: string;
}

const USER_REPORT_REASONS: ReportReason[] = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam or unwanted content' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'fake_profile', label: 'Fake or impersonation' },
  { value: 'other', label: 'Other' },
];

const MESSAGE_REPORT_REASONS: ReportReason[] = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_REPORT_REASONS: ReportReason[] = [
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam' },
  { value: 'dangerous_activity', label: 'Dangerous or unsafe activity' },
  { value: 'misleading_information', label: 'Misleading information' },
  { value: 'other', label: 'Other' },
];

const MAX_DESCRIPTION_LENGTH = 500;

class ReportingService {
  // Get report reasons based on report type
  getReportReasons(type: ReportType): ReportReason[] {
    switch (type) {
      case 'user_behavior':
        return USER_REPORT_REASONS;
      case 'message_content':
        return MESSAGE_REPORT_REASONS;
      case 'activity_content':
        return ACTIVITY_REPORT_REASONS;
      default:
        return USER_REPORT_REASONS;
    }
  }

  // Validate description length
  private validateDescription(description?: string): void {
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }
  }

  // Validate required fields
  private validateRequiredFields(fields: Record<string, any>): void {
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        throw new Error(`${key} is required`);
      }
    }
  }

  // Report a user for inappropriate behavior
  async reportUser(params: ReportUserParams): Promise<void> {
    // Validate required fields
    this.validateRequiredFields({
      reporter_id: params.reporter_id,
      reported_user_id: params.reported_user_id,
      reason: params.reason,
    });

    // Validate description length
    this.validateDescription(params.description);

    // Prevent self-reporting
    if (params.reporter_id === params.reported_user_id) {
      throw new Error('Cannot report yourself');
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert([{
          reporter_id: params.reporter_id,
          reported_user_id: params.reported_user_id,
          report_type: 'user_behavior',
          reason: params.reason,
          description: params.description || null,
        }]);

      if (error) throw error;

      // Email notification is handled by database trigger
    } catch (error: any) {
      console.error('Error reporting user:', error);
      throw new Error(error.message || 'Failed to submit report');
    }
  }

  // Report a chat message for inappropriate content
  async reportMessage(params: ReportMessageParams): Promise<void> {
    // Validate required fields
    this.validateRequiredFields({
      reporter_id: params.reporter_id,
      reported_user_id: params.reported_user_id,
      message_id: params.message_id,
      chat_type: params.chat_type,
      reason: params.reason,
    });

    // Validate description length
    this.validateDescription(params.description);

    // Prevent self-reporting
    if (params.reporter_id === params.reported_user_id) {
      throw new Error('Cannot report yourself');
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert([{
          reporter_id: params.reporter_id,
          reported_user_id: params.reported_user_id,
          report_type: 'message_content',
          reason: params.reason,
          description: params.description || null,
          message_id: params.message_id,
          chat_type: params.chat_type,
        }]);

      if (error) throw error;

      // Email notification is handled by database trigger
    } catch (error: any) {
      console.error('Error reporting message:', error);
      throw new Error(error.message || 'Failed to submit report');
    }
  }

  // Report an activity for inappropriate content
  async reportActivity(params: ReportActivityParams): Promise<void> {
    // Validate required fields
    this.validateRequiredFields({
      reporter_id: params.reporter_id,
      reported_user_id: params.reported_user_id,
      activity_id: params.activity_id,
      reason: params.reason,
    });

    // Validate description length
    this.validateDescription(params.description);

    // Prevent self-reporting
    if (params.reporter_id === params.reported_user_id) {
      throw new Error('Cannot report yourself');
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert([{
          reporter_id: params.reporter_id,
          reported_user_id: params.reported_user_id,
          report_type: 'activity_content',
          reason: params.reason,
          description: params.description || null,
          activity_id: params.activity_id,
        }]);

      if (error) throw error;

      // Email notification is handled by database trigger
    } catch (error: any) {
      console.error('Error reporting activity:', error);
      throw new Error(error.message || 'Failed to submit report');
    }
  }
}

export default new ReportingService();
