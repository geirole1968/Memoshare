-- RELATIONSHIPS
create table if not exists relationships (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references families(id) on delete cascade not null,
  from_id uuid references family_members(id) on delete cascade not null,
  to_id uuid references family_members(id) on delete cascade not null,
  type text check (type in ('parent', 'child', 'spouse', 'sibling')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table relationships enable row level security;

-- RLS for Relationships
drop policy if exists "Users can view relationships in their families" on relationships;
create policy "Users can view relationships in their families"
  on relationships for select
  using (
    family_id in (select get_user_family_ids())
  );

drop policy if exists "Users can manage relationships in their families" on relationships;
create policy "Users can manage relationships in their families"
  on relationships for all
  using (
    family_id in (select get_user_family_ids())
  )
  with check (
    family_id in (select get_user_family_ids())
  );
