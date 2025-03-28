-- Add sample achievement data
DELETE FROM donor_statistics;

-- Insert sample data with varied achievement levels
INSERT INTO donor_statistics (donor_id, donation_count, last_donation_date, next_donation_date, points, rating, lives_saved)
SELECT 
  id,
  CASE 
    WHEN random() < 0.3 THEN floor(random() * 3 + 1)  -- Bronze (1-3 donations)
    WHEN random() < 0.6 THEN floor(random() * 4 + 4)  -- Silver (4-7 donations)
    ELSE floor(random() * 5 + 8)  -- Gold (8-12 donations)
  END as donation_count,
  CASE 
    WHEN random() < 0.8 THEN current_date - (floor(random() * 90))::integer  -- Last donation within 90 days
    ELSE NULL
  END as last_donation_date,
  CASE 
    WHEN random() < 0.8 THEN current_date + (floor(random() * 90 + 30))::integer  -- Next donation in 30-120 days
    ELSE NULL
  END as next_donation_date,
  CASE 
    WHEN random() < 0.3 THEN floor(random() * 199 + 1)  -- Bronze (<200 points)
    WHEN random() < 0.6 THEN floor(random() * 299 + 200)  -- Silver (200-499 points)
    ELSE floor(random() * 500 + 500)  -- Gold (500+ points)
  END as points,
  CASE
    WHEN random() < 0.3 THEN random() * 2 + 3  -- 3-5 rating
    WHEN random() < 0.6 THEN random() * 2 + 5  -- 5-7 rating
    ELSE random() * 2 + 7  -- 7-9 rating
  END as rating,
  CASE 
    WHEN random() < 0.3 THEN floor(random() * 3 + 1)  -- 1-3 lives saved
    WHEN random() < 0.6 THEN floor(random() * 4 + 4)  -- 4-7 lives saved
    ELSE floor(random() * 5 + 8)  -- 8-12 lives saved
  END as lives_saved
FROM donors
WHERE NOT EXISTS (SELECT 1 FROM donor_statistics ds WHERE ds.donor_id = donors.id);