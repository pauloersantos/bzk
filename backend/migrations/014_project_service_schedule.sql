alter table app.project_services
  add column planned_start date,
  add column planned_end date;

update app.project_services service
set planned_start=stage.planned_start,
    planned_end=stage.planned_end
from app.project_stages stage
where stage.organization_id=service.organization_id
  and stage.project_id=service.project_id
  and stage.id=service.project_stage_id;

alter table app.project_services
  alter column planned_start set not null,
  alter column planned_end set not null,
  add constraint project_services_planned_period_ck check(planned_end>=planned_start);

create index project_services_schedule_idx
  on app.project_services(organization_id,project_id,planned_start,planned_end);
