-- Add email column to blood_banks table
ALTER TABLE blood_banks
ADD COLUMN email TEXT;

-- Update existing blood banks with email addresses
UPDATE blood_banks
SET email = CASE
    WHEN name = 'City Blood Bank' THEN 'contact@citybloodbank.com'
    WHEN name = 'Central Blood Center' THEN 'info@centralblood.com'
    WHEN name = 'Life Care Blood Bank' THEN 'support@lifecareblood.com'
    WHEN name = 'VHS - Adyar' THEN 'contact@vhsbloodbank.com'
    WHEN name = 'Kumaran (Blood Bank)' THEN 'info@kumaranbloodbank.com'
    WHEN name = 'Annai Teresa' THEN 'contact@annaiteresa.com'
    WHEN name = 'Sri Venkateshwaraa' THEN 'info@srivenkateshwaraa.com'
    ELSE name || '@bloodbank.com'
END;

-- Make email column NOT NULL after updating existing records
ALTER TABLE blood_banks
ALTER COLUMN email SET NOT NULL;