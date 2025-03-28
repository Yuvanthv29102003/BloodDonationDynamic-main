-- Add next_donation_date column to donor_statistics table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'donor_statistics' 
        AND column_name = 'next_donation_date'
    ) THEN
        ALTER TABLE donor_statistics
        ADD COLUMN next_donation_date TIMESTAMP WITH TIME ZONE;

        -- Update existing records to have a next_donation_date
        -- Set it to 3 months after their last donation if they have one
        UPDATE donor_statistics
        SET next_donation_date = last_donation_date + interval '3 months'
        WHERE last_donation_date IS NOT NULL;
    END IF;
END $$;