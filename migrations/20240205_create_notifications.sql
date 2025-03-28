-- Create notifications table
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    blood_group text not null,
    units integer not null,
    location text not null,
    distance text not null,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table public.notifications enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.notifications
    for select
    using (true);

create policy "Enable insert access for authenticated users" on public.notifications
    for insert
    with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on public.notifications
    for update
    using (auth.role() = 'authenticated');

-- Add sample notifications
insert into public.notifications (name, blood_group, units, location, distance)
values
    ('John Doe', 'A+', 2, 'Apollo Hospital, Chennai', '5.2km'),
    ('Jane Smith', 'O-', 1, 'Global Hospital, Chennai', '3.8km'),
    ('Robert Johnson', 'B+', 3, 'Fortis Hospital, Chennai', '7.1km');