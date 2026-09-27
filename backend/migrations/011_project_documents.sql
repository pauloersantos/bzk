create table app.project_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  supplier_id uuid not null,
  category text not null check (category in ('architecture','engineering','structure','hydraulic','electrical')),
  title text not null check (length(trim(title)) between 3 and 180),
  status text not null default 'received' check (status in ('pending','received','approved','superseded')),
  document_date date,
  details text,
  content bytea not null,
  mime_type text not null,
  file_name text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 15728640),
  uploaded_by uuid not null references app.users(id),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  deleted_at timestamptz,
  version bigint not null default 1,
  foreign key (organization_id, project_id) references app.projects(organization_id,id),
  foreign key (organization_id, supplier_id) references app.suppliers(organization_id,id),
  check (octet_length(content)=size_bytes)
);

create index project_documents_project_idx on app.project_documents(organization_id,project_id,created_at desc) where deleted_at is null;
create trigger project_documents_touch before update on app.project_documents for each row execute function app.touch_row();
create trigger project_documents_audit after insert or update or delete on app.project_documents for each row execute function app.audit_row_change();

alter table app.project_documents enable row level security;
alter table app.project_documents force row level security;
create policy project_documents_scope on app.project_documents
using (organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id))
with check (organization_id=app.current_organization_id() and app.has_project_access(organization_id,project_id));

comment on table app.project_documents is 'Arquivos privados de projetos e documentação, vinculados à obra, categoria e fornecedor.';
