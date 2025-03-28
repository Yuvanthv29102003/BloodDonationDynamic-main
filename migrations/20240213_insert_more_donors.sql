-- Insert more diverse donor records
INSERT INTO donors (id, name, blood_group, location, latitude, longitude, availability_status, last_donation_date)
VALUES
  ('d7f6e5d4-c3b2-41f0-9e8d-7c6b5a4f3e2d', 'Michael Johnson', 'A+', 'Boston, MA', 42.3601, -71.0589, 'available', NULL),
  ('e8f7a6b5-c4d3-42e1-8f9a-0b8c7d6e5f4e', 'Jennifer Lee', 'B-', 'Seattle, WA', 47.6062, -122.3321, 'available', NULL),
  ('f9a8b7c6-d5e4-43f2-91a0-2b3c4d5e6f7a', 'William Chen', 'O-', 'San Francisco, CA', 37.7749, -122.4194, 'available', NULL),
  ('a0b9c8d7-e6f5-44a3-b2c1-3d4e5f6a7b8c', 'Maria Garcia', 'AB+', 'Miami, FL', 25.7617, -80.1918, 'available', NULL),
  ('b1c2d3e4-f5a6-45b7-c8d9-4e5f6a7b8c9d', 'James Wilson', 'A-', 'Chicago, IL', 41.8781, -87.6298, 'available', NULL),
  ('c2d3e4f5-a6b7-46c8-d9e0-5f6a7b8c9d0e', 'Sofia Rodriguez', 'B+', 'Houston, TX', 29.7604, -95.3698, 'available', NULL),
  ('d3e4f5a6-b7c8-47d9-e0f1-6a7b8c9d0e1f', 'David Kim', 'O+', 'Los Angeles, CA', 34.0522, -118.2437, 'available', NULL),
  ('e4f5a6b7-c8d9-48e0-f1a2-7b8c9d0e1f2a', 'Emma Thompson', 'AB-', 'Denver, CO', 39.7392, -104.9903, 'available', NULL),
  ('f5a6b7c8-d9e0-49f1-a2b3-8c9d0e1f2a3b', 'Lucas Martinez', 'A+', 'Phoenix, AZ', 33.4484, -112.0740, 'available', NULL),
  ('a6b7c8d9-e0f1-4aa2-b3c4-9d0e1f2a3b4c', 'Olivia Brown', 'O+', 'Atlanta, GA', 33.7490, -84.3880, 'available', NULL);

-- Insert corresponding donor statistics
INSERT INTO donor_statistics (donor_id, donation_count, rating, lives_saved)
VALUES
  ('d7f6e5d4-c3b2-41f0-9e8d-7c6b5a4f3e2d', 5, 4.8, 15),
  ('e8f7a6b5-c4d3-42e1-8f9a-0b8c7d6e5f4e', 3, 4.5, 9),
  ('f9a8b7c6-d5e4-43f2-91a0-2b3c4d5e6f7a', 7, 4.9, 21),
  ('a0b9c8d7-e6f5-44a3-b2c1-3d4e5f6a7b8c', 4, 4.7, 12),
  ('b1c2d3e4-f5a6-45b7-c8d9-4e5f6a7b8c9d', 6, 4.6, 18),
  ('c2d3e4f5-a6b7-46c8-d9e0-5f6a7b8c9d0e', 2, 4.4, 6),
  ('d3e4f5a6-b7c8-47d9-e0f1-6a7b8c9d0e1f', 8, 5.0, 24),
  ('e4f5a6b7-c8d9-48e0-f1a2-7b8c9d0e1f2a', 3, 4.6, 9),
  ('f5a6b7c8-d9e0-49f1-a2b3-8c9d0e1f2a3b', 5, 4.7, 15),
  ('a6b7c8d9-e0f1-4aa2-b3c4-9d0e1f2a3b4c', 4, 4.8, 12);

-- Insert registration records for the new donors
INSERT INTO registrations (donor_id, full_name, email, age, phone, gender, location, blood_group, is_available, status)
VALUES
  ('d7f6e5d4-c3b2-41f0-9e8d-7c6b5a4f3e2d', 'Michael Johnson', 'michael.j@example.com', 28, '6175550123', 'Male', 'Boston, MA', 'A+', true, 'approved'),
  ('e8f7a6b5-c4d3-42e1-8f9a-0b8c7d6e5f4e', 'Jennifer Lee', 'jennifer.l@example.com', 32, '2065550123', 'Female', 'Seattle, WA', 'B-', true, 'approved'),
  ('f9a8b7c6-d5e4-43f2-91a0-2b3c4d5e6f7a', 'William Chen', 'william.c@example.com', 35, '4155550123', 'Male', 'San Francisco, CA', 'O-', true, 'approved'),
  ('a0b9c8d7-e6f5-44a3-b2c1-3d4e5f6a7b8c', 'Maria Garcia', 'maria.g@example.com', 29, '3055550123', 'Female', 'Miami, FL', 'AB+', true, 'approved'),
  ('b1c2d3e4-f5a6-45b7-c8d9-4e5f6a7b8c9d', 'James Wilson', 'james.w@example.com', 41, '3125550123', 'Male', 'Chicago, IL', 'A-', true, 'approved'),
  ('c2d3e4f5-a6b7-46c8-d9e0-5f6a7b8c9d0e', 'Sofia Rodriguez', 'sofia.r@example.com', 27, '7135550123', 'Female', 'Houston, TX', 'B+', true, 'approved'),
  ('d3e4f5a6-b7c8-47d9-e0f1-6a7b8c9d0e1f', 'David Kim', 'david.k@example.com', 33, '2135550123', 'Male', 'Los Angeles, CA', 'O+', true, 'approved'),
  ('e4f5a6b7-c8d9-48e0-f1a2-7b8c9d0e1f2a', 'Emma Thompson', 'emma.t@example.com', 30, '7205550123', 'Female', 'Denver, CO', 'AB-', true, 'approved'),
  ('f5a6b7c8-d9e0-49f1-a2b3-8c9d0e1f2a3b', 'Lucas Martinez', 'lucas.m@example.com', 36, '6025550123', 'Male', 'Phoenix, AZ', 'A+', true, 'approved'),
  ('a6b7c8d9-e0f1-4aa2-b3c4-9d0e1f2a3b4c', 'Olivia Brown', 'olivia.b@example.com', 31, '4045550123', 'Female', 'Atlanta, GA', 'O+', true, 'approved');