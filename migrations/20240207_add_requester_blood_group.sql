-- Add requester_blood_group column to notifications table
alter table public.notifications
add column if not exists requester_blood_group text;

-- Update existing records to match blood_group
update public.notifications
set requester_blood_group = blood_group
where requester_blood_group is null;