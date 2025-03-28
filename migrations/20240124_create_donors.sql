-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'available',
    last_donation_date TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_blood_group CHECK (blood_group IN ('O+', 'O-', 'B+', 'B-', 'A+', 'A-', 'AB+', 'AB-')),
    CONSTRAINT valid_status CHECK (availability_status IN ('available', 'unavailable', 'pending'))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_donors_updated_at ON donors;
CREATE TRIGGER update_donors_updated_at
    BEFORE UPDATE ON donors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for blood group searches
CREATE INDEX idx_donors_blood_group ON donors(blood_group);

-- Create index for location-based queries
CREATE INDEX idx_donors_location ON donors USING gist (
    ll_to_earth(latitude, longitude)
);