-- Fix RLS recursion V5 (The Dynamic Nuclear Option)
-- 1. Dynamically drop ALL policies on the relevant tables to ensure NOTHING remains.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('families', 'family_members', 'posts')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 2. Create V5 Secure Functions
create or replace function is_family_creator_v5(check_family_id uuid)
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

create or replace function get_my_family_ids_v5()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- 3. Re-apply Simplified Secure Policies (Families)
create policy "Users can view families"
  on families for select
  using (
    id in (select get_my_family_ids_v5())
    or
    created_by = auth.uid()
  );

create policy "Authenticated users can create families"
  on families for insert
  with check ( auth.role() = 'authenticated' );

-- 4. Re-apply Simplified Secure Policies (Family Members)
create policy "Users can view members"
  on family_members for select
  using (
    family_id in (select get_my_family_ids_v5())
  );

create policy "Users can insert members"
  on family_members for insert
  with check (
    -- SIMPLIFIED: Only allow creator to add members for now to avoid recursion in admin check
    is_family_creator_v5(family_id)
  );

create policy "Users can update members"
  on family_members for update
  using (
    family_id in (select get_my_family_ids_v5())
  );

create policy "Users can delete members"
  on family_members for delete
  using (
    family_id in (select get_my_family_ids_v5())
  );

-- 5. Re-apply Secure Policies (Posts)
create policy "Users can view posts"
  on posts for select
  using (
    family_id in (select get_my_family_ids_v5())
  );

create policy "Users can create posts"
  on posts for insert
  with check (
    family_id in (select get_my_family_ids_v5())
  );
