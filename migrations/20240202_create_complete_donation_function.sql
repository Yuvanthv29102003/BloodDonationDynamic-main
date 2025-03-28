-- Create function to handle donation completion
create or replace function complete_donation(booked_donor_id uuid, donor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    current_donation_count integer;
    last_donation_date timestamp with time zone;
    calculated_next_donation timestamp with time zone;
    v_donor_exists boolean;
begin
    -- Verify donor exists
    select exists(select 1 from donors where id = donor_id) into v_donor_exists;
    if not v_donor_exists then
        raise exception 'Donor with ID % does not exist', donor_id;
    end if;

    -- Create donation record first
    insert into donations (donor_id, booked_donor_id, donation_date)
    values (donor_id, booked_donor_id, now());

    -- Calculate next donation date (3 months from now)
    calculated_next_donation := now() + interval '3 months';

    -- Get current donation count
    select donation_count into current_donation_count
    from donor_statistics ds
    where ds.donor_id = $2;

    -- Update donor statistics with achievement tracking
    update donor_statistics ds
    set donation_count = COALESCE(current_donation_count, 0) + 1,
        lives_saved = COALESCE(ds.lives_saved, 0) + 1,
        points = COALESCE(ds.points, 0) + 200,
        rating = CASE
            WHEN COALESCE(current_donation_count, 0) + 1 >= 10 THEN 5.0
            WHEN COALESCE(current_donation_count, 0) + 1 >= 5 THEN 4.5
            WHEN COALESCE(current_donation_count, 0) + 1 >= 3 THEN 4.0
            ELSE 3.5
        END,
        updated_at = now(),
        last_donation_date = now(),
        next_donation_date = calculated_next_donation::timestamp with time zone
    where ds.donor_id = $2;

    -- If no statistics record exists, create one
    if not found then
        insert into donor_statistics (donor_id, donation_count, rating, lives_saved, points, last_donation_date, next_donation_date)
        values ($2, 1, 3.5, 1, 200, now(), calculated_next_donation::timestamp with time zone);
    end if;

    -- Update the booked donor record status
    update booked_donors bd
    set status = 'completed',
        completed_at = now()
    where bd.id = booked_donor_id;
end;
$$;

-- Create donations table if it doesn't exist
create table if not exists donations (
    id uuid primary key default uuid_generate_v4(),
    donor_id uuid references donors(id),
    booked_donor_id uuid references booked_donors(id) on delete set null,
    donation_date timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- Add completed_at column to booked_donors if it doesn't exist
alter table booked_donors
add column if not exists completed_at timestamp with time zone;