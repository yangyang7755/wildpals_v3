import { supabase } from '../lib/supabase';

export class VerificationCodeService {
  // Generate a random 4-digit code
  static generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Create and store verification code (invalidates any existing codes)
  static async createVerificationCode(userId: string, email: string): Promise<string> {
    try {
      console.log('Creating verification code for user:', userId);
      
      // First, invalidate any existing active codes for this user
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ invalidated: true })
        .eq('user_id', userId)
        .eq('verified', false)
        .eq('invalidated', false);

      if (updateError) {
        console.log('Note: Error invalidating old codes (may not exist):', updateError.message);
      }

      // Generate new code
      const code = this.generateCode();
      console.log('Generated code:', code);

      const { error: insertError } = await supabase
        .from('email_verification_codes')
        .insert([{
          user_id: userId,
          email,
          code,
          verified: false,
          attempts: 0,
          invalidated: false,
        }]);

      if (insertError) {
        console.error('Error inserting verification code:', insertError);
        throw new Error(`Failed to create verification code: ${insertError.message}`);
      }

      console.log('Verification code created successfully');
      return code;
    } catch (error: any) {
      console.error('Error in createVerificationCode:', error);
      throw error;
    }
  }

  // Verify code
  static async verifyCode(userId: string, code: string): Promise<{ success: boolean; email?: string }> {
    try {
      // Get the active code for this user
      const { data: codeData, error: fetchError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('verified', false)
        .eq('invalidated', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !codeData) {
        console.error('No active verification code found');
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
          .from('email_verification_codes')
          .update({ attempts: codeData.attempts + 1 })
          .eq('id', codeData.id);
        
        return { success: false };
      }

      // Mark code as verified
      await supabase
        .from('email_verification_codes')
        .update({ verified: true })
        .eq('id', codeData.id);

      // Update user's email_confirmed_at in auth.users
      const { error: confirmError } = await supabase.rpc('confirm_user_email', {
        user_id: userId
      });

      if (confirmError) {
        console.error('Error confirming email:', confirmError);
        // Code is still marked as verified, so continue
      }

      return { success: true, email: codeData.email };
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false };
    }
  }

  // Resend verification code (invalidates old code and creates new one)
  static async resendCode(userId: string, email: string): Promise<string> {
    // This will automatically invalidate the old code and create a new one
    return this.createVerificationCode(userId, email);
  }

  // Send verification email with code
  static async sendVerificationEmail(email: string, code: string, fullName: string): Promise<void> {
    try {
      // Call Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email,
          code,
          userName: fullName,
        },
      });

      if (error) {
        console.error('Error calling edge function:', error);
        // Fallback to console log for development
        console.log(`📧 [FALLBACK] Verification code for ${email}: ${code}`);
        throw error;
      }

      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Still log to console as fallback for development
      console.log(`📧 [FALLBACK] Verification code for ${email}: ${code}`);
      // Don't throw - allow signup to continue even if email fails
    }
  }
}
