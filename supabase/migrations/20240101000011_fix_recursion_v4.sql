-- Fix RLS recursion V4 (The Nuclear Option)
-- Explicitly drop ALL known policy names to ensure no conflicting/recursive policies remain.

-- 1. Drop ALL policies on 'families'
drop policy if exists "Users can view families they belong to" on families;
drop policy if exists "Creators can view their families" on families;
drop policy if exists "Authenticated users can create families" on families;
drop policy if exists "Users can view families" on families;
drop policy if exists "Users can create families" on families;

-- 2. Drop ALL policies on 'family_members'
drop policy if exists "Users can view members of their families" on family_members;
drop policy if exists "Creators can add members to their families" on family_members;
drop policy if exists "Users can manage members of their families" on family_members;
drop policy if exists "Users can view members" on family_members;
drop policy if exists "Users can insert members" on family_members;
drop policy if exists "Users can update members" on family_members;
drop policy if exists "Users can delete members" on family_members;

-- 3. Drop ALL policies on 'posts'
drop policy if exists "Users can view posts in their families" on posts;
drop policy if exists "Users can create posts in their families" on posts;
drop policy if exists "Users can view posts" on posts;
drop policy if exists "Users can create posts" on posts;

-- 4. Re-define Secure Functions (just to be safe)
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

create or replace function get_my_family_ids_v4()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- 5. Re-apply Secure Policies (Families)
create policy "Users can view families"
  on families for select
  using (
    id in (select get_my_family_ids_v4())
    or
    created_by = auth.uid()
  );

create policy "Authenticated users can create families"
  on families for insert
  with check ( auth.role() = 'authenticated' );

-- 6. Re-apply Secure Policies (Family Members)
create policy "Users can view members"
  on family_members for select
  using (
    family_id in (select get_my_family_ids_v4())
  );

create policy "Users can insert members"
  on family_members for insert
  with check (
    -- Secure check for family ownership
    is_family_creator(family_id)
    or
    -- Secure check for admin role
    (
      family_id in (select get_my_family_ids_v4())
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
    family_id in (select get_my_family_ids_v4())
  );

create policy "Users can delete members"
  on family_members for delete
  using (
    family_id in (select get_my_family_ids_v4())
  );

-- 7. Re-apply Secure Policies (Posts)
create policy "Users can view posts"
  on posts for select
  using (
    family_id in (select get_my_family_ids_v4())
  );

create policy "Users can create posts"
  on posts for insert
  with check (
    family_id in (select get_my_family_ids_v4())
  );
