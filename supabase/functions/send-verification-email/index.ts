import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, userId, userName } = await req.json()

    console.log('📧 Sending verification email to:', email)

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate email confirmation link
    const { data, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'wildpals://email-verified',
      },
    })

    if (linkError) {
      console.error('❌ Error generating link:', linkError)
      throw linkError
    }

    const verificationUrl = data.properties.action_link
    console.log('✅ Verification link generated')

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'WildPals <onboarding@resend.dev>',
        to: [email],
        subject: 'Verify your WildPals email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6; 
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
                }
                .container { 
                  max-width: 600px; 
                  margin: 40px auto; 
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header { 
                  background: #4A7C59; 
                  color: white; 
                  padding: 40px 30px; 
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 600;
                }
                .content { 
                  padding: 40px 30px;
                }
                .content p {
                  margin: 0 0 20px 0;
                  font-size: 16px;
                  line-height: 1.6;
                }
                .button-container {
                  text-align: center;
                  margin: 30px 0;
                }
                .button { 
                  display: inline-block; 
                  background: #4A7C59; 
                  color: white !important; 
                  padding: 16px 40px; 
                  text-decoration: none; 
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;
                }
                .button:hover {
                  background: #3d6849;
                }
                .link-box {
                  background: #f9f9f9;
                  padding: 15px;
                  border-radius: 6px;
                  margin: 20px 0;
                  word-break: break-all;
                  font-size: 13px;
                  color: #666;
                }
                .footer { 
                  text-align: center; 
                  padding: 30px;
                  color: #999; 
                  font-size: 13px;
                  border-top: 1px solid #eee;
                }
                .footer p {
                  margin: 5px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏔️ Welcome to WildPals!</h1>
                </div>
                <div class="content">
                  <p>Hi ${userName || 'there'},</p>
                  <p>Thanks for signing up! We're excited to have you join our community of outdoor sports enthusiasts.</p>
                  <p>Please verify your email address to get started:</p>
                  
                  <div class="button-container">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
                  <div class="link-box">${verificationUrl}</div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    <strong>Note:</strong> This link will expire in 24 hours for security reasons.
                  </p>
                  
                  <p style="font-size: 14px; color: #999; margin-top: 30px;">
                    If you didn't create a WildPals account, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2026 WildPals. All rights reserved.</p>
                  <p>Connecting outdoor sports enthusiasts worldwide</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const resendData = await res.json()

    if (!res.ok) {
      console.error('❌ Resend API error:', resendData)
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    console.log('✅ Email sent successfully via Resend:', resendData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
        message: 'Verification email sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error('❌ Error in send-verification-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send verification email',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
