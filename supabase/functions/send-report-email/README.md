# Send Report Email Edge Function

This Supabase Edge Function sends email notifications to the admin when users submit reports in Wildpals.

## Purpose

Automatically notifies the admin at `yangyang.ruohan.liu@gmail.com` when:
- A user reports another user's behavior
- A user reports an inappropriate message
- A user reports an inappropriate activity

## How It Works

1. User submits a report → Saved to `user_reports` table
2. Database webhook triggers this Edge Function
3. Function fetches report details from Supabase
4. Function sends formatted email via Resend API
5. Admin receives email with all report information

## Environment Variables Required

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
RESEND_API_KEY=re_your_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Deployment

### Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name: `send-report-email`
4. Copy contents of `index.ts` and paste
5. Click "Deploy"

### Using Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy
supabase functions deploy send-report-email
```

## Testing Locally

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve send-report-email --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-report-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"record":{"id":"test-id","reporter_id":"user-1","reported_user_id":"user-2","report_type":"user_behavior","reason":"harassment","description":"Test report","created_at":"2024-01-01T00:00:00Z"}}'
```

## Email Templates

The function generates three types of emails:

### 1. User Behavior Report
- Reporter and reported user details
- Reason and description
- Link to Supabase dashboard

### 2. Message Report
- All of the above, plus:
- Chat type (club/activity)
- Full message content
- Message timestamp

### 3. Activity Report
- All of the above, plus:
- Activity title and description
- Activity location and date

## Error Handling

The function is designed to fail gracefully:
- If email fails, report is still saved
- Errors are logged but don't throw
- Returns 200 status to prevent webhook retries

## Monitoring

Check logs in:
- Supabase Dashboard → Edge Functions → send-report-email → Logs
- Resend Dashboard → Logs

## Troubleshooting

**Email not sent?**
1. Check environment variables are set
2. Verify Resend API key is valid
3. Check Edge Function logs for errors
4. Verify webhook is configured correctly

**Can't fetch report details?**
1. Verify user IDs exist in profiles table
2. Check RLS policies allow service role access
3. Verify message/activity IDs are valid

## Related Files

- `database-migrations/CREATE-REPORT-EMAIL-TRIGGER.sql` - Database trigger setup
- `REPORT-EMAIL-SETUP-GUIDE.md` - Complete setup instructions
- `RESEND-SETUP-GUIDE.md` - Resend account setup

## Security

- Uses service role key for admin access to all tables
- Sanitizes all user input before including in emails
- Never exposes sensitive keys in responses
- Logs errors without exposing user data
