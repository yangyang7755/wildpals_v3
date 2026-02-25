-- Fix Notifications Table Migration
-- This handles both new installations and existing tables

-- Step 1: Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS trigger_notify_join_request_accepted ON join_requests;
DROP TRIGGER IF EXISTS trigger_notify_join_request_rejected ON join_requests;
DROP TRIGGER IF EXISTS trigger_notify_new_join_request ON join_requests;

DROP FUNCTION IF EXISTS notify_join_request_accepted();
DROP FUNCTION IF EXISTS notify_join_request_rejected();
DROP FUNCTION IF EXISTS notify_new_join_request();
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, UUID, TEXT);

-- Step 2: Check if notifications table exists and rename 'read' to 'is_read' if needed
DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Check if 'read' column exists (old version)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') THEN
      -- Rename 'read' to 'is_read'
      ALTER TABLE notifications RENAME COLUMN read TO is_read;
      RAISE NOTICE 'Renamed column "read" to "is_read"';
    END IF;
    
    -- Check if 'is_read' column exists, if not add it
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
      ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
      RAISE NOTICE 'Added column "is_read"';
    END IF;
  ELSE
    -- Create new table
    CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('join_request_accepted', 'join_request_rejected', 'new_join_request', 'new_message', 'activity_update', 'club_update')),
      title TEXT NOT NULL,
      message TEXT,
      related_id UUID,
      related_type TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'Created new notifications table';
  END IF;
END $$;

-- Step 3: Drop and recreate indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Step 4: Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Step 6: Create notification functions
CREATE OR REPLACE FUNCTION notify_join_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    SELECT 
      NEW.requester_id,
      'join_request_accepted',
      'Request Accepted! 🎉',
      'Your request to join "' || a.title || '" has been accepted',
      NEW.activity_id,
      'activity'
    FROM activities a
    WHERE a.id = NEW.activity_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_join_request_rejected()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    SELECT 
      NEW.requester_id,
      'join_request_rejected',
      'Request Declined',
      'Your request to join "' || a.title || '" was declined',
      NEW.activity_id,
      'activity'
    FROM activities a
    WHERE a.id = NEW.activity_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_new_join_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    SELECT 
      a.organizer_id,
      'new_join_request',
      'New Join Request',
      p.full_name || ' wants to join "' || a.title || '"',
      NEW.activity_id,
      'activity'
    FROM activities a
    JOIN profiles p ON p.id = NEW.requester_id
    WHERE a.id = NEW.activity_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create triggers
CREATE TRIGGER trigger_notify_join_request_accepted
  AFTER UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_accepted();

CREATE TRIGGER trigger_notify_join_request_rejected
  AFTER UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_rejected();

CREATE TRIGGER trigger_notify_new_join_request
  AFTER INSERT ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_join_request();

-- Step 8: Grant permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT INSERT ON notifications TO service_role;

-- Verification queries (optional - comment out if not needed)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications';
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'join_requests';
