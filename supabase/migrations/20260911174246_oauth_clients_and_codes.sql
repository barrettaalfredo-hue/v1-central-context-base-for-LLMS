create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table if not exists private.oauth_clients (
  client_id text primary key,
  redirect_uris text[] not null,
  token_endpoint_auth_method text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists private.oauth_codes (
  code text primary key,
  client_id text not null,
  redirect_uri text not null,
  code_challenge text not null,
  access_token text not null,
  refresh_token text,
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null
);

create index if not exists oauth_codes_expires_at_idx
  on private.oauth_codes (expires_at);

alter table private.oauth_clients enable row level security;
alter table private.oauth_clients force row level security;
alter table private.oauth_codes enable row level security;
alter table private.oauth_codes force row level security;
