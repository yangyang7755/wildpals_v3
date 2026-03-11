# Fix Delete Account - Complete Backend Deletion

## Problem
Deleting account only removes data from `profiles` table, but user still exists in Supabase Auth (`auth.users`). User can still login with same email.

## Solution
Updated delete account to remove user from both database AND Supabase Auth.

## Step 1: Create Database Function

Run this SQL in Supabase SQL Editor:

```sql
-- Create function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the user from auth.users
  -- This will cascade delete to profiles and all related data
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
```

**Go to:** https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa/sql/new

Paste the SQL above and click "Run".

## Step 2: Verify Cascade Deletes

Make sure your database has CASCADE DELETE set up. Run this to check:

```sql
-- Check foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'profiles'
ORDER BY tc.table_name;
```

All `delete_rule` should be `CASCADE` or `SET NULL`.

## Step 3: Test Delete Account

1. **Create test account:**
   - Sign up with test email
   - Complete profile
   - Create some activities/join clubs

2. **Delete account:**
   - Go to Settings
   - Tap "Delete Account"
   - Confirm deletion

3. **Verify deletion:**
   - Check you're logged out
   - Try to login with same email → Should fail
   - Check database:

```sql
-- Should return no results
SELECT * FROM auth.users WHERE email = 'test@example.com';
SELECT * FROM profiles WHERE email = 'test@example.com';
```

## How It Works

### Before (Broken):
```
User taps Delete Account
  ↓
Delete from profiles table
  ↓
Logout
  ↓
User still exists in auth.users ❌
User can login again ❌
```

### After (Fixed):
```
User taps Delete Account
  ↓
Delete from profiles table (CASCADE deletes related data)
  ↓
Call delete_user() function
  ↓
Delete from auth.users
  ↓
Logout
  ↓
User completely removed ✅
Cannot login again ✅
```

## What Gets Deleted

When user deletes account, these are removed:

1. **Auth record** (`auth.users`)
   - Email, password, metadata
   - Cannot login anymore

2. **Profile** (`profiles`)
   - Name, bio, location, etc.

3. **Activities** (`activities`)
   - All activities created by user
   - CASCADE deletes join_requests for those activities

4. **Join Requests** (`join_requests`)
   - All join requests made by user

5. **Club Memberships** (`club_members`)
   - All clubs user joined

6. **Notifications** (`notifications`)
   - All notifications for user

7. **Messages** (`messages`)
   - All messages sent by user

8. **Reports** (`reports`)
   - All reports made by user

9. **Blocks** (`blocks`)
   - All blocks created by user

## Troubleshooting

### Error: "Not authenticated"
- User session expired
- Ask user to logout and login again
- Then try delete

### Error: "permission denied for function delete_user"
- Function not created or permissions not granted
- Re-run Step 1 SQL

### User still exists after delete
- Check if function was created:
```sql
SELECT * FROM pg_proc WHERE proname = 'delete_user';
```
- Check if CASCADE is set up on foreign keys

### Cannot delete due to foreign key constraint
- Some table doesn't have CASCADE DELETE
- Find the constraint:
```sql
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';
```
- Update to CASCADE:
```sql
ALTER TABLE table_name
DROP CONSTRAINT constraint_name,
ADD CONSTRAINT constraint_name
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;
```

## Security Notes

- ✅ Function uses `SECURITY DEFINER` to run with elevated privileges
- ✅ Function checks `auth.uid()` to ensure user is authenticated
- ✅ User can only delete their own account (not others)
- ✅ No way to recover deleted account
- ✅ All data permanently removed

## Alternative: Soft Delete

If you want to keep user data for analytics/legal reasons, use soft delete instead:

```sql
-- Add deleted_at column to profiles
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update delete function to soft delete
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET deleted_at = NOW() 
  WHERE id = auth.uid();
  
  -- Still delete from auth.users so they can't login
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```

Then filter out deleted users in queries:
```sql
WHERE deleted_at IS NULL
```

## Summary

✅ Updated Settings.tsx to call delete_user() function
✅ Created database function for self-deletion
✅ User removed from both database AND auth
✅ Cannot login with deleted email
✅ All related data cascade deleted
