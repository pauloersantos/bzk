create table app.project_schedule_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  name text not null check (length(trim(name)) between 3 and 180),
  planned_start date not null,
  planned_end date not null,
  progress_percentage numeric(9,4) not null default 0 check (progress_percentage between 0 and 100),
  status text not null default 'planned' check (status in ('planned','released','blocked','in_progress','completed','suspended','cancelled')),
  notes text,
  created_by uuid not null references app.users(id),
  updated_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  version bigint not null default 1,
  foreign key (organization_id,project_id) references app.projects(organization_id,id),
  check (planned_end>=planned_start)
);

create index project_schedule_items_project_idx on app.project_schedule_items(organization_id,project_id,planned_start,planned_end);
create trigger project_schedule_items_touch before update on app.project_schedule_items for each row execute function app.touch_row();
create trigger project_schedule_items_audit after insert or update or delete on app.project_schedule_items for each row execute function app.audit_row_change();
alter table app.project_schedule_items enable row level security;
alter table app.project_schedule_items force row level security;
create policy project_schedule_items_scope on app.project_schedule_items
using (organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id))
with check (organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id));

comment on table app.project_schedule_items is 'Atividades manuais complementares do cronograma da obra.';
