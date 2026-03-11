# Add Social Activity Type - Step by Step Guide

## Problem
The `activity_type` enum doesn't exist in your database yet.

## Solution - Run These Steps in Order

### Step 1: Check Current Structure

Run this in Supabase SQL Editor to see what you have:

```sql
-- Check activities table structure
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND column_name = 'type';
```

### Step 2A: If `type` column is TEXT

If the result shows `data_type = 'text'`, run this:

```sql
-- Create the enum type
CREATE TYPE activity_type AS ENUM ('cycling', 'climbing', 'running', 'social');

-- Add temporary enum column
ALTER TABLE activities ADD COLUMN type_enum activity_type;

-- Copy data from text to enum
UPDATE activities 
SET type_enum = CASE 
    WHEN type = 'cycling' THEN 'cycling'::activity_type
    WHEN type = 'climbing' THEN 'climbing'::activity_type
    WHEN type = 'running' THEN 'running'::activity_type
    WHEN type = 'social' THEN 'social'::activity_type
    ELSE 'cycling'::activity_type  -- default fallback
END;

-- Drop old text column
ALTER TABLE activities DROP COLUMN type;

-- Rename enum column to 'type'
ALTER TABLE activities RENAME COLUMN type_enum TO type;

-- Make it NOT NULL
ALTER TABLE activities ALTER COLUMN type SET NOT NULL;
```

### Step 2B: If `type` column uses `activity_type` enum

If the result shows `udt_name = 'activity_type'`, just add 'social':

```sql
-- Add 'social' to existing enum
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'social';
```

### Step 2C: If `type` column doesn't exist

If no results, the column needs to be created:

```sql
-- Create the enum type
CREATE TYPE activity_type AS ENUM ('cycling', 'climbing', 'running', 'social');

-- Add type column to activities table
ALTER TABLE activities ADD COLUMN type activity_type NOT NULL DEFAULT 'cycling';
```

### Step 3: Verify

Check that it worked:

```sql
-- See all enum values
SELECT enum_range(NULL::activity_type);

-- Should show: {cycling,climbing,running,social}
```

### Step 4: Test

Try creating a social activity in the app. It should work now!

## Quick Fix (If Unsure)

If you're not sure which step to use, run this safe version:

```sql
-- This will work regardless of current state
DO $$ 
BEGIN
    -- Try to create the enum (will fail silently if exists)
    BEGIN
        CREATE TYPE activity_type AS ENUM ('cycling', 'climbing', 'running', 'social');
    EXCEPTION
        WHEN duplicate_object THEN 
            -- Enum exists, try to add 'social'
            BEGIN
                ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'social';
            EXCEPTION
                WHEN OTHERS THEN NULL;
            END;
    END;
END $$;
```

## Troubleshooting

### Error: "type activity_type already exists"
- The enum exists but doesn't have 'social'
- Run Step 2B only

### Error: "column type does not exist"
- Run Step 2C to add the column

### Error: "cannot cast type text to activity_type"
- The column is text and has invalid values
- Check what values exist:
```sql
SELECT DISTINCT type FROM activities;
```
- Clean up invalid values before migration

### Activities not showing after migration
- Check RLS policies allow reading activities with type='social'
- Verify the enum value was added:
```sql
SELECT unnest(enum_range(NULL::activity_type));
```

## Summary

The issue is that your database schema needs the `activity_type` enum. Follow the steps above based on your current table structure, and social activities will work!
