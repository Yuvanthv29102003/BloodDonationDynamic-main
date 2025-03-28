-- Insert additional blood banks
INSERT INTO blood_banks (id, name, location, address, latitude, longitude, contact, operating_hours, is_open)
VALUES
    (uuid_generate_v4(), 'VHS - Adyar', 'Chennai', '1st Main Road, Tharamani, Chennai - 600113', 13.1067, 80.2206, '+91 9876543213', '24/7', true),
    (uuid_generate_v4(), 'Kumaran (Blood Bank)', 'Chennai', '45, Kolathur Main Road, Chennai - 600099', 13.1067, 80.2206, '+91 9876543214', '8:00 AM - 8:00 PM', true),
    (uuid_generate_v4(), 'Annai Teresa', 'Chennai', '123, Anna Nagar East, Chennai - 600102', 13.1067, 80.2206, '+91 9876543215', '24/7', true),
    (uuid_generate_v4(), 'Sri Venkateshwaraa', 'Chennai', '78, Perambur High Road, Chennai - 600012', 13.1067, 80.2206, '+91 9876543216', '8:00 AM - 8:00 PM', true);

-- Get the IDs of newly inserted blood banks
DO $$
DECLARE
    vhs_id UUID;
    kumaran_id UUID;
    annai_id UUID;
    sri_id UUID;
BEGIN
    SELECT id INTO vhs_id FROM blood_banks WHERE name = 'VHS - Adyar' LIMIT 1;
    SELECT id INTO kumaran_id FROM blood_banks WHERE name = 'Kumaran (Blood Bank)' LIMIT 1;
    SELECT id INTO annai_id FROM blood_banks WHERE name = 'Annai Teresa' LIMIT 1;
    SELECT id INTO sri_id FROM blood_banks WHERE name = 'Sri Venkateshwaraa' LIMIT 1;

    -- Insert blood inventory for VHS - Adyar
    INSERT INTO blood_inventory (blood_bank_id, blood_group, units)
    VALUES
        (vhs_id, 'O+', 40),
        (vhs_id, 'O-', 15),
        (vhs_id, 'A+', 35),
        (vhs_id, 'A-', 12),
        (vhs_id, 'B+', 30),
        (vhs_id, 'B-', 14),
        (vhs_id, 'AB+', 20),
        (vhs_id, 'AB-', 10);

    -- Insert blood inventory for Kumaran Blood Bank
    INSERT INTO blood_inventory (blood_bank_id, blood_group, units)
    VALUES
        (kumaran_id, 'O+', 45),
        (kumaran_id, 'O-', 18),
        (kumaran_id, 'A+', 38),
        (kumaran_id, 'A-', 14),
        (kumaran_id, 'B+', 32),
        (kumaran_id, 'B-', 15),
        (kumaran_id, 'AB+', 22),
        (kumaran_id, 'AB-', 11);

    -- Insert blood inventory for Annai Teresa
    INSERT INTO blood_inventory (blood_bank_id, blood_group, units)
    VALUES
        (annai_id, 'O+', 38),
        (annai_id, 'O-', 16),
        (annai_id, 'A+', 32),
        (annai_id, 'A-', 13),
        (annai_id, 'B+', 28),
        (annai_id, 'B-', 12),
        (annai_id, 'AB+', 18),
        (annai_id, 'AB-', 9);

    -- Insert blood inventory for Sri Venkateshwaraa
    INSERT INTO blood_inventory (blood_bank_id, blood_group, units)
    VALUES
        (sri_id, 'O+', 42),
        (sri_id, 'O-', 17),
        (sri_id, 'A+', 36),
        (sri_id, 'A-', 15),
        (sri_id, 'B+', 31),
        (sri_id, 'B-', 13),
        (sri_id, 'AB+', 21),
        (sri_id, 'AB-', 10);
END $$;