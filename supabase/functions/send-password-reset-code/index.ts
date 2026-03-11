import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { email, code } = await req.json()

    console.log('📧 Sending password reset code to:', email)
    console.log('Code:', code)

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
        subject: 'Reset Your WildPals Password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #4A7C59 0%, #3d6849 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                </div>
                
                <div style="padding: 40px 30px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    You requested to reset your WildPals password. Enter this verification code in the app to continue:
                  </p>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <div style="background: #F0F9F4; border: 2px solid #4A7C59; border-radius: 12px; padding: 30px; display: inline-block;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
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
                      <strong>Security tip:</strong> Never share this code with anyone. WildPals will never ask for your reset code.
                    </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
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
      }),
    })

    const resendData = await res.json()

    if (!res.ok) {
      console.error('❌ Resend API error:', resendData)
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    console.log('✅ Password reset code email sent successfully:', resendData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
        message: 'Password reset code sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error('❌ Error in send-password-reset-code function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send password reset code',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
