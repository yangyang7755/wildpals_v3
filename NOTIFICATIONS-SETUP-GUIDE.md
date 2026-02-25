# Notifications System Setup Guide

## Quick Fix for the Error

You got the error because there was an old `notifications` table with a column named `read` instead of `is_read`. I've created a migration script that handles this.

## Step-by-Step Instructions

### Option 1: Run the Fix Migration (RECOMMENDED)

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the entire contents of `FIX-NOTIFICATIONS-MIGRATION.sql`
4. Click "Run"
5. You should see success messages like:
   - "Renamed column 'read' to 'is_read'"
   - Or "Created new notifications table" (if starting fresh)

This script will:
- ✅ Handle existing tables (rename `read` to `is_read`)
- ✅ Create new table if it doesn't exist
- ✅ Drop and recreate all triggers and functions
- ✅ Set up proper RLS policies
- ✅ Create indexes for performance

### Option 2: Start Fresh (If you want to delete old data)

If you don't need existing notification data:

```sql
-- Drop everything and start fresh
DROP TABLE IF EXISTS notifications CASCADE;
DROP FUNCTION IF EXISTS notify_join_request_accepted() CASCADE;
DROP FUNCTION IF EXISTS notify_join_request_rejected() CASCADE;
DROP FUNCTION IF EXISTS notify_new_join_request() CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, UUID, TEXT) CASCADE;
```

Then run `FIX-NOTIFICATIONS-MIGRATION.sql`

## Verification

After running the migration, verify it worked:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Should show:
-- id, user_id, type, title, message, related_id, related_type, is_read, created_at

-- Check triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'join_requests';

-- Should show 3 triggers:
-- trigger_notify_join_request_accepted
-- trigger_notify_join_request_rejected  
-- trigger_notify_new_join_request

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- Should show 3 policies:
-- Users can view own notifications (SELECT)
-- Users can update own notifications (UPDATE)
-- System can insert notifications (INSERT)
```

## Testing the System

### Test 1: New Join Request Notification
1. User A creates an activity
2. User B requests to join
3. Check User A's notifications:
```sql
SELECT * FROM notifications 
WHERE user_id = 'user-a-id' 
ORDER BY created_at DESC 
LIMIT 1;
```
Should see: "New Join Request" notification

### Test 2: Accept Request Notification
1. User A accepts User B's request
2. Check User B's notifications:
```sql
SELECT * FROM notifications 
WHERE user_id = 'user-b-id' 
ORDER BY created_at DESC 
LIMIT 1;
```
Should see: "Request Accepted! 🎉" notification

### Test 3: Reject Request Notification
1. User A rejects a join request
2. Check requester's notifications:
```sql
SELECT * FROM notifications 
WHERE user_id = 'requester-id' 
ORDER BY created_at DESC 
LIMIT 1;
```
Should see: "Request Declined" notification

### Test 4: In-App Notifications
1. Open the app
2. Go to Notifications tab (🔔)
3. Should see all notifications
4. Tap a notification → should mark as read
5. Badge count should decrease

## Code Changes Made

The app code now supports BOTH column names for compatibility:
- `is_read` (new standard)
- `read` (old version)

This means the app will work whether you:
- Run the migration (renames `read` to `is_read`)
- Keep the old table (uses `read`)
- Start fresh (uses `is_read`)

## Troubleshooting

### Error: "relation 'notifications' already exists"
- The table exists but has wrong structure
- Use Option 1 (Fix Migration) - it handles this

### Error: "column 'read' does not exist"
- Run the fix migration to rename it to `is_read`

### Error: "permission denied for table notifications"
- Check RLS policies are created
- Verify you're logged in as the correct user

### Notifications not appearing in app
1. Check triggers are created (see Verification section)
2. Check RLS policies allow SELECT for authenticated users
3. Check console for errors in React Native app
4. Verify user_id matches between profiles and notifications

### Badge count not updating
- Pull down to refresh the notifications screen
- Check that `is_read` or `read` column is being updated
- Verify the unread count query is working

## What Happens Automatically

Once set up, notifications are created automatically when:

1. **Someone requests to join your activity**
   - Organizer gets: "New Join Request" notification
   - Includes requester name and activity title

2. **Your join request is accepted**
   - Requester gets: "Request Accepted! 🎉" notification
   - Includes activity title
   - Can tap to view activity details

3. **Your join request is rejected**
   - Requester gets: "Request Declined" notification
   - Includes activity title

## Future Enhancements

You can easily add more notification types:

```sql
-- Add new notification type
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'join_request_accepted',
  'join_request_rejected', 
  'new_join_request',
  'new_message',
  'activity_update',
  'club_update',
  'activity_reminder',  -- NEW
  'activity_cancelled'  -- NEW
));

-- Create trigger for new type
CREATE OR REPLACE FUNCTION notify_activity_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all participants when activity is cancelled
  INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
  SELECT 
    jr.requester_id,
    'activity_cancelled',
    'Activity Cancelled',
    'The activity "' || OLD.title || '" has been cancelled',
    OLD.id,
    'activity'
  FROM join_requests jr
  WHERE jr.activity_id = OLD.id 
    AND jr.status = 'accepted';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_activity_cancelled
  BEFORE DELETE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION notify_activity_cancelled();
```

## Summary

✅ Run `FIX-NOTIFICATIONS-MIGRATION.sql` in Supabase
✅ Verify with the SQL queries above
✅ Test by creating activities and join requests
✅ Check notifications appear in the app

The system is now ready for production! 🚀
