create function app.prevent_duplicate_project() returns trigger
language plpgsql as $$
declare fingerprint text;
begin
  if new.status='cancelled' then return new; end if;
  fingerprint := new.organization_id::text||'|'||lower(trim(new.name))||'|'||lower(trim(new.address))||'|'||lower(trim(coalesce(new.condominium,'')));
  perform pg_advisory_xact_lock(hashtextextended(fingerprint,0));
  if exists(
    select 1 from app.projects p
    where p.organization_id=new.organization_id and p.id<>new.id and p.status<>'cancelled'
      and lower(trim(p.name))=lower(trim(new.name))
      and lower(trim(p.address))=lower(trim(new.address))
      and lower(trim(coalesce(p.condominium,'')))=lower(trim(coalesce(new.condominium,'')))
  ) then
    raise exception 'Já existe uma obra com o mesmo nome, endereço e condomínio' using errcode='23505';
  end if;
  return new;
end $$;

create trigger projects_prevent_duplicate before insert or update of name,address,condominium,status on app.projects
for each row execute function app.prevent_duplicate_project();
