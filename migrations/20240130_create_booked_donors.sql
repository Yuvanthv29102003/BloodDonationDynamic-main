-- Create booked_donors table
CREATE TABLE IF NOT EXISTS booked_donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES donors(id),
    requester_id UUID REFERENCES auth.users(id),
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_booked_donors_updated_at ON booked_donors;
CREATE TRIGGER update_booked_donors_updated_at
    BEFORE UPDATE ON booked_donors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_booked_donors_donor ON booked_donors(donor_id);
CREATE INDEX idx_booked_donors_requester ON booked_donors(requester_id);
CREATE INDEX idx_booked_donors_status ON booked_donors(status);