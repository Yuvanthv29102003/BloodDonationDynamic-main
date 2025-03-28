-- Drop existing table if exists
DROP TABLE IF EXISTS registrations;

-- Create registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES donors(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  location TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  avatar_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_donor_email_registration UNIQUE (donor_id, email)
);

-- Add RLS policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own registrations
CREATE POLICY "Users can view own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = donor_id);

-- Allow users to insert their own registrations
CREATE POLICY "Users can insert own registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

-- Allow users to update their own registrations
CREATE POLICY "Users can update own registrations"
  ON registrations FOR UPDATE
  USING (auth.uid() = donor_id);