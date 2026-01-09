-- Fix RLS recursion V3
-- The issue is that querying 'families' directly in the policy triggers 'families' RLS, which checks 'family_members', causing a loop.
-- Solution: Use a SECURITY DEFINER function to check family ownership, bypassing RLS on 'families'.

-- 1. Create a secure function to check if user is creator
create or replace function is_family_creator(check_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from families
    where id = check_family_id
    and created_by = auth.uid()
  );
$$;

-- 2. Create a secure function to get my family IDs (for select policies)
create or replace function get_my_family_ids_v3()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- 3. Reset Families Policies
drop policy if exists "Users can view families" on families;
drop policy if exists "Authenticated users can create families" on families;

create policy "Users can view families"
  on families for select
  using (
    -- Use the secure function to avoid direct recursion if possible, 
    -- though for 'families' it's usually 'family_members' that causes issues.
    id in (select get_my_family_ids_v3())
    or
    created_by = auth.uid()
  );

create policy "Authenticated users can create families"
  on families for insert
  with check ( auth.role() = 'authenticated' );

-- 4. Reset Family Members Policies
drop policy if exists "Users can view members" on family_members;
drop policy if exists "Users can insert members" on family_members;
drop policy if exists "Users can update members" on family_members;
drop policy if exists "Users can delete members" on family_members;

create policy "Users can view members"
  on family_members for select
  using (
    family_id in (select get_my_family_ids_v3())
  );

create policy "Users can insert members"
  on family_members for insert
  with check (
    -- USE THE SECURE FUNCTION instead of direct table query
    is_family_creator(family_id)
    or
    -- Allow admins to add members (also using secure function for membership check)
    (
      family_id in (select get_my_family_ids_v3())
      and
      exists (
        select 1 from family_members as my_membership
        where my_membership.family_id = family_members.family_id
        and my_membership.user_id = auth.uid()
        and my_membership.role = 'admin'
      )
    )
  );

create policy "Users can update members"
  on family_members for update
  using (
    family_id in (select get_my_family_ids_v3())
  );

create policy "Users can delete members"
  on family_members for delete
  using (
    family_id in (select get_my_family_ids_v3())
  );

-- 5. Reset Posts Policies
drop policy if exists "Users can view posts" on posts;
drop policy if exists "Users can create posts" on posts;

create policy "Users can view posts"
  on posts for select
  using (
    family_id in (select get_my_family_ids_v3())
  );

create policy "Users can create posts"
  on posts for insert
  with check (
    family_id in (select get_my_family_ids_v3())
  );
