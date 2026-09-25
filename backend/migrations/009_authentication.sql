create unique index users_email_normalized_unique on app.users(lower(trim(email)));

create table app.user_credentials (
  user_id uuid primary key references app.users(id) on delete cascade,
  password_hash text not null,
  algorithm text not null default 'argon2id' check (algorithm='argon2id'),
  failed_attempts integer not null default 0 check (failed_attempts>=0),
  locked_until timestamptz,
  password_changed_at timestamptz not null default clock_timestamp(),
  must_change_password boolean not null default false,
  auth_version bigint not null default 1,
  updated_at timestamptz not null default clock_timestamp()
);

create table app.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default gen_random_uuid(),
  user_id uuid not null references app.users(id) on delete cascade,
  organization_id uuid not null references app.organizations(id),
  refresh_token_hash bytea not null unique,
  previous_refresh_hash bytea,
  auth_version bigint not null,
  created_at timestamptz not null default clock_timestamp(),
  last_used_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoke_reason text,
  user_agent_hash bytea,
  check(expires_at>created_at)
);

create table app.auth_events (
  id bigint generated always as identity primary key,
  user_id uuid references app.users(id),
  organization_id uuid references app.organizations(id),
  session_id uuid references app.auth_sessions(id),
  event_type text not null,
  success boolean not null,
  request_id text,
  identifier_hash bytea,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default clock_timestamp()
);

create index auth_sessions_user_active_idx on app.auth_sessions(user_id,expires_at desc) where revoked_at is null;
create index auth_sessions_family_idx on app.auth_sessions(family_id);
create index auth_events_user_time_idx on app.auth_events(user_id,occurred_at desc);
create index auth_events_identifier_time_idx on app.auth_events(identifier_hash,occurred_at desc);

alter table app.user_credentials enable row level security;
alter table app.user_credentials force row level security;
create policy user_credentials_self on app.user_credentials using(user_id=app.current_user_id()) with check(user_id=app.current_user_id());
alter table app.auth_sessions enable row level security;
alter table app.auth_sessions force row level security;
create policy auth_sessions_self on app.auth_sessions using(user_id=app.current_user_id() and organization_id=app.current_organization_id()) with check(user_id=app.current_user_id() and organization_id=app.current_organization_id());
alter table app.auth_events enable row level security;
alter table app.auth_events force row level security;
create policy auth_events_self on app.auth_events using(user_id=app.current_user_id() and (organization_id is null or organization_id=app.current_organization_id()));

create function app.prevent_auth_event_mutation() returns trigger language plpgsql as $$ begin raise exception 'Eventos de autenticação são append-only' using errcode='55000'; end $$;
create trigger auth_events_immutable before update or delete on app.auth_events for each row execute function app.prevent_auth_event_mutation();

comment on table app.user_credentials is 'Hashes Argon2id; nunca armazena senha reversível.';
comment on table app.auth_sessions is 'Sessões revogáveis com somente o hash do refresh token.';
