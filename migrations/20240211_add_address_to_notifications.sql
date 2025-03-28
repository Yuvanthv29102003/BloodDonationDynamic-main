-- Add address column to notifications table
ALTER TABLE notifications
ADD COLUMN address TEXT;

-- Update existing notifications with sample addresses
UPDATE notifications
SET address = CASE
  WHEN id::text = (SELECT id::text FROM notifications ORDER BY created_at ASC LIMIT 1 OFFSET 0) THEN 'No. 12, Anna Nagar East, Chennai, Tamil Nadu 600102'
  WHEN id::text = (SELECT id::text FROM notifications ORDER BY created_at ASC LIMIT 1 OFFSET 1) THEN '45/2, T. Nagar Main Road, Chennai, Tamil Nadu 600017'
  WHEN id::text = (SELECT id::text FROM notifications ORDER BY created_at ASC LIMIT 1 OFFSET 2) THEN '78A, Velachery Main Road, Chennai, Tamil Nadu 600042'
  WHEN id::text = (SELECT id::text FROM notifications ORDER BY created_at ASC LIMIT 1 OFFSET 3) THEN '23, Mount Road, Chennai, Tamil Nadu 600002'
  WHEN id::text = (SELECT id::text FROM notifications ORDER BY created_at ASC LIMIT 1 OFFSET 4) THEN '156, OMR Road, Thoraipakkam, Chennai, Tamil Nadu 600097'
  ELSE 'Teynampet, Anna Salai, Rathna Nagar, Chennai, Tamil Nadu, India'
END;

-- Make address column NOT NULL
ALTER TABLE notifications
ALTER COLUMN address SET NOT NULL;