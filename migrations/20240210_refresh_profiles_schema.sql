-- Refresh the profiles table schema cache
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last update timestamp';