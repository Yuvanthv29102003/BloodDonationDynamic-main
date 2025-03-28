-- Add dummy data for donor achievements
INSERT INTO donor_statistics (donor_id, donation_count, last_donation_date, next_donation_date, points, rating, lives_saved)
SELECT
  donor_id,
  FLOOR(RANDOM() * 10 + 1)::int as donation_count,
  CURRENT_DATE - (FLOOR(RANDOM() * 90))::int as last_donation_date,
  CURRENT_DATE + (FLOOR(RANDOM() * 90))::int as next_donation_date,
  FLOOR(RANDOM() * 1000 + 100)::int as points,
  ROUND((RANDOM() * 2 + 3)::numeric, 1) as rating,
  FLOOR(RANDOM() * 20 + 1)::int as lives_saved
FROM donors
WHERE NOT EXISTS (
  SELECT 1 FROM donor_statistics ds WHERE ds.donor_id = donors.id
)
ON CONFLICT (donor_id) DO UPDATE
SET
  donation_count = EXCLUDED.donation_count,
  last_donation_date = EXCLUDED.last_donation_date,
  next_donation_date = EXCLUDED.next_donation_date,
  points = EXCLUDED.points,
  rating = EXCLUDED.rating,
  lives_saved = EXCLUDED.lives_saved;