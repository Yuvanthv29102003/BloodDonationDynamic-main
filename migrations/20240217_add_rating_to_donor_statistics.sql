-- Add rating column to donor_statistics if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'donor_statistics'
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE donor_statistics
        ADD COLUMN rating DECIMAL(3,1) DEFAULT 0.0;

        -- Add constraint for rating range
        ALTER TABLE donor_statistics
        ADD CONSTRAINT valid_rating
        CHECK (rating >= 0.0 AND rating <= 5.0);
    END IF;
END
$$;