-- Add lives_saved column to donor_statistics if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'donor_statistics'
        AND column_name = 'lives_saved'
    ) THEN
        ALTER TABLE donor_statistics
        ADD COLUMN lives_saved INTEGER NOT NULL DEFAULT 0;

        ALTER TABLE donor_statistics
        ADD CONSTRAINT valid_lives_saved CHECK (lives_saved >= 0);
    END IF;
END
$$;