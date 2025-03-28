-- Add updated_at column to donor_statistics table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'donor_statistics' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE donor_statistics
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

        -- Create trigger to automatically update the updated_at timestamp
        CREATE OR REPLACE FUNCTION update_donor_statistics_timestamp()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_donor_statistics_timestamp ON donor_statistics;
        CREATE TRIGGER update_donor_statistics_timestamp
            BEFORE UPDATE ON donor_statistics
            FOR EACH ROW
            EXECUTE FUNCTION update_donor_statistics_timestamp();
    END IF;
END $$;