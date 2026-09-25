create extension if not exists pgcrypto;
create schema if not exists app;

create function app.current_organization_id() returns uuid language sql stable as $$
  select nullif(current_setting('app.organization_id', true), '')::uuid
$$;
create function app.current_user_id() returns uuid language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;
create function app.current_request_id() returns text language sql stable as $$
  select nullif(current_setting('app.request_id', true), '')
$$;

create table app.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text not null,
  tax_id text not null unique,
  currency char(3) not null default 'BRL',
  timezone text not null default 'America/Sao_Paulo',
  status text not null default 'active' check (status in ('active','suspended','closed')),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  version bigint not null default 1
);

create table app.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  version bigint not null default 1
);

create table app.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id),
  user_id uuid not null references app.users(id),
  role_code text not null,
  valid_from timestamptz not null default clock_timestamp(),
  valid_to timestamptz,
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  created_at timestamptz not null default clock_timestamp(),
  unique(organization_id, user_id),
  check(valid_to is null or valid_to > valid_from)
);

create function app.has_organization_access(target uuid) returns boolean
language sql stable security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1 from app.organization_members m
    where m.organization_id = target and m.user_id = app.current_user_id()
      and m.status = 'active' and m.valid_from <= clock_timestamp()
      and (m.valid_to is null or m.valid_to > clock_timestamp())
  )
$$;

create table app.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id),
  name text not null,
  address text not null,
  built_area_m2 numeric(19,4) not null check (built_area_m2 > 0),
  approved_budget numeric(19,2) not null check (approved_budget >= 0),
  planned_start date not null,
  planned_end date not null,
  technical_responsible_id uuid references app.users(id),
  status text not null check (status in ('planning','active','suspended','completed','cancelled')),
  created_by uuid not null references app.users(id),
  updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  version bigint not null default 1,
  unique(organization_id, id),
  check(planned_end >= planned_start)
);

create table app.project_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  user_id uuid not null references app.users(id),
  role_code text not null,
  valid_from timestamptz not null default clock_timestamp(),
  valid_to timestamptz,
  status text not null default 'active',
  foreign key (organization_id, project_id) references app.projects(organization_id, id),
  unique(organization_id, project_id, user_id),
  check(valid_to is null or valid_to > valid_from)
);

create function app.has_project_access(target_org uuid, target_project uuid) returns boolean
language sql stable security definer set search_path = app, pg_catalog as $$
  select app.has_organization_access(target_org) and (
    exists(select 1 from app.organization_members m where m.organization_id=target_org and m.user_id=app.current_user_id() and m.status='active' and m.role_code in ('admin','owner'))
    or exists(select 1 from app.project_members p where p.organization_id=target_org and p.project_id=target_project and p.user_id=app.current_user_id() and p.status='active' and p.valid_from<=clock_timestamp() and (p.valid_to is null or p.valid_to>clock_timestamp()))
  )
$$;

create function app.touch_row() returns trigger language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  new.version := old.version + 1;
  return new;
end $$;

create trigger organizations_touch before update on app.organizations for each row execute function app.touch_row();
create trigger users_touch before update on app.users for each row execute function app.touch_row();
create trigger projects_touch before update on app.projects for each row execute function app.touch_row();

create index projects_org_status_idx on app.projects(organization_id,status,created_at desc);
create index project_members_user_idx on app.project_members(organization_id,user_id,status);
