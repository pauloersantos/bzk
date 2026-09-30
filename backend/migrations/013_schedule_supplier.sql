alter table app.project_schedule_items
  add column supplier_id uuid;

alter table app.project_schedule_items
  add constraint project_schedule_items_supplier_fk
  foreign key (organization_id,supplier_id)
  references app.suppliers(organization_id,id);

create index project_schedule_items_supplier_idx
  on app.project_schedule_items(organization_id,supplier_id)
  where supplier_id is not null;
