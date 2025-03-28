-- Add trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger on profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Refresh the profiles table schema cache
COMMENT ON TABLE public.profiles IS 'User profile information with automatic timestamp updates';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last update timestamp, automatically managed';