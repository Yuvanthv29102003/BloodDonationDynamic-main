-- Add is_read column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='notifications' 
                    AND column_name='is_read') THEN
        ALTER TABLE notifications
        ADD COLUMN is_read BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing notifications to have is_read set to false
UPDATE notifications SET is_read = false WHERE is_read IS NULL;

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='notifications' 
                    AND column_name='user_id') THEN
        ALTER TABLE notifications
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create index if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 
                    FROM pg_indexes 
                    WHERE tablename='notifications' 
                    AND indexname='idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    END IF;
END $$;
