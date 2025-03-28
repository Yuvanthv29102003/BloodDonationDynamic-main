-- Add gender column to donors table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1
                   FROM information_schema.columns
                   WHERE table_name = 'donors'
                   AND column_name = 'gender') THEN
        ALTER TABLE donors
        ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other'));
    END IF;
END $$;

-- Update existing donors with gender based on name patterns
UPDATE donors
SET gender = CASE
    WHEN name ~* '(mrs|miss|ms|sister|smt|selvi|kumari|devi|bai|begum)\.' OR
         name ~* '(priya|lakshmi|devi|mary|fatima|sita|gita|radha|uma|rani|sri|latha|kavita|anita|sunita|meena|neha|pooja|ritu|sonia|divya|anjali|rekha|shanti|kiran|padma|usha|vani|asha|nisha|mala|leela|saroj|seema|veena|sheela|pushpa|rama|shalini|deepa|sudha|swati|mamta|geeta|sangeeta|savita|parvati|kamala|shobha|indira|chitra|vidya|padmini|lalita|kalpana|bharati|janaki|sarita|madhavi|aruna|jaya|vijaya|sharda|shakti|vimala|ratna|bhavani|gayatri|sushma|malati|vasanti|jamuna|kalyani|prema|hema|sumati|rupa|mohini|kamini|nalini|yamini|vani|tara|mira|uma|ganga|yamuna|saraswati|durga|kali|parvathi|sita|radha|rukmini|savitri|lakshmi)' THEN 'Female'
    ELSE 'Male'
END
WHERE gender IS NULL;

-- Make gender column not nullable if it isn't already
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'donors'
        AND column_name = 'gender'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE donors
        ALTER COLUMN gender SET NOT NULL;
    END IF;
END $$;