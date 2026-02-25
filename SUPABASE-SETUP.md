# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Name: `wildpals`
   - Database Password: (generate strong password - save it!)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project dashboard
2. Go to Settings → API
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

## Step 3: Database Schema

Run this SQL in Supabase SQL Editor (Database → SQL Editor → New Query):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sports and skill levels
CREATE TABLE public.user_sports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL CHECK (sport IN ('cycling', 'climbing', 'running')),
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sport)
);

-- User gear
CREATE TABLE public.user_gear (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  gear_name TEXT NOT NULL,
  owned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cycling', 'climbing', 'running')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  meetup_location TEXT NOT NULL,
  max_participants INTEGER NOT NULL,
  special_comments TEXT,
  
  -- Cycling specific
  distance NUMERIC,
  distance_unit TEXT CHECK (distance_unit IN ('km', 'miles')),
  elevation NUMERIC,
  elevation_unit TEXT CHECK (elevation_unit IN ('m', 'feet')),
  pace NUMERIC,
  pace_unit TEXT CHECK (pace_unit IN ('kph', 'mph')),
  route_link TEXT,
  cafe_stop TEXT,
  
  -- Climbing specific
  climbing_level TEXT,
  gear_required TEXT,
  
  -- Common filters
  gender TEXT DEFAULT 'All genders',
  age_min INTEGER,
  age_max INTEGER,
  visibility TEXT DEFAULT 'All',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved activities
CREATE TABLE public.saved_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);

-- Join requests
CREATE TABLE public.join_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, requester_id)
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewee_id, activity_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_sports
CREATE POLICY "User sports are viewable by everyone"
  ON public.user_sports FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own sports"
  ON public.user_sports FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for activities
CREATE POLICY "Activities are viewable by everyone"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Users can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = organizer_id);

-- RLS Policies for saved_activities
CREATE POLICY "Users can view own saved activities"
  ON public.saved_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved activities"
  ON public.saved_activities FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for join_requests
CREATE POLICY "Join requests viewable by organizer and requester"
  ON public.join_requests FOR SELECT
  USING (
    auth.uid() = requester_id OR 
    auth.uid() IN (SELECT organizer_id FROM activities WHERE id = activity_id)
  );

CREATE POLICY "Users can create join requests"
  ON public.join_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Organizers can update join requests"
  ON public.join_requests FOR UPDATE
  USING (auth.uid() IN (SELECT organizer_id FROM activities WHERE id = activity_id));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Create indexes for performance
CREATE INDEX idx_activities_date ON public.activities(date);
CREATE INDEX idx_activities_type ON public.activities(type);
CREATE INDEX idx_activities_organizer ON public.activities(organizer_id);
CREATE INDEX idx_join_requests_activity ON public.join_requests(activity_id);
CREATE INDEX idx_join_requests_requester ON public.join_requests(requester_id);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON public.chat_messages(receiver_id);
CREATE INDEX idx_saved_activities_user ON public.saved_activities(user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Configure Environment Variables

Add to your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step 5: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Next Steps

After completing this setup:
1. Update `.env` with your Supabase credentials
2. Run the SQL schema in Supabase
3. Test authentication in the app
4. Build onboarding flow
5. Implement core features

## Database Structure Summary

- **profiles**: User accounts (name, bio, location, photo)
- **user_sports**: Sports and skill levels per user
- **user_gear**: Equipment ownership tracking
- **activities**: All activities/events
- **saved_activities**: Bookmarked activities
- **join_requests**: Requests to join activities
- **chat_messages**: Direct messages between users
- **reviews**: 5-star ratings and comments

All tables have Row Level Security (RLS) enabled for data protection.
