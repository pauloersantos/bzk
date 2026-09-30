create table app.stage_catalog (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id),
  parent_stage_id uuid, code text not null, name text not null, description text, display_order int not null default 0,
  status text not null default 'active' check(status in ('active','inactive')),
  created_by uuid not null references app.users(id), updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), version bigint not null default 1,
  unique(organization_id,id), unique(organization_id,code),
  foreign key(organization_id,parent_stage_id) references app.stage_catalog(organization_id,id)
);
create trigger stage_catalog_touch before update on app.stage_catalog for each row execute function app.touch_row();

create table app.service_catalog (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id), stage_id uuid not null,
  code text not null, name text not null, description text, unit_code text not null, cost_category_code text not null,
  default_weight numeric(9,4) not null default 0 check(default_weight between 0 and 100),
  default_duration_days int not null default 0 check(default_duration_days>=0),
  progress_criterion text not null check(progress_criterion in ('quantity','percentage','milestone')),
  status text not null default 'active' check(status in ('active','inactive')),
  created_by uuid not null references app.users(id), updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), version bigint not null default 1,
  unique(organization_id,id), unique(organization_id,code),
  foreign key(organization_id,stage_id) references app.stage_catalog(organization_id,id)
);
create trigger service_catalog_touch before update on app.service_catalog for each row execute function app.touch_row();

create table app.suppliers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id),
  person_type text not null check(person_type in ('company','individual')), legal_name text not null, trade_name text,
  tax_id text not null, primary_specialty text not null, email text not null, phone text not null,
  average_lead_time_days int not null default 0 check(average_lead_time_days>=0), notes text,
  status text not null default 'active' check(status in ('active','under_review','inactive')),
  created_by uuid not null references app.users(id), updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), version bigint not null default 1,
  unique(organization_id,id), unique(organization_id,tax_id)
);
create trigger suppliers_touch before update on app.suppliers for each row execute function app.touch_row();

create table app.project_stages (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null, catalog_stage_id uuid not null,
  display_order int not null, planned_start date not null, planned_end date not null, physical_weight numeric(9,4) not null check(physical_weight between 0 and 100),
  progress_percentage numeric(9,4) not null default 0 check(progress_percentage between 0 and 100), notes text,
  status text not null default 'planned' check(status in ('planned','released','blocked','in_progress','completed','suspended','cancelled')),
  created_by uuid not null references app.users(id), updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), version bigint not null default 1,
  unique(organization_id,project_id,id), unique(organization_id,project_id,catalog_stage_id),
  foreign key(organization_id,project_id) references app.projects(organization_id,id),
  foreign key(organization_id,catalog_stage_id) references app.stage_catalog(organization_id,id),
  check(planned_end>=planned_start)
);
create trigger project_stages_touch before update on app.project_stages for each row execute function app.touch_row();

create table app.project_services (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null, project_stage_id uuid not null, catalog_service_id uuid not null,
  environment_id uuid, quantity numeric(19,4) not null check(quantity>0), physical_weight numeric(9,4) not null check(physical_weight between 0 and 100),
  progress_percentage numeric(9,4) not null default 0 check(progress_percentage between 0 and 100),
  progress_criterion text not null check(progress_criterion in ('quantity','percentage','milestone')),
  status text not null default 'planned' check(status in ('planned','released','blocked','in_progress','completed','suspended','cancelled')),
  created_by uuid not null references app.users(id), updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), version bigint not null default 1,
  unique(organization_id,project_id,id), unique(organization_id,project_id,project_stage_id,catalog_service_id),
  foreign key(organization_id,project_id,project_stage_id) references app.project_stages(organization_id,project_id,id),
  foreign key(organization_id,catalog_service_id) references app.service_catalog(organization_id,id)
);
create trigger project_services_touch before update on app.project_services for each row execute function app.touch_row();

create table app.project_supplier_assignments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null,
  project_stage_id uuid, project_service_id uuid, supplier_id uuid not null, role_code text not null,
  valid_from timestamptz not null default clock_timestamp(), valid_to timestamptz, reason text, status text not null default 'active',
  configuration_revision_id uuid, created_by uuid not null references app.users(id), created_at timestamptz not null default clock_timestamp(),
  foreign key(organization_id,project_id) references app.projects(organization_id,id),
  foreign key(organization_id,project_id,project_stage_id) references app.project_stages(organization_id,project_id,id),
  foreign key(organization_id,project_id,project_service_id) references app.project_services(organization_id,project_id,id),
  foreign key(organization_id,supplier_id) references app.suppliers(organization_id,id),
  check(num_nonnulls(project_stage_id,project_service_id)=1), check(valid_to is null or valid_to>valid_from)
);
create unique index one_active_primary_stage_supplier on app.project_supplier_assignments(organization_id,project_id,project_stage_id) where project_stage_id is not null and role_code='primary' and valid_to is null and status='active';
create unique index one_active_primary_service_supplier on app.project_supplier_assignments(organization_id,project_id,project_service_id) where project_service_id is not null and role_code='primary' and valid_to is null and status='active';

create table app.project_stage_dependencies (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null,
  predecessor_stage_id uuid not null, successor_stage_id uuid not null, dependency_type text not null check(dependency_type in ('FS','SS','FF','SF')),
  lag_days int not null default 0 check(lag_days>=0), reason text, created_by uuid not null references app.users(id), created_at timestamptz not null default clock_timestamp(),
  unique(organization_id,project_id,predecessor_stage_id,successor_stage_id,dependency_type),
  foreign key(organization_id,project_id,predecessor_stage_id) references app.project_stages(organization_id,project_id,id),
  foreign key(organization_id,project_id,successor_stage_id) references app.project_stages(organization_id,project_id,id),
  check(predecessor_stage_id<>successor_stage_id)
);

create function app.reject_dependency_cycle() returns trigger language plpgsql as $$
declare cycle_found boolean;
begin
  with recursive walk(id) as (
    select new.successor_stage_id
    union
    select d.successor_stage_id from app.project_stage_dependencies d join walk w on d.predecessor_stage_id=w.id
    where d.organization_id=new.organization_id and d.project_id=new.project_id and d.id<>coalesce(new.id,gen_random_uuid())
  ) select exists(select 1 from walk where id=new.predecessor_stage_id) into cycle_found;
  if cycle_found then raise exception 'Dependência cria ciclo no cronograma' using errcode='23514'; end if;
  return new;
end $$;
create trigger dependency_no_cycle before insert or update on app.project_stage_dependencies for each row execute function app.reject_dependency_cycle();

create index stage_catalog_org_order_idx on app.stage_catalog(organization_id,status,display_order);
create index service_catalog_org_stage_idx on app.service_catalog(organization_id,stage_id,status);
create index suppliers_org_name_idx on app.suppliers(organization_id,status,legal_name);
create index project_stages_project_idx on app.project_stages(organization_id,project_id,status,display_order);
create index project_services_stage_idx on app.project_services(organization_id,project_id,project_stage_id,status);
create index dependencies_predecessor_idx on app.project_stage_dependencies(organization_id,project_id,predecessor_stage_id);
create index dependencies_successor_idx on app.project_stage_dependencies(organization_id,project_id,successor_stage_id);
