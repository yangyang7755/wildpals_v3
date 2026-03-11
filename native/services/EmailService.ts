import { Resend } from 'resend';

// Initialize Resend with your API key
// Get this from: https://resend.com/api-keys
const RESEND_API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY || 'your-api-key-here';
const resend = new Resend(RESEND_API_KEY);

export interface SendVerificationEmailParams {
  to: string;
  verificationUrl: string;
  userName?: string;
}

export interface SendVerificationCodeParams {
  to: string;
  code: string;
  userName?: string;
}

export const EmailService = {
  /**
   * Send email verification email
   */
  async sendVerificationEmail({ to, verificationUrl, userName }: SendVerificationEmailParams) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'WildPals <onboarding@resend.dev>', // Use your domain once verified
        to: [to],
        subject: 'Verify your WildPals email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your email</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #4A7C59 0%, #3d6849 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to WildPals!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                ${userName ? `<p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>` : ''}
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thanks for signing up! We're excited to have you join our outdoor sports community.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 30px;">
                  Please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${verificationUrl}" 
                     style="background: #4A7C59; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 14px; color: #4A7C59; word-break: break-all;">
                  ${verificationUrl}
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  If you didn't create a WildPals account, you can safely ignore this email.
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>© 2026 WildPals. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Verification email sent successfully:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  },

  /**
   * Send verification code email (4-digit OTP)
   */
  async sendVerificationCode({ to, code, userName }: SendVerificationCodeParams) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'WildPals <onboarding@resend.dev>', // Use your domain once verified
        to: [to],
        subject: 'Your WildPals Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your Verification Code</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #4A7C59 0%, #3d6849 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🏔️ WildPals</h1>
                </div>
                
                <div style="padding: 40px 30px;">
                  ${userName ? `<p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>` : '<p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>'}
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Thanks for signing up! Enter this verification code in the app to verify your email:
                  </p>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <div style="background: #F0F9F4; border: 2px solid #4A7C59; border-radius: 12px; padding: 30px; display: inline-block;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                      <p style="margin: 0; font-size: 48px; font-weight: bold; color: #4A7C59; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 30px;">
                    This code will remain valid until you request a new one.
                  </p>
                  
                  <div style="background: #FFF9E6; border-left: 4px solid #FFB800; padding: 15px; border-radius: 4px; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>Security tip:</strong> Never share this code with anyone. WildPals will never ask for your verification code.
                    </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    If you didn't create a WildPals account, you can safely ignore this email.
                  </p>
                </div>
                
                <div style="text-align: center; padding: 30px; background: #f9f9f9; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 5px 0; color: #999; font-size: 12px;">© 2026 WildPals. All rights reserved.</p>
                  <p style="margin: 5px 0; color: #999; font-size: 12px;">Connecting outdoor sports enthusiasts worldwide</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Verification code email sent successfully:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Failed to send verification code email:', error);
      throw error;
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ to, resetUrl, userName }: SendVerificationEmailParams) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'WildPals <onboarding@resend.dev>',
        to: [to],
        subject: 'Reset your WildPals password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your password</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #4A7C59 0%, #3d6849 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                ${userName ? `<p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>` : ''}
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We received a request to reset your password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" 
                     style="background: #4A7C59; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  This link will expire in 1 hour for security reasons.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>© 2026 WildPals. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent successfully:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  },
};
