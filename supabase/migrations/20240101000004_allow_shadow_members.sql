-- Allow null user_id for shadow members
alter table family_members alter column user_id drop not null;

-- Add personal details columns to family_members
alter table family_members add column first_name text;
alter table family_members add column last_name text;
alter table family_members add column middle_name text;
alter table family_members add column birth_date date;
alter table family_members add column death_date date;
alter table family_members add column birth_place text;
alter table family_members add column gender text check (gender in ('male', 'female', 'other'));
alter table family_members add column avatar_url text;
alter table family_members add column address text;
alter table family_members add column city text;
alter table family_members add column zip_code text;
alter table family_members add column email text;
alter table family_members add column phone text;
alter table family_members add column title text;
alter table family_members add column is_deceased boolean default false;

-- Add RLS policy for managing family members (Insert/Update/Delete)
create policy "Users can manage members of their families"
  on family_members for all
  using (
    exists (
      select 1 from family_members as my_membership
      where my_membership.family_id = family_members.family_id
      and my_membership.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from family_members as my_membership
      where my_membership.family_id = family_members.family_id
      and my_membership.user_id = auth.uid()
    )
  );
