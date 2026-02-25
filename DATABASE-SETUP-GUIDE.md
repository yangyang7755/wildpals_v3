# Database Setup Guide

## ⚠️ IMPORTANT: Run This First!

You're getting the error `Could not find the table 'public.clubs'` because the database tables haven't been created yet.

## Step-by-Step Setup

### 1. Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard/project/xikaltnufqbysnrsjzwa
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 2. Run the Clubs Schema

Copy and paste the entire contents of `DATABASE-CLUBS-SCHEMA.sql` into the SQL Editor and click "Run".

This will create:
- `clubs` table
- `club_members` table
- Add `club_id` column to `activities` table
- Set up Row Level Security (RLS) policies
- Create triggers for automatic member count updates
- Insert 3 demo clubs

### 3. Verify Tables Were Created

Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clubs', 'club_members');
```

You should see both tables listed.

### 4. Check Demo Data

Run this to see the demo clubs:

```sql
SELECT * FROM clubs;
```

You should see 3 clubs:
- London Cycling Club
- Urban Climbers
- Morning Runners

### 5. Restart Your Expo App

After running the SQL migration:
1. Stop your Expo dev server (Ctrl+C)
2. Clear cache: `npx expo start -c`
3. The clubs feature should now work!

## Troubleshooting

### Error: "relation already exists"
If you see this error, it means the tables are already created. You can skip the migration.

### Error: "permission denied"
Make sure you're logged into Supabase with the correct account that owns the project.

### Tables not showing up
1. Make sure you ran the SQL in the correct project
2. Check the project URL matches: `xikaltnufqbysnrsjzwa`
3. Try refreshing the Supabase dashboard

## What Gets Created

### Tables

**clubs**
- id (UUID, primary key)
- name (text)
- description (text)
- location (text)
- sport_type (cycling/climbing/running/mixed)
- creator_id (UUID, references auth.users)
- member_count (integer)
- logo_url (text)
- created_at, updated_at (timestamps)

**club_members**
- id (UUID, primary key)
- club_id (UUID, references clubs)
- user_id (UUID, references auth.users)
- role (admin/member)
- status (pending/active/rejected)
- join_message (text)
- joined_at (timestamp)

**activities** (modified)
- Added: club_id (UUID, optional, references clubs)

### Security

All tables have Row Level Security (RLS) enabled with policies:
- Anyone can view clubs and members
- Authenticated users can create clubs
- Club creators can update/delete their clubs
- Club admins can approve/reject join requests
- Users can request to join clubs
- Users can leave clubs

### Automatic Features

- Member count automatically updates when members join/leave
- Triggers handle all count updates
- Indexes for fast queries

## Next Steps After Setup

1. Test creating a club
2. Test joining a club
3. Test viewing club details
4. Test the activity chat feature
