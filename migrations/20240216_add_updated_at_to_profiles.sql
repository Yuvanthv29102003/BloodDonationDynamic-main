-- Add updated_at column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Update existing rows to have current timestamp
UPDATE public.profiles
SET updated_at = TIMEZONE('utc'::text, NOW())
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after setting values
ALTER TABLE public.profiles
ALTER COLUMN updated_at SET NOT NULL;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Refresh the profiles table schema cache
COMMENT ON TABLE public.profiles IS 'User profile information with automatic timestamp updates';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last update timestamp, automatically managed';