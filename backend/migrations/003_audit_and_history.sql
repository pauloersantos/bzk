create table app.business_transactions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id), project_id uuid,
  request_id text not null, correlation_id text, origin text not null, status text not null default 'started',
  started_at timestamptz not null default clock_timestamp(), completed_at timestamptz,
  unique(organization_id,request_id), foreign key(organization_id,project_id) references app.projects(organization_id,id)
);

create table app.audit_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id), project_id uuid,
  transaction_id uuid, actor_user_id uuid, actor_type text not null default 'user', action text not null,
  entity_type text not null, entity_id uuid not null, previous_version bigint, new_version bigint, result text not null default 'success',
  reason text, request_id text, correlation_id text, origin text not null default 'api', changed_fields text[] not null default '{}',
  previous_snapshot jsonb, new_snapshot jsonb, occurred_at timestamptz not null default clock_timestamp(),
  foreign key(organization_id,project_id) references app.projects(organization_id,id),
  foreign key(transaction_id) references app.business_transactions(id), foreign key(actor_user_id) references app.users(id),
  check(result in ('success','denied','failed'))
);

create table app.audit_field_changes (
  id uuid primary key default gen_random_uuid(), audit_event_id uuid not null references app.audit_events(id),
  field_path text not null, data_type text not null, previous_value jsonb, new_value jsonb, restricted boolean not null default false
);

create table app.project_configuration_revisions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null, revision_number int not null,
  reason text not null, valid_from timestamptz not null, valid_to timestamptz, status text not null,
  approved_by uuid references app.users(id), approved_at timestamptz, created_by uuid not null references app.users(id), created_at timestamptz not null default clock_timestamp(),
  unique(organization_id,project_id,id), unique(organization_id,project_id,revision_number),
  foreign key(organization_id,project_id) references app.projects(organization_id,id), check(valid_to is null or valid_to>valid_from),
  check(status in ('draft','in_review','approved','superseded','rejected'))
);
create unique index one_current_project_configuration on app.project_configuration_revisions(organization_id,project_id) where status='approved' and valid_to is null;

create table app.project_stage_versions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null, revision_id uuid not null,
  project_stage_id uuid not null, catalog_stage_id uuid not null, code_snapshot text not null, name_snapshot text not null,
  display_order int not null, planned_start date not null, planned_end date not null, physical_weight numeric(9,4) not null,
  status_snapshot text not null, supplier_name_snapshot text,
  foreign key(organization_id,project_id,revision_id) references app.project_configuration_revisions(organization_id,project_id,id),
  foreign key(organization_id,project_id,project_stage_id) references app.project_stages(organization_id,project_id,id),
  unique(revision_id,project_stage_id)
);
create table app.project_service_versions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null, revision_id uuid not null,
  project_service_id uuid not null, project_stage_id uuid not null, catalog_service_id uuid not null,
  code_snapshot text not null, name_snapshot text not null, unit_snapshot text not null, category_snapshot text not null,
  quantity numeric(19,4) not null, physical_weight numeric(9,4) not null, progress_criterion text not null,
  environment_name_snapshot text, supplier_name_snapshot text, status_snapshot text not null,
  foreign key(organization_id,project_id,revision_id) references app.project_configuration_revisions(organization_id,project_id,id),
  foreign key(organization_id,project_id,project_service_id) references app.project_services(organization_id,project_id,id),
  unique(revision_id,project_service_id)
);
create table app.dependency_versions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid not null, revision_id uuid not null,
  dependency_id uuid not null, predecessor_stage_id uuid not null, successor_stage_id uuid not null,
  dependency_type text not null, lag_days int not null, reason text,
  foreign key(organization_id,project_id,revision_id) references app.project_configuration_revisions(organization_id,project_id,id),
  foreign key(dependency_id) references app.project_stage_dependencies(id), unique(revision_id,dependency_id)
);

create table app.custom_field_definitions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id), entity_type text not null,
  code text not null, label text not null, data_type text not null, validation_rule jsonb, options jsonb,
  required boolean not null default false, searchable boolean not null default false, cardinality text not null default 'single',
  valid_from timestamptz not null default clock_timestamp(), valid_to timestamptz, status text not null default 'active', version bigint not null default 1,
  unique(organization_id,id), unique(organization_id,entity_type,code,version),
  check(data_type in ('text','number','date','boolean','structured')), check(cardinality in ('single','multiple')),
  check(valid_to is null or valid_to>valid_from)
);
create table app.custom_field_values (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, project_id uuid, definition_id uuid not null, entity_id uuid not null,
  text_value text, number_value numeric(19,6), date_value date, boolean_value boolean, structured_value jsonb,
  version bigint not null default 1, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
  foreign key(organization_id,definition_id) references app.custom_field_definitions(organization_id,id),
  foreign key(organization_id,project_id) references app.projects(organization_id,id),
  check(num_nonnulls(text_value,number_value,date_value,boolean_value,structured_value)=1)
);

create function app.audit_row_change() returns trigger language plpgsql security definer set search_path=app,pg_catalog as $$
declare old_json jsonb; new_json jsonb; org uuid; project uuid; record_id uuid; fields text[];
begin
  old_json := case when tg_op='INSERT' then null else to_jsonb(old) end;
  new_json := case when tg_op='DELETE' then null else to_jsonb(new) end;
  org := coalesce((new_json->>'organization_id')::uuid,(old_json->>'organization_id')::uuid,app.current_organization_id());
  project := coalesce((new_json->>'project_id')::uuid,(old_json->>'project_id')::uuid);
  record_id := coalesce((new_json->>'id')::uuid,(old_json->>'id')::uuid);
  select coalesce(array_agg(key),'{}') into fields from (
    select key from jsonb_object_keys(coalesce(old_json,'{}')) key where old_json->key is distinct from new_json->key
    union select key from jsonb_object_keys(coalesce(new_json,'{}')) key where old_json->key is distinct from new_json->key
  ) changed;
  old_json := coalesce(old_json,'{}') - array['tax_id','email','phone','notes','previous_snapshot','new_snapshot'];
  new_json := coalesce(new_json,'{}') - array['tax_id','email','phone','notes','previous_snapshot','new_snapshot'];
  insert into app.audit_events(organization_id,project_id,actor_user_id,action,entity_type,entity_id,previous_version,new_version,request_id,changed_fields,previous_snapshot,new_snapshot)
  values(org,project,app.current_user_id(),lower(tg_op),tg_table_schema||'.'||tg_table_name,record_id,(old_json->>'version')::bigint,(new_json->>'version')::bigint,app.current_request_id(),fields,nullif(old_json,'{}'),nullif(new_json,'{}'));
  return coalesce(new,old);
end $$;

create trigger projects_audit after insert or update or delete on app.projects for each row execute function app.audit_row_change();
create trigger stage_catalog_audit after insert or update or delete on app.stage_catalog for each row execute function app.audit_row_change();
create trigger service_catalog_audit after insert or update or delete on app.service_catalog for each row execute function app.audit_row_change();
create trigger suppliers_audit after insert or update or delete on app.suppliers for each row execute function app.audit_row_change();
create trigger project_stages_audit after insert or update or delete on app.project_stages for each row execute function app.audit_row_change();
create trigger project_services_audit after insert or update or delete on app.project_services for each row execute function app.audit_row_change();
create trigger assignments_audit after insert or update or delete on app.project_supplier_assignments for each row execute function app.audit_row_change();
create trigger dependencies_audit after insert or update or delete on app.project_stage_dependencies for each row execute function app.audit_row_change();

create function app.prevent_audit_mutation() returns trigger language plpgsql as $$ begin raise exception 'Auditoria é append-only' using errcode='55000'; end $$;
create trigger audit_events_immutable before update or delete on app.audit_events for each row execute function app.prevent_audit_mutation();
create trigger audit_fields_immutable before update or delete on app.audit_field_changes for each row execute function app.prevent_audit_mutation();

create index audit_timeline_idx on app.audit_events(organization_id,project_id,occurred_at desc);
create index audit_entity_idx on app.audit_events(organization_id,entity_type,entity_id,occurred_at desc);
create index config_revision_asof_idx on app.project_configuration_revisions(organization_id,project_id,valid_from desc);
