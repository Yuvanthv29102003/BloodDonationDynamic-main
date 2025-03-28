-- Create blood_banks table
CREATE TABLE IF NOT EXISTS blood_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact TEXT NOT NULL,
    operating_hours TEXT NOT NULL,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blood_inventory table to track blood units
CREATE TABLE IF NOT EXISTS blood_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_bank_id UUID REFERENCES blood_banks(id) ON DELETE CASCADE,
    blood_group TEXT NOT NULL,
    units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_blood_group CHECK (blood_group IN ('O+', 'O-', 'B+', 'B-', 'A+', 'A-', 'AB+', 'AB-')),
    CONSTRAINT positive_units CHECK (units >= 0)
);

-- Create trigger for blood_banks updated_at
DROP TRIGGER IF EXISTS update_blood_banks_updated_at ON blood_banks;
CREATE TRIGGER update_blood_banks_updated_at
    BEFORE UPDATE ON blood_banks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for blood_inventory updated_at
DROP TRIGGER IF EXISTS update_blood_inventory_updated_at ON blood_inventory;
CREATE TRIGGER update_blood_inventory_updated_at
    BEFORE UPDATE ON blood_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_blood_banks_location ON blood_banks USING gist (
    ll_to_earth(latitude, longitude)
);

CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_group ON blood_inventory(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_bank ON blood_inventory(blood_bank_id);