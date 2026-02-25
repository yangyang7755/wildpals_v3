-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('join_request_accepted', 'join_request_rejected', 'new_join_request', 'new_message', 'activity_update')),
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID, -- Can reference activity_id, join_request_id, etc.
  related_type TEXT, -- 'activity', 'join_request', 'message', etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Function to create notification for join request accepted
CREATE OR REPLACE FUNCTION notify_join_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status changed to 'accepted'
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

-- Function to create notification for join request rejected
CREATE OR REPLACE FUNCTION notify_join_request_rejected()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status changed to 'rejected'
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

-- Function to notify organizer of new join request
CREATE OR REPLACE FUNCTION notify_new_join_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for new pending requests
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

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_join_request_status ON join_requests;
CREATE TRIGGER trigger_notify_join_request_status
  AFTER UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_accepted();

DROP TRIGGER IF EXISTS trigger_notify_join_request_rejected ON join_requests;
CREATE TRIGGER trigger_notify_join_request_rejected
  AFTER UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_rejected();

DROP TRIGGER IF EXISTS trigger_notify_new_join_request ON join_requests;
CREATE TRIGGER trigger_notify_new_join_request
  AFTER INSERT ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_join_request();

-- Grant permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT INSERT ON notifications TO service_role;
