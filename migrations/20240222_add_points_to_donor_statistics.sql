-- Add points column to donor_statistics table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'donor_statistics' 
        AND column_name = 'points'
    ) THEN
        ALTER TABLE donor_statistics
        ADD COLUMN points INTEGER DEFAULT 0;

        -- Update existing records to have points based on their donation count
        -- Each donation is worth 200 points
        UPDATE donor_statistics
        SET points = donation_count * 200
        WHERE donation_count > 0;
    END IF;
END $$;