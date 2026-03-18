-- Run this file in Supabase SQL Editor to create the tables required by this app.

create extension if not exists pgcrypto;

create table if not exists public.companions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  topic text not null,
  voice text not null,
  style text not null,
  duration integer not null check (duration > 0),
  author uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  companion_id uuid not null references public.companions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_user_companion_unique unique (user_id, companion_id)
);

create table if not exists public.session_history (
  id uuid primary key default gen_random_uuid(),
  companion_id uuid not null references public.companions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists companions_created_at_idx on public.companions(created_at desc);
create index if not exists companions_subject_idx on public.companions(subject);
create index if not exists companions_topic_idx on public.companions(topic);
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_companion_id_idx on public.bookmarks(companion_id);
create index if not exists session_history_user_id_idx on public.session_history(user_id);
create index if not exists session_history_created_at_idx on public.session_history(created_at desc);

alter table public.companions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.session_history enable row level security;

drop policy if exists companions_read_all on public.companions;
create policy companions_read_all
  on public.companions
  for select
  using (true);

drop policy if exists companions_insert_own on public.companions;
create policy companions_insert_own
  on public.companions
  for insert
  to authenticated
  with check (auth.uid() = author);

drop policy if exists companions_update_own on public.companions;
create policy companions_update_own
  on public.companions
  for update
  to authenticated
  using (auth.uid() = author)
  with check (auth.uid() = author);

drop policy if exists companions_delete_own on public.companions;
create policy companions_delete_own
  on public.companions
  for delete
  to authenticated
  using (auth.uid() = author);

drop policy if exists bookmarks_select_own on public.bookmarks;
create policy bookmarks_select_own
  on public.bookmarks
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists bookmarks_insert_own on public.bookmarks;
create policy bookmarks_insert_own
  on public.bookmarks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists bookmarks_delete_own on public.bookmarks;
create policy bookmarks_delete_own
  on public.bookmarks
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists session_history_select_own on public.session_history;
create policy session_history_select_own
  on public.session_history
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists session_history_insert_own on public.session_history;
create policy session_history_insert_own
  on public.session_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists session_history_delete_own on public.session_history;
create policy session_history_delete_own
  on public.session_history
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Refresh Supabase API schema cache so new tables are immediately visible.
notify pgrst, 'reload schema';
