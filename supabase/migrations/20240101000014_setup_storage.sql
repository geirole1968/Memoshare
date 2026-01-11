-- Create the 'family-media' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('family-media', 'family-media', false)
on conflict (id) do nothing;

-- Enable RLS on objects
alter table storage.objects enable row level security;

-- Policy: Users can view objects in their family folders
-- We assume structure: {family_id}/{filename}
create policy "Users can view media in their families"
on storage.objects for select
using (
  bucket_id = 'family-media'
  and exists (
    select 1 from family_members
    where family_members.family_id::text = (storage.foldername(name))[1]
    and family_members.user_id = auth.uid()
  )
);

-- Policy: Users can upload media to their family folders
create policy "Users can upload media to their families"
on storage.objects for insert
with check (
  bucket_id = 'family-media'
  and exists (
    select 1 from family_members
    where family_members.family_id::text = (storage.foldername(name))[1]
    and family_members.user_id = auth.uid()
  )
);

-- Policy: Users can delete their own uploads
create policy "Users can delete their own uploads"
on storage.objects for delete
using (
  bucket_id = 'family-media'
  and owner = auth.uid()
);
