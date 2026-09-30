alter table app.organizations enable row level security;
alter table app.users enable row level security;
alter table app.organization_members enable row level security;
alter table app.projects enable row level security;
alter table app.project_members enable row level security;

create policy organizations_member on app.organizations using(app.has_organization_access(id));
create policy users_self_or_shared_org on app.users using(id=app.current_user_id() or exists(select 1 from app.organization_members m where m.user_id=users.id and app.has_organization_access(m.organization_id)));
create policy organization_members_scope on app.organization_members using(organization_id=app.current_organization_id() and app.has_organization_access(organization_id)) with check(organization_id=app.current_organization_id() and app.has_organization_access(organization_id));
create policy projects_scope on app.projects using(organization_id=app.current_organization_id() and app.has_project_access(organization_id,id)) with check(organization_id=app.current_organization_id() and app.has_organization_access(organization_id));
create policy project_members_scope on app.project_members using(organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id)) with check(organization_id=app.current_organization_id() and app.has_organization_access(organization_id));

do $$ declare table_name text; begin
  foreach table_name in array array['stage_catalog','service_catalog','suppliers','custom_field_definitions'] loop
    execute format('alter table app.%I enable row level security',table_name);
    execute format('create policy %I_org_scope on app.%I using (organization_id=app.current_organization_id() and app.has_organization_access(organization_id)) with check (organization_id=app.current_organization_id() and app.has_organization_access(organization_id))',table_name,table_name);
  end loop;
  foreach table_name in array array['project_stages','project_services','project_supplier_assignments','project_stage_dependencies','business_transactions','audit_events','project_configuration_revisions','project_stage_versions','project_service_versions','dependency_versions','custom_field_values'] loop
    execute format('alter table app.%I enable row level security',table_name);
    execute format('create policy %I_project_scope on app.%I using (organization_id=app.current_organization_id() and (project_id is null or app.has_project_access(organization_id,project_id))) with check (organization_id=app.current_organization_id() and (project_id is null or app.has_project_access(organization_id,project_id)))',table_name,table_name);
  end loop;
end $$;

alter table app.audit_field_changes enable row level security;
create policy audit_field_changes_scope on app.audit_field_changes using(exists(select 1 from app.audit_events e where e.id=audit_event_id and e.organization_id=app.current_organization_id() and (e.project_id is null or app.has_project_access(e.organization_id,e.project_id))));

alter table app.projects force row level security;
alter table app.stage_catalog force row level security;
alter table app.service_catalog force row level security;
alter table app.suppliers force row level security;
alter table app.project_stages force row level security;
alter table app.project_services force row level security;
alter table app.project_supplier_assignments force row level security;
alter table app.project_stage_dependencies force row level security;
alter table app.audit_events force row level security;
