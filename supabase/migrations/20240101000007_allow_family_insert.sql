-- Allow authenticated users to create new families
drop policy if exists "Authenticated users can create families" on families;
create policy "Authenticated users can create families"
  on families for insert
  with check ( auth.role() = 'authenticated' );
