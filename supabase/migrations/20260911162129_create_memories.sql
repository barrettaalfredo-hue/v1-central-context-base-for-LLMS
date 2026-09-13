create schema if not exists private;

revoke all on schema private from public;

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project text not null,
  category text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_category_check
    check (category in ('fact', 'decision', 'goal', 'deadline', 'preference'))
);

comment on table public.memories is 'Private per-user memories. Owner is user_id from login, never from the client.';

create unique index memories_identical_duplicate_idx
  on public.memories (user_id, project, category, title, md5(content));

create index memories_user_updated_at_idx
  on public.memories (user_id, updated_at desc);

create index memories_user_project_category_idx
  on public.memories (user_id, project, category);

create or replace function private.set_memory_defaults()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.user_id := auth.uid();
  end if;

  new.updated_at := now();

  if tg_op = 'INSERT' then
    if new.created_at is null then
      new.created_at := now();
    end if;
  else
    new.id := old.id;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

revoke all on function private.set_memory_defaults() from public;
grant execute on function private.set_memory_defaults() to authenticated;

create trigger memories_set_defaults
  before insert or update on public.memories
  for each row
  execute function private.set_memory_defaults();

alter table public.memories enable row level security;
alter table public.memories force row level security;

create policy memories_select_own
  on public.memories
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy memories_insert_own
  on public.memories
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy memories_update_own
  on public.memories
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on table public.memories from public, anon;
grant select, insert, update on table public.memories to authenticated;
