-- Final fix for RLS recursion
-- This migration ensures we have a clean slate for the critical policies

-- 1. Re-create the security definer function
create or replace function get_user_family_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- 2. Fix Families Policies
drop policy if exists "Users can view families they belong to" on families;
create policy "Users can view families they belong to"
  on families for select
  using (
    id in (select get_user_family_ids())
  );

-- Ensure creators can always view their families (vital for the first insert)
drop policy if exists "Creators can view their families" on families;
create policy "Creators can view their families"
  on families for select
  using ( created_by = auth.uid() );

-- 3. Fix Family Members Policies
drop policy if exists "Users can view members of their families" on family_members;
create policy "Users can view members of their families"
  on family_members for select
  using (
    family_id in (select get_user_family_ids())
  );

-- Ensure creators can add the first member (themselves)
drop policy if exists "Creators can add members to their families" on family_members;
create policy "Creators can add members to their families"
  on family_members for insert
  with check (
    exists (
      select 1 from families
      where families.id = family_members.family_id
      and families.created_by = auth.uid()
    )
  );

-- 4. Fix Posts Policies (just in case)
drop policy if exists "Users can view posts in their families" on posts;
create policy "Users can view posts in their families"
  on posts for select
  using (
    family_id in (select get_user_family_ids())
  );
