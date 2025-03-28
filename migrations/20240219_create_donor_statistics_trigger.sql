-- Create trigger function to create donor statistics when a new donor is registered
CREATE OR REPLACE FUNCTION create_donor_statistics_on_registration()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO donor_statistics (
        donor_id,
        donation_count,
        rating,
        lives_saved
    ) VALUES (
        NEW.id,
        0,
        0.0,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create donor statistics
DROP TRIGGER IF EXISTS create_donor_statistics ON donors;
CREATE TRIGGER create_donor_statistics
    AFTER INSERT ON donors
    FOR EACH ROW
    EXECUTE FUNCTION create_donor_statistics_on_registration();

-- Create donor statistics for existing donors who don't have statistics yet
INSERT INTO donor_statistics (
    donor_id,
    donation_count,
    rating,
    lives_saved
)
SELECT 
    d.id,
    0,
    0.0,
    0
FROM donors d
LEFT JOIN donor_statistics ds ON d.id = ds.donor_id
WHERE ds.donor_id IS NULL;