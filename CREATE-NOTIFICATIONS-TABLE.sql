-- Create notifications table for in-app notifications
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('join_request_accepted', 'join_request_rejected', 'new_join_request', 'new_message', 'activity_update', 'club_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- activity_id, club_id, or message_id
  related_type TEXT CHECK (related_type IN ('activity', 'club', 'message')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_id, p_related_type)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notify when join request is accepted
CREATE OR REPLACE FUNCTION notify_join_request_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_title TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get activity title
    SELECT title INTO v_activity_title
    FROM public.activities
    WHERE id = NEW.activity_id;
    
    -- Create notification
    PERFORM create_notification(
      NEW.requester_id,
      'join_request_accepted',
      'Join Request Accepted! 🎉',
      'Your request to join "' || v_activity_title || '" has been accepted.',
      NEW.activity_id,
      'activity'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_join_request_accepted
  AFTER UPDATE ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_accepted();

-- Trigger: Notify when join request is rejected
CREATE OR REPLACE FUNCTION notify_join_request_rejected()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_title TEXT;
BEGIN
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Get activity title
    SELECT title INTO v_activity_title
    FROM public.activities
    WHERE id = NEW.activity_id;
    
    -- Create notification
    PERFORM create_notification(
      NEW.requester_id,
      'join_request_rejected',
      'Join Request Declined',
      'Your request to join "' || v_activity_title || '" was declined.',
      NEW.activity_id,
      'activity'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_join_request_rejected
  AFTER UPDATE ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_rejected();

-- Trigger: Notify organizer of new join request
CREATE OR REPLACE FUNCTION notify_new_join_request()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_title TEXT;
  v_organizer_id UUID;
  v_requester_name TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    -- Get activity details
    SELECT title, organizer_id INTO v_activity_title, v_organizer_id
    FROM public.activities
    WHERE id = NEW.activity_id;
    
    -- Get requester name
    SELECT full_name INTO v_requester_name
    FROM public.profiles
    WHERE id = NEW.requester_id;
    
    -- Create notification for organizer
    PERFORM create_notification(
      v_organizer_id,
      'new_join_request',
      'New Join Request',
      v_requester_name || ' wants to join "' || v_activity_title || '"',
      NEW.activity_id,
      'activity'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_join_request
  AFTER INSERT ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_join_request();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
