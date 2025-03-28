-- Drop existing foreign key constraint if exists
ALTER TABLE IF EXISTS booked_donors
    DROP CONSTRAINT IF EXISTS booked_donors_donor_id_fkey;

-- Recreate the foreign key constraint with proper relationship
ALTER TABLE booked_donors
    ADD CONSTRAINT booked_donors_donor_id_fkey
    FOREIGN KEY (donor_id)
    REFERENCES donors(id)
    ON DELETE CASCADE;

-- Enable RLS for booked_donors table
ALTER TABLE booked_donors ENABLE ROW LEVEL SECURITY;

-- Create policies for booked_donors
CREATE POLICY "Users can view their own bookings"
    ON booked_donors
    FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid());

CREATE POLICY "Users can create bookings"
    ON booked_donors
    FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
    ON booked_donors
    FOR UPDATE
    TO authenticated
    USING (requester_id = auth.uid());