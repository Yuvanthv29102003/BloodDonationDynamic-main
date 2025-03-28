-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create blood_camps table
CREATE TABLE blood_camps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    organizer_id UUID REFERENCES donors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))
);

-- Create blood_on_call table
CREATE TABLE blood_on_call (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    contact_numbers TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_camp_id UUID REFERENCES blood_camps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES donors(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for blood_on_call
INSERT INTO blood_on_call (title, subtitle, description, contact_numbers)
VALUES (
    'DONATE BLOOD, SAVE LIFE!',
    'BLOOD ON CALL',
    'Blood required for patients will be a phone call away with the Set',
    ARRAY['25665566', '25665156', '4821655']
);

-- Insert sample data for blood_camps
INSERT INTO blood_camps (title, description, location, event_date, status)
VALUES (
    'Join Us for a Life-Saving Event! 🩸',
    'Blood Donation Camp',
    'RMD Engineering College',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    'upcoming'
);