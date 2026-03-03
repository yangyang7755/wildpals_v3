-- Database Trigger for Report Email Notifications
-- This trigger automatically invokes the Edge Function when a new report is inserted

-- First, ensure the pg_net extension is enabled (required for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function that will be triggered on INSERT to user_reports
CREATE OR REPLACE FUNCTION notify_admin_on_report()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
  request_id BIGINT;
BEGIN
  -- Get the Supabase project URL and service role key from environment
  -- These should be set in your Supabase project settings
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-report-email';
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Make async HTTP request to Edge Function
  -- Using pg_net for non-blocking HTTP requests
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'user_reports',
      'record', row_to_json(NEW)
    )
  ) INTO request_id;

  -- Log the request for debugging
  RAISE NOTICE 'Report email notification triggered for report ID: %, request_id: %', NEW.id, request_id;

  -- Return NEW to continue with the INSERT
  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the INSERT
    RAISE WARNING 'Failed to send report email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on user_reports table
DROP TRIGGER IF EXISTS on_report_created ON user_reports;

CREATE TRIGGER on_report_created
  AFTER INSERT ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_report();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;

-- Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_report_created';

-- ============================================
-- ALTERNATIVE: Using Supabase Webhooks (Recommended)
-- ============================================
-- Instead of using pg_net, you can configure a webhook in Supabase Dashboard:
-- 
-- 1. Go to Database → Webhooks
-- 2. Click "Create a new hook"
-- 3. Configure:
--    - Name: "Report Email Notification"
--    - Table: user_reports
--    - Events: INSERT
--    - Type: Supabase Edge Function
--    - Edge Function: send-report-email
-- 4. Save
--
-- This approach is simpler and doesn't require pg_net or custom triggers.
-- The webhook will automatically call your Edge Function with the new report data.

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================
-- 
-- Option 1: Using Database Trigger (Current approach)
-- --------------------------------------------
-- 1. Deploy the Edge Function:
--    cd supabase
--    supabase functions deploy send-report-email
--
-- 2. Set environment variables in Supabase Dashboard:
--    - Go to Project Settings → Edge Functions
--    - Add secrets:
--      * RESEND_API_KEY: Your Resend API key
--      * SUPABASE_URL: Your project URL
--      * SUPABASE_SERVICE_ROLE_KEY: Your service role key
--
-- 3. Configure database settings:
--    ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
--    ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
--
-- 4. Run this SQL file in Supabase SQL Editor
--
-- Option 2: Using Supabase Webhooks (Recommended - Simpler)
-- --------------------------------------------
-- 1. Deploy the Edge Function (same as above)
-- 2. Set environment variables (same as above)
-- 3. Configure webhook in Supabase Dashboard (see instructions above)
-- 4. No need to run this SQL file
--
-- ============================================
-- TESTING
-- ============================================
-- 
-- Test the trigger by inserting a test report:
-- 
-- INSERT INTO user_reports (
--   reporter_id,
--   reported_user_id,
--   report_type,
--   reason,
--   description
-- ) VALUES (
--   'your-user-id',
--   'reported-user-id',
--   'user_behavior',
--   'harassment',
--   'Test report for email notification'
-- );
--
-- Check:
-- 1. Supabase Edge Function logs for execution
-- 2. Email inbox (yangyang.ruohan.liu@gmail.com)
-- 3. Resend dashboard for email delivery status
--
-- ============================================
-- TROUBLESHOOTING
-- ============================================
--
-- If emails are not being sent:
--
-- 1. Check Edge Function logs:
--    - Supabase Dashboard → Edge Functions → send-report-email → Logs
--
-- 2. Verify environment variables are set:
--    - Project Settings → Edge Functions → Secrets
--
-- 3. Check trigger is firing:
--    - Look for NOTICE messages in database logs
--
-- 4. Verify Resend API key is valid:
--    - Test in Resend dashboard
--
-- 5. Check pg_net extension is enabled:
--    SELECT * FROM pg_extension WHERE extname = 'pg_net';
--
-- 6. Check database settings:
--    SHOW app.settings.supabase_url;
--    SHOW app.settings.service_role_key;
--
-- ============================================
-- CLEANUP (if needed)
-- ============================================
--
-- To remove the trigger:
-- DROP TRIGGER IF EXISTS on_report_created ON user_reports;
-- DROP FUNCTION IF EXISTS notify_admin_on_report();
