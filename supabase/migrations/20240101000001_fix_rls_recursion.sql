-- Fix for infinite recursion in RLS policies

-- 1. Create a secure function to get the current user's family IDs
-- This function runs as the database owner (SECURITY DEFINER), bypassing RLS
-- This prevents the infinite loop when policies try to query the table they are protecting
create or replace function get_user_family_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- 2. Update Family Members Policy to use the function
drop policy if exists "Users can view members of their families" on family_members;

create policy "Users can view members of their families"
  on family_members for select
  using (
    family_id in (select get_user_family_ids())
  );

-- 3. Update Families Policy for consistency (and performance)
drop policy if exists "Users can view families they belong to" on families;

create policy "Users can view families they belong to"
  on families for select
  using (
    id in (select get_user_family_ids())
  );

-- 4. Update Posts Policy to use the function (safer)
drop policy if exists "Users can view posts in their families" on posts;

create policy "Users can view posts in their families"
  on posts for select
  using (
    family_id in (select get_user_family_ids())
  );

drop policy if exists "Users can create posts in their families" on posts;

create policy "Users can create posts in their families"
  on posts for insert
  with check (
    family_id in (select get_user_family_ids())
  );
