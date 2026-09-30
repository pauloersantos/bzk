create table app.project_main_images (
  organization_id uuid not null,
  project_id uuid not null,
  content bytea not null,
  mime_type text not null,
  file_name text not null,
  size_bytes integer not null,
  uploaded_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  version bigint not null default 1,
  primary key (organization_id, project_id),
  foreign key (organization_id, project_id) references app.projects(organization_id, id) on delete cascade,
  check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  check (size_bytes > 0 and size_bytes <= 5242880),
  check (octet_length(content) = size_bytes)
);

create trigger project_main_images_touch before update on app.project_main_images
for each row execute function app.touch_row();

alter table app.project_main_images enable row level security;
alter table app.project_main_images force row level security;
create policy project_main_images_scope on app.project_main_images
using (organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id))
with check (organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id));

comment on table app.project_main_images is 'Imagem principal privada usada no banner contextual da obra.';
