-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone_number text,
  email text,
  blood_group text,
  location text,
  latitude double precision,
  longitude double precision,
  is_donor boolean default false,
  is_available boolean default true,
  last_donation_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone_number, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert profiles for existing users
insert into public.profiles (id, full_name, email, phone_number, avatar_url)
select 
  id,
  raw_user_meta_data->>'full_name' as full_name,
  email,
  raw_user_meta_data->>'phone_number' as phone_number,
  raw_user_meta_data->>'avatar_url' as avatar_url
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;