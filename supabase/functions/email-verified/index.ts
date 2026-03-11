import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Get the URL to extract any query parameters
  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'signup'
  
  // Determine the deep link based on type
  const deepLink = type === 'recovery' 
    ? 'wildpals://reset-password' 
    : 'wildpals://email-verified'
  
  // Return HTML page that shows confirmation and redirects
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wildpals - ${type === 'recovery' ? 'Password Reset' : 'Email Verified'}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #4A7C59 0%, #3d6849 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 20px;
          padding: 48px 32px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .icon {
          font-size: 64px;
          margin-bottom: 24px;
          animation: bounce 1s ease-in-out;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        h1 {
          color: #4A7C59;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        
        p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        
        .button {
          display: inline-block;
          background: #4A7C59;
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.3s;
        }
        
        .button:hover {
          background: #3d6849;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(74, 124, 89, 0.3);
          border-top-color: #4A7C59;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-left: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .footer {
          margin-top: 32px;
          color: #999;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">${type === 'recovery' ? '🔐' : '✅'}</div>
        <h1>${type === 'recovery' ? 'Password Reset Link Verified' : 'Email Verified!'}</h1>
        <p>
          ${type === 'recovery' 
            ? 'Your password reset link has been verified. Opening the app to set your new password...' 
            : 'Your email has been successfully verified. Opening the Wildpals app now...'}
        </p>
        <a href="${deepLink}" class="button">
          Open Wildpals App
          <span class="spinner"></span>
        </a>
        <p class="footer">
          If the app doesn't open automatically, tap the button above.
        </p>
      </div>
      
      <script>
        // Attempt to redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '${deepLink}';
        }, 2000);
        
        // Also try to open immediately
        window.location.href = '${deepLink}';
      </script>
    </body>
    </html>
  `
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
})
