-- Old preview builds still call oauth_rotate_session. Do not delete the
-- approved connector when that happens — keep the previous tokens and
-- also store the newly issued pair so either one still works.

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
  insert into private.oauth_sessions (
    access_token, refresh_token, user_id, supabase_access, supabase_refresh,
    access_expires_at, refresh_expires_at
  ) values (
    p_new_access, p_new_refresh, r.user_id, r.supabase_access, r.supabase_refresh,
    now() + interval '10 years', now() + interval '10 years'
  )
  on conflict do nothing;
  return jsonb_build_object(
    'user_id', r.user_id,
    'supabase_access', r.supabase_access,
    'supabase_refresh', r.supabase_refresh
  );
end;
$$;
