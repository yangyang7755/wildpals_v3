-- Add clerk_id column to profiles table for Clerk authentication integration
-- Run this in your Supabase SQL Editor

-- Add the clerk_id column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Create an index for fast lookups by clerk_id
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);

-- Update RLS policies to allow inserts with clerk_id
-- Allow anyone to insert their own profile (needed for new Clerk users)
CREATE POLICY IF NOT EXISTS "Allow insert with clerk_id" ON profiles
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile by clerk_id
CREATE POLICY IF NOT EXISTS "Allow update by clerk_id" ON profiles
  FOR UPDATE USING (true);

-- Allow reading profiles
CREATE POLICY IF NOT EXISTS "Allow read profiles" ON profiles
  FOR SELECT USING (true);
