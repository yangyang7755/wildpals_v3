-- Check if the enum already exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM ('cycling', 'climbing', 'running', 'social');
    END IF;
END $$;

-- If the activities table uses a text column for type, we need to convert it
-- First, check the current column type
DO $$
BEGIN
    -- Check if the 'type' column exists and is text
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'type' 
        AND data_type = 'text'
    ) THEN
        -- Add a temporary column with the enum type
        ALTER TABLE activities ADD COLUMN type_enum activity_type;
        
        -- Copy data from text to enum (with validation)
        UPDATE activities 
        SET type_enum = type::activity_type 
        WHERE type IN ('cycling', 'climbing', 'running', 'social');
        
        -- Drop the old text column
        ALTER TABLE activities DROP COLUMN type;
        
        -- Rename the enum column to 'type'
        ALTER TABLE activities RENAME COLUMN type_enum TO type;
        
        -- Make it NOT NULL if it should be required
        ALTER TABLE activities ALTER COLUMN type SET NOT NULL;
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'type'
        AND udt_name = 'activity_type'
    ) THEN
        -- Type column already uses the enum, just add 'social' if not present
        BEGIN
            ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'social';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Add comment
COMMENT ON TYPE activity_type IS 'Types of activities: cycling, climbing, running, social';

-- Verify the enum values
SELECT enum_range(NULL::activity_type);
