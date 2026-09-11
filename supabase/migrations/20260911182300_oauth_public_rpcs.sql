create or replace function public.oauth_register_client(p_redirect_uris text[])
returns text
language plpgsql
security definer
set search_path = private, public
as $$
declare
  new_id text := gen_random_uuid()::text;
begin
  if p_redirect_uris is null or coalesce(array_length(p_redirect_uris, 1), 0) = 0 then
    raise exception 'redirect_uris required';
  end if;
  insert into private.oauth_clients (client_id, redirect_uris, token_endpoint_auth_method)
  values (new_id, p_redirect_uris, 'none');
  return new_id;
end;
$$;

create or replace function public.oauth_get_client(p_client_id text)
returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  row private.oauth_clients;
begin
  select * into row from private.oauth_clients where client_id = p_client_id;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'client_id', row.client_id,
    'redirect_uris', to_jsonb(row.redirect_uris)
  );
end;
$$;

create or replace function public.oauth_save_code(
  p_code text,
  p_client_id text,
  p_redirect_uri text,
  p_code_challenge text,
  p_access_token text,
  p_refresh_token text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = private, public
as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not allowed';
  end if;
  insert into private.oauth_codes (
    code, client_id, redirect_uri, code_challenge, access_token, refresh_token, user_id, expires_at
  ) values (
    p_code, p_client_id, p_redirect_uri, p_code_challenge, p_access_token, p_refresh_token, p_user_id,
    now() + interval '10 minutes'
  );
end;
$$;

create or replace function public.oauth_consume_code(p_code text)
returns table (
  code text,
  client_id text,
  redirect_uri text,
  code_challenge text,
  access_token text,
  refresh_token text,
  user_id uuid,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = private, public
as $$
begin
  return query
  delete from private.oauth_codes as c
  where c.code = p_code
  returning c.code, c.client_id, c.redirect_uri, c.code_challenge, c.access_token, c.refresh_token, c.user_id, c.expires_at;
end;
$$;

revoke all on function public.oauth_register_client(text[]) from public;
revoke all on function public.oauth_get_client(text) from public;
revoke all on function public.oauth_save_code(text, text, text, text, text, text, uuid) from public;
revoke all on function public.oauth_consume_code(text) from public;

grant execute on function public.oauth_register_client(text[]) to anon, authenticated, service_role;
grant execute on function public.oauth_get_client(text) to anon, authenticated, service_role;
grant execute on function public.oauth_save_code(text, text, text, text, text, text, uuid) to authenticated, service_role;
grant execute on function public.oauth_consume_code(text) to anon, authenticated, service_role;
