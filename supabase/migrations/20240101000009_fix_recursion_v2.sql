-- Fix RLS recursion V2
-- Using a new function name to ensure no caching/update issues
-- Aggressively dropping policies to ensure clean state

-- 1. Create a NEW secure function (V2)
create or replace function get_my_family_ids_v2()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- 2. Reset Families Policies
drop policy if exists "Users can view families they belong to" on families;
drop policy if exists "Creators can view their families" on families;
drop policy if exists "Authenticated users can create families" on families;
drop policy if exists "Users can create families" on families;

create policy "Users can view families"
  on families for select
  using (
    id in (select get_my_family_ids_v2())
    or
    created_by = auth.uid()
  );

create policy "Authenticated users can create families"
  on families for insert
  with check ( auth.role() = 'authenticated' );

-- 3. Reset Family Members Policies
drop policy if exists "Users can view members of their families" on family_members;
drop policy if exists "Creators can add members to their families" on family_members;
drop policy if exists "Users can manage members of their families" on family_members;

create policy "Users can view members"
  on family_members for select
  using (
    family_id in (select get_my_family_ids_v2())
  );

create policy "Users can insert members"
  on family_members for insert
  with check (
    -- User is the creator of the family
    exists (
      select 1 from families
      where families.id = family_members.family_id
      and families.created_by = auth.uid()
    )
    or
    -- OR user is already an admin of the family (using the secure function to check membership)
    (
      family_id in (select get_my_family_ids_v2())
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
    family_id in (select get_my_family_ids_v2())
  );

create policy "Users can delete members"
  on family_members for delete
  using (
    family_id in (select get_my_family_ids_v2())
  );

-- 4. Reset Posts Policies
drop policy if exists "Users can view posts in their families" on posts;
drop policy if exists "Users can create posts in their families" on posts;

create policy "Users can view posts"
  on posts for select
  using (
    family_id in (select get_my_family_ids_v2())
  );

create policy "Users can create posts"
  on posts for insert
  with check (
    family_id in (select get_my_family_ids_v2())
  );
