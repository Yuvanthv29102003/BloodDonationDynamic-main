-- Create reports table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  type text not null check (type in ('technical', 'user', 'other')),
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reports enable row level security;

-- Create policies
create policy "Users can view their own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can create reports"
  on reports for insert
  with check (auth.role() = 'authenticated');

-- Create updated_at trigger
create trigger handle_updated_at before update on reports
  for each row execute function update_updated_at_column();