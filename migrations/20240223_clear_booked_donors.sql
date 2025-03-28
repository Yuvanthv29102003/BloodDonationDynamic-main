-- Clear all booked donor records while maintaining referential integrity

-- First, update any donations records to set booked_donor_id to null
-- This maintains donation history while allowing us to delete booked_donor records
UPDATE donations
SET booked_donor_id = NULL
WHERE booked_donor_id IS NOT NULL;

-- Now safely delete all booked_donor records
DELETE FROM booked_donors;