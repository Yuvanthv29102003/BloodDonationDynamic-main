-- Create completed_donations table
CREATE TABLE IF NOT EXISTS completed_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
    booked_donor_id UUID REFERENCES booked_donors(id),
    donation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blood_group TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create donor_achievements table for tracking achievements
CREATE TABLE IF NOT EXISTS donor_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
    total_donations INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    lives_saved INTEGER DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0.0,
    last_donation_date TIMESTAMP WITH TIME ZONE,
    next_donation_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_total_donations CHECK (total_donations >= 0),
    CONSTRAINT valid_points CHECK (points >= 0),
    CONSTRAINT valid_lives_saved CHECK (lives_saved >= 0),
    CONSTRAINT valid_rating CHECK (rating >= 0.0 AND rating <= 5.0),
    CONSTRAINT donor_achievements_donor_id_unique UNIQUE (donor_id)
);

-- Create function to update achievements on donation completion
CREATE OR REPLACE FUNCTION update_donor_achievements()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update donor achievements
    INSERT INTO donor_achievements (
        donor_id,
        total_donations,
        points,
        lives_saved,
        rating,
        last_donation_date,
        next_donation_date
    )
    VALUES (
        NEW.donor_id,
        1, -- First donation
        200, -- Initial points
        1, -- First life saved
        3.5, -- Initial rating
        NEW.donation_date,
        NEW.donation_date + interval '3 months'
    )
    ON CONFLICT ON CONSTRAINT donor_achievements_donor_id_unique DO UPDATE
    SET
        total_donations = donor_achievements.total_donations + 1,
        points = donor_achievements.points + 200,
        lives_saved = donor_achievements.lives_saved + 1,
        rating = CASE
            WHEN donor_achievements.total_donations + 1 >= 10 THEN 5.0
            WHEN donor_achievements.total_donations + 1 >= 5 THEN 4.5
            WHEN donor_achievements.total_donations + 1 >= 3 THEN 4.0
            ELSE 3.5
        END,
        last_donation_date = NEW.donation_date,
        next_donation_date = NEW.donation_date + interval '3 months',
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating achievements
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_achievements_on_donation'
    ) THEN
        CREATE TRIGGER update_achievements_on_donation
            AFTER INSERT ON completed_donations
            FOR EACH ROW
            EXECUTE FUNCTION update_donor_achievements();
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_completed_donations_donor_id ON completed_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_achievements_donor_id ON donor_achievements(donor_id);

-- Add RLS policies
ALTER TABLE completed_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for completed_donations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'completed_donations' AND policyname = 'Users can view their own completed donations'
    ) THEN
        CREATE POLICY "Users can view their own completed donations"
            ON completed_donations FOR SELECT
            USING (donor_id = auth.uid());
    END IF;
END $$;

-- RLS policies for donor_achievements
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'donor_achievements' AND policyname = 'Users can view their own achievements'
    ) THEN
        CREATE POLICY "Users can view their own achievements"
            ON donor_achievements FOR SELECT
            USING (donor_id = auth.uid());
    END IF;
END $$;

-- Create function to handle donation completion
CREATE OR REPLACE FUNCTION complete_donation_v2(booked_donor_id uuid, donor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_blood_group text;
    v_location text;
BEGIN
    -- Get donor details
    SELECT blood_group, location INTO v_blood_group, v_location
    FROM donors
    WHERE id = donor_id;

    -- Create completed donation record
    INSERT INTO completed_donations (
        donor_id,
        booked_donor_id,
        blood_group,
        location
    ) VALUES (
        donor_id,
        booked_donor_id,
        v_blood_group,
        v_location
    );

    -- Update booked donor status
    UPDATE booked_donors
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = booked_donor_id;
END;
$$; 