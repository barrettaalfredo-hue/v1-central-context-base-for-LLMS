-- MCP opaque tokens must keep working after the user reconnects.
-- Do not reject them on a clock, and do not depend on a live Supabase JWT.

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
    timestamptz '9999-12-31 00:00:00+00',
    timestamptz '9999-12-31 00:00:00+00'
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
    access_expires_at = timestamptz '9999-12-31 00:00:00+00',
    refresh_expires_at = timestamptz '9999-12-31 00:00:00+00'
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

create or replace function public.mcp_session_owner(p_access text)
returns uuid
language plpgsql
security definer
set search_path = private, public
as $$
declare
  uid uuid;
begin
  select user_id into uid from private.oauth_sessions where access_token = p_access;
  return uid;
end;
$$;

create or replace function public.mcp_insert_memory(
  p_access text,
  p_project text,
  p_category text,
  p_title text,
  p_content text
) returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  uid uuid;
  row public.memories;
begin
  uid := public.mcp_session_owner(p_access);
  if uid is null then
    return null;
  end if;
  begin
    insert into public.memories (user_id, project, category, title, content)
    values (uid, p_project, p_category, p_title, p_content)
    returning * into row;
  exception
    when unique_violation then
      return jsonb_build_object('kind', 'duplicate');
  end;
  return jsonb_build_object(
    'kind', 'created',
    'row', jsonb_build_object(
      'id', row.id,
      'project', row.project,
      'category', row.category,
      'title', row.title,
      'content', row.content,
      'created_at', row.created_at,
      'updated_at', row.updated_at
    )
  );
end;
$$;

create or replace function public.mcp_find_identical_memory(
  p_access text,
  p_project text,
  p_category text,
  p_title text,
  p_content text
) returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  uid uuid;
  row public.memories;
begin
  uid := public.mcp_session_owner(p_access);
  if uid is null then
    return null;
  end if;
  select * into row
  from public.memories
  where user_id = uid
    and project = p_project
    and category = p_category
    and title = p_title
    and content = p_content
  limit 1;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'id', row.id,
    'project', row.project,
    'category', row.category,
    'title', row.title,
    'content', row.content,
    'created_at', row.created_at,
    'updated_at', row.updated_at
  );
end;
$$;

create or replace function public.mcp_update_memory(
  p_access text,
  p_id uuid,
  p_project text,
  p_category text,
  p_title text,
  p_content text
) returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  uid uuid;
  row public.memories;
begin
  uid := public.mcp_session_owner(p_access);
  if uid is null then
    return null;
  end if;
  update public.memories
  set project = p_project, category = p_category, title = p_title, content = p_content
  where id = p_id and user_id = uid
  returning * into row;
  if not found then
    return jsonb_build_object('kind', 'missing');
  end if;
  return jsonb_build_object(
    'kind', 'updated',
    'row', jsonb_build_object(
      'id', row.id,
      'project', row.project,
      'category', row.category,
      'title', row.title,
      'content', row.content,
      'created_at', row.created_at,
      'updated_at', row.updated_at
    )
  );
end;
$$;

create or replace function public.mcp_list_memories(p_access text)
returns jsonb
language plpgsql
security definer
set search_path = private, public
as $$
declare
  uid uuid;
begin
  uid := public.mcp_session_owner(p_access);
  if uid is null then
    return null;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', m.id,
      'project', m.project,
      'category', m.category,
      'title', m.title,
      'content', m.content,
      'created_at', m.created_at,
      'updated_at', m.updated_at
    ) order by m.updated_at desc, m.id)
    from public.memories m
    where m.user_id = uid
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.mcp_session_owner(text) from public;
revoke all on function public.mcp_insert_memory(text, text, text, text, text) from public;
revoke all on function public.mcp_find_identical_memory(text, text, text, text, text) from public;
revoke all on function public.mcp_update_memory(text, uuid, text, text, text, text) from public;
revoke all on function public.mcp_list_memories(text) from public;

grant execute on function public.oauth_create_session(text, text, uuid, text, text, timestamptz, timestamptz) to anon, authenticated, service_role;
grant execute on function public.oauth_reuse_session(text) to anon, authenticated, service_role;
grant execute on function public.mcp_session_owner(text) to anon, authenticated, service_role;
grant execute on function public.mcp_insert_memory(text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.mcp_find_identical_memory(text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.mcp_update_memory(text, uuid, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.mcp_list_memories(text) to anon, authenticated, service_role;

update private.oauth_sessions
set
  access_expires_at = timestamptz '9999-12-31 00:00:00+00',
  refresh_expires_at = timestamptz '9999-12-31 00:00:00+00';
