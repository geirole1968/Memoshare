-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- FAMILIES
create table families (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references profiles(id)
);

alter table families enable row level security;

-- FAMILY MEMBERS
create table family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'contributor', 'member')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(family_id, user_id)
);

alter table family_members enable row level security;

-- RLS for Families: Users can see families they are members of
create policy "Users can view families they belong to"
  on families for select
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = families.id
      and family_members.user_id = auth.uid()
    )
  );

create policy "Users can create families"
  on families for insert
  with check ( auth.uid() = created_by );

-- RLS for Family Members
create policy "Users can view members of their families"
  on family_members for select
  using (
    exists (
      select 1 from family_members as my_membership
      where my_membership.family_id = family_members.family_id
      and my_membership.user_id = auth.uid()
    )
  );

-- POSTS (Feed)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;

create policy "Users can view posts in their families"
  on posts for select
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = posts.family_id
      and family_members.user_id = auth.uid()
    )
  );

create policy "Users can create posts in their families"
  on posts for insert
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = posts.family_id
      and family_members.user_id = auth.uid()
    )
  );

-- COMMENTS
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Users can view comments on visible posts"
  on comments for select
  using (
    exists (
      select 1 from posts
      join family_members on family_members.family_id = posts.family_id
      where posts.id = comments.post_id
      and family_members.user_id = auth.uid()
    )
  );

create policy "Users can create comments on visible posts"
  on comments for insert
  with check (
    exists (
      select 1 from posts
      join family_members on family_members.family_id = posts.family_id
      where posts.id = comments.post_id
      and family_members.user_id = auth.uid()
    )
  );

-- CONVERSATIONS (Chat)
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  is_group boolean default false,
  name text, -- for group chats
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table conversations enable row level security;

create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

alter table conversation_participants enable row level security;

-- MESSAGES
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

-- RLS for Conversations
create policy "Users can view conversations they are part of"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = conversations.id
      and conversation_participants.user_id = auth.uid()
    )
  );

-- RLS for Messages
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "Users can send messages to their conversations"
  on messages for insert
  with check (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

-- STORAGE BUCKETS (Setup via SQL is limited, usually done via API/Dashboard, but we can try to insert if storage schema exists)
-- Note: Supabase Storage policies are usually set in the `storage.buckets` and `storage.objects` tables.
-- We will assume the bucket 'family-media' is created manually or via a separate script for now, 
-- but we can add policies for `storage.objects` here if we want to be thorough.

-- TRIGGER: Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
