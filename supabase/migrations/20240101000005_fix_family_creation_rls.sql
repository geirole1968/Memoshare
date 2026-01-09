-- Allow family creators to add members (including themselves)
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
