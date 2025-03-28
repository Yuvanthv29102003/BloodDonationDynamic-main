-- Create blood_requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    blood_group TEXT NOT NULL CHECK (blood_group IN ('O+', 'O-', 'B+', 'B-', 'A+', 'A-', 'AB+', 'AB-')),
    requester_name TEXT NOT NULL,
    request_status TEXT NOT NULL DEFAULT 'pending' CHECK (request_status IN ('pending', 'accepted', 'rejected', 'completed')),
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance DECIMAL(10, 2),
    units INTEGER NOT NULL CHECK (units > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_blood_requests_updated_at ON blood_requests;
CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient querying
CREATE INDEX idx_blood_requests_user ON blood_requests(user_id);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX idx_blood_requests_status ON blood_requests(request_status);

-- Enable Row Level Security (RLS)
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view their own requests"
    ON blood_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
    ON blood_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
    ON blood_requests FOR UPDATE
    USING (auth.uid() = user_id);