-- Create donor_statistics table
CREATE TABLE IF NOT EXISTS donor_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
    donation_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0.0,
    lives_saved INTEGER NOT NULL DEFAULT 0,
    last_donation_date TIMESTAMP WITH TIME ZONE,
    next_donation_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_rating CHECK (rating >= 0.0 AND rating <= 5.0),
    CONSTRAINT valid_donation_count CHECK (donation_count >= 0),
    CONSTRAINT valid_lives_saved CHECK (lives_saved >= 0)
);

-- Create blood_bank_statistics table
CREATE TABLE IF NOT EXISTS blood_bank_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_bank_id UUID REFERENCES blood_banks(id) ON DELETE CASCADE,
    donation_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0.0,
    lives_saved INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_bank_rating CHECK (rating >= 0 AND rating <= 5.00),
    CONSTRAINT valid_bank_donation_count CHECK (donation_count >= 0),
    CONSTRAINT valid_bank_lives_saved CHECK (lives_saved >= 0)
);

-- Create indexes for efficient querying
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_donor_statistics_donor_id'
    ) THEN
        CREATE INDEX idx_donor_statistics_donor_id ON donor_statistics(donor_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_blood_bank_statistics_blood_bank_id'
    ) THEN
        CREATE INDEX idx_blood_bank_statistics_blood_bank_id ON blood_bank_statistics(blood_bank_id);
    END IF;
END
$$;

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatically updating updated_at
DROP TRIGGER IF EXISTS update_donor_statistics_updated_at ON donor_statistics;
CREATE TRIGGER update_donor_statistics_updated_at
    BEFORE UPDATE ON donor_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_statistics_updated_at();

DROP TRIGGER IF EXISTS update_blood_bank_statistics_updated_at ON blood_bank_statistics;
CREATE TRIGGER update_blood_bank_statistics_updated_at
    BEFORE UPDATE ON blood_bank_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_statistics_updated_at();