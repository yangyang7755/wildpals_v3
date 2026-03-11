import { supabase } from '../lib/supabase';

export class PasswordResetService {
  // Generate a random 4-digit code
  static generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Create and store password reset code
  static async createResetCode(email: string): Promise<{ success: boolean; userId?: string; code?: string }> {
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        console.log('User not found for email:', email);
        return { success: false };
      }

      const userId = userData.id;

      // Invalidate any existing active codes for this user
      console.log('Invalidating old codes for user:', userId);
      const { data: updateData, error: updateError } = await supabase
        .from('password_reset_codes')
        .update({ invalidated: true })
        .eq('user_id', userId)
        .eq('verified', false)
        .eq('invalidated', false)
        .select();

      if (updateError) {
        console.error('Error invalidating old codes:', updateError);
      } else {
        console.log('Invalidated codes:', updateData?.length || 0);
      }

      // Small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate new code
      const code = this.generateCode();
      console.log('Generated reset code:', code);

      const { error: insertError } = await supabase
        .from('password_reset_codes')
        .insert([{
          user_id: userId,
          email,
          code,
          verified: false,
          attempts: 0,
          invalidated: false,
        }]);

      if (insertError) {
        console.error('Error inserting reset code:', insertError);
        return { success: false };
      }

      console.log('Password reset code created successfully');
      return { success: true, userId, code };
    } catch (error: any) {
      console.error('Error in createResetCode:', error);
      return { success: false };
    }
  }

  // Verify reset code
  static async verifyResetCode(email: string, code: string): Promise<{ success: boolean; userId?: string }> {
    try {
      // Get the active code for this email
      const { data: codeData, error: fetchError } = await supabase
        .from('password_reset_codes')
        .select('*')
        .eq('email', email)
        .eq('verified', false)
        .eq('invalidated', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !codeData) {
        console.error('No active reset code found');
        return { success: false };
      }

      // Check if too many attempts
      if (codeData.attempts >= 5) {
        console.error('Too many failed attempts');
        return { success: false };
      }

      // Check if code matches
      if (codeData.code !== code) {
        // Increment attempts
        await supabase
          .from('password_reset_codes')
          .update({ attempts: codeData.attempts + 1 })
          .eq('id', codeData.id);
        
        return { success: false };
      }

      // Mark code as verified
      await supabase
        .from('password_reset_codes')
        .update({ verified: true })
        .eq('id', codeData.id);

      return { success: true, userId: codeData.user_id };
    } catch (error) {
      console.error('Error verifying reset code:', error);
      return { success: false };
    }
  }

  // Send reset code via email
  static async sendResetCodeEmail(email: string, code: string): Promise<void> {
    try {
      // Call Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-password-reset-code', {
        body: {
          email,
          code,
        },
      });

      if (error) {
        console.error('Error calling edge function:', error);
        // Fallback to console log for development
        console.log(`📧 [FALLBACK] Password reset code for ${email}: ${code}`);
        throw error;
      }

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      // Still log to console as fallback for development
      console.log(`📧 [FALLBACK] Password reset code for ${email}: ${code}`);
      // Don't throw - allow reset to continue even if email fails
    }
  }

  // Reset password with verified code
  static async resetPassword(userId: string, email: string, newPassword: string): Promise<boolean> {
    try {
      // Call the database function to reset password
      const { error } = await supabase.rpc('reset_user_password', {
        p_user_id: userId,
        p_new_password: newPassword,
      });

      if (error) {
        console.error('Error resetting password:', error);
        return false;
      }

      // Invalidate all reset codes for this email
      await supabase
        .from('password_reset_codes')
        .update({ invalidated: true })
        .eq('email', email);

      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return false;
    }
  }
}
