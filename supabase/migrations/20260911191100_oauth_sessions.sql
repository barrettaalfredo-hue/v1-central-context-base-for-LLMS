create table if not exists private.oauth_sessions (
  access_token text primary key,
  refresh_token text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  supabase_access text not null,
  supabase_refresh text not null,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table private.oauth_sessions enable row level security;
alter table private.oauth_sessions force row level security;

create or replace function public.oauth_create_session(
  p_access text,
  p_refresh text,
  p_user_id uuid,
  p_supabase_access text,
  p_supabase_refresh text,
  p_access_expires timestamptz,
  p_refresh_expires timestamptz
) returns void
language plpgsql
security definer
set search_path = private, public
as $$
begin
  insert into private.oauth_sessions (
    access_token, refresh_token, user_id, supabase_access, supabase_refresh,
    access_expires_at, refresh_expires_at
  ) values (
    p_access, p_refresh, p_user_id, p_supabase_access, p_supabase_refresh,
    p_access_expires, p_refresh_expires
  );
end;
$$;

create or replace function public.oauth_get_session(p_access text)
returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  r private.oauth_sessions;
begin
  select * into r from private.oauth_sessions
  where access_token = p_access and access_expires_at > now();
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'user_id', r.user_id,
    'supabase_access', r.supabase_access,
    'supabase_refresh', r.supabase_refresh,
    'access_expires_at', r.access_expires_at
  );
end;
$$;

create or replace function public.oauth_rotate_session(
  p_refresh text,
  p_new_access text,
  p_new_refresh text,
  p_access_expires timestamptz,
  p_refresh_expires timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  r private.oauth_sessions;
begin
  select * into r from private.oauth_sessions
  where refresh_token = p_refresh and refresh_expires_at > now()
  for update;
  if not found then
    return null;
  end if;
  delete from private.oauth_sessions where refresh_token = p_refresh;
  insert into private.oauth_sessions (
    access_token, refresh_token, user_id, supabase_access, supabase_refresh,
    access_expires_at, refresh_expires_at
  ) values (
    p_new_access, p_new_refresh, r.user_id, r.supabase_access, r.supabase_refresh,
    p_access_expires, p_refresh_expires
  );
  return jsonb_build_object(
    'user_id', r.user_id,
    'supabase_access', r.supabase_access,
    'supabase_refresh', r.supabase_refresh
  );
end;
$$;

create or replace function public.oauth_update_supabase_tokens(
  p_access text,
  p_supabase_access text,
  p_supabase_refresh text
) returns void
language plpgsql
security definer
set search_path = private, public
as $$
begin
  update private.oauth_sessions
  set supabase_access = p_supabase_access, supabase_refresh = p_supabase_refresh
  where access_token = p_access;
end;
$$;

revoke all on function public.oauth_create_session(text, text, uuid, text, text, timestamptz, timestamptz) from public;
revoke all on function public.oauth_get_session(text) from public;
revoke all on function public.oauth_rotate_session(text, text, text, timestamptz, timestamptz) from public;
revoke all on function public.oauth_update_supabase_tokens(text, text, text) from public;

grant execute on function public.oauth_create_session(text, text, uuid, text, text, timestamptz, timestamptz) to anon, authenticated, service_role;
grant execute on function public.oauth_get_session(text) to anon, authenticated, service_role;
grant execute on function public.oauth_rotate_session(text, text, text, timestamptz, timestamptz) to anon, authenticated, service_role;
grant execute on function public.oauth_update_supabase_tokens(text, text, text) to anon, authenticated, service_role;
