alter table app.projects add column condominium text;
comment on column app.projects.condominium is 'Nome do condomínio ou empreendimento, quando aplicável.';
