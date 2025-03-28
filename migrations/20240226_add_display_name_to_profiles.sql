-- Add display_name column to profiles table
alter table public.profiles
add column display_name text;

-- Update existing profiles to set display_name same as full_name
update public.profiles
set display_name = full_name
where display_name is null;