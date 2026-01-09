-- Allow family creators to view their own families (even if not yet a member)
drop policy if exists "Creators can view their families" on families;
create policy "Creators can view their families"
  on families for select
  using ( created_by = auth.uid() );
