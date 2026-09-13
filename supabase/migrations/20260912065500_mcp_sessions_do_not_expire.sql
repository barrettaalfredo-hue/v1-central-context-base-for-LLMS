-- Keep an approved Claude connector until the user removes it.
-- Access tokens are no longer rejected just because a clock ran out.
-- Refresh reuses the same tokens instead of rotating them away.

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
  where access_token = p_access;
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

create or replace function public.oauth_reuse_session(p_refresh text)
returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  r private.oauth_sessions;
begin
  select * into r from private.oauth_sessions
  where refresh_token = p_refresh
  for update;
  if not found then
    return null;
  end if;
  update private.oauth_sessions
  set
    access_expires_at = now() + interval '10 years',
    refresh_expires_at = now() + interval '10 years'
  where refresh_token = p_refresh;
  return jsonb_build_object(
    'user_id', r.user_id,
    'access_token', r.access_token,
    'refresh_token', r.refresh_token,
    'supabase_access', r.supabase_access,
    'supabase_refresh', r.supabase_refresh
  );
end;
$$;

create or replace function public.oauth_update_supabase_tokens_for_user(
  p_user_id uuid,
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
  where user_id = p_user_id;
end;
$$;

revoke all on function public.oauth_reuse_session(text) from public;
revoke all on function public.oauth_update_supabase_tokens_for_user(uuid, text, text) from public;

grant execute on function public.oauth_get_session(text) to anon, authenticated, service_role;
grant execute on function public.oauth_reuse_session(text) to anon, authenticated, service_role;
grant execute on function public.oauth_update_supabase_tokens_for_user(uuid, text, text) to anon, authenticated, service_role;

update private.oauth_sessions
set
  access_expires_at = now() + interval '10 years',
  refresh_expires_at = now() + interval '10 years';
