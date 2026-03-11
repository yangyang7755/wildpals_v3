-- Step 1: Check current activities table structure
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND column_name = 'type';

-- Step 2: Check if activity_type enum exists
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'activity_type'
ORDER BY e.enumsortorder;

-- Step 3: If enum exists, add 'social' value
-- Run this only if the enum exists:
-- ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'social';

-- Step 4: If enum doesn't exist, create it
-- Run this only if the enum doesn't exist:
-- CREATE TYPE activity_type AS ENUM ('cycling', 'climbing', 'running', 'social');

-- Step 5: If activities.type is text, convert to enum
-- This is more complex and should be done carefully
-- See CREATE-ACTIVITY-TYPE-ENUM.sql for the full migration
