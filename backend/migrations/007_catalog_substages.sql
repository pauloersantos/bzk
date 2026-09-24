alter table app.stage_catalog
  add column item_type text not null default 'stage' check(item_type in ('stage','substage')),
  add column predecessor_stage_id uuid;

alter table app.stage_catalog
  add constraint stage_catalog_predecessor_fk
  foreign key(organization_id,predecessor_stage_id)
  references app.stage_catalog(organization_id,id);

create index stage_catalog_type_idx
  on app.stage_catalog(organization_id,item_type,category_code,status);

create index stage_catalog_predecessor_idx
  on app.stage_catalog(organization_id,predecessor_stage_id);

update app.stage_catalog
set predecessor_stage_id=parent_stage_id,
    parent_stage_id=null
where item_type='stage' and parent_stage_id is not null;
