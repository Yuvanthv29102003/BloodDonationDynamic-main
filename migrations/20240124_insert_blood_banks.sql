-- Insert sample blood banks
INSERT INTO blood_banks (id, name, location, address, latitude, longitude, contact, operating_hours, is_open)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'City Blood Bank', 'Bangalore', '#123, MG Road, Bangalore - 560001', 12.9716, 77.5946, '+91 9876543210', '24/7', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Central Blood Center', 'Bangalore', '45/1, Residency Road, Bangalore - 560025', 12.9782, 77.6408, '+91 9876543211', '8:00 AM - 8:00 PM', true),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Life Care Blood Bank', 'Bangalore', '78, Brigade Road, Bangalore - 560001', 12.9342, 77.6092, '+91 9876543212', '24/7', true);

-- Insert sample blood inventory
INSERT INTO blood_inventory (blood_bank_id, blood_group, units)
VALUES
    -- City Blood Bank inventory
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'O+', 50),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'O-', 20),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'A+', 45),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'A-', 15),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'B+', 40),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'B-', 18),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AB+', 25),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AB-', 12),
    
    -- Central Blood Center inventory
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'O+', 35),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'O-', 15),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'A+', 30),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'A-', 12),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'B+', 28),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'B-', 14),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AB+', 20),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AB-', 10),
    
    -- Life Care Blood Bank inventory
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'O+', 42),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'O-', 18),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'A+', 38),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'A-', 16),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'B+', 35),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'B-', 15),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'AB+', 22),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'AB-', 11);