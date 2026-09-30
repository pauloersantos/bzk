create table app.work_categories (
  code text primary key,
  name text not null unique,
  display_order int not null unique,
  status text not null default 'active' check(status in ('active','inactive'))
);

alter table app.stage_catalog add column category_code text references app.work_categories(code);
alter table app.service_catalog add column category_code text references app.work_categories(code);
create index stage_catalog_category_idx on app.stage_catalog(organization_id,category_code,status);
create index service_catalog_category_idx on app.service_catalog(organization_id,category_code,status);

insert into app.work_categories(code,name,display_order) values
('CAT-01','Estudos e viabilidade',1),('CAT-02','Projetos',2),('CAT-03','Licenças e documentação',3),('CAT-04','Implantação do canteiro',4),
('CAT-05','Demolições e preparação',5),('CAT-06','Terraplenagem',6),('CAT-07','Contenções',7),('CAT-08','Fundações',8),
('CAT-09','Estrutura',9),('CAT-10','Alvenaria e vedações',10),('CAT-11','Cobertura',11),('CAT-12','Impermeabilização',12),
('CAT-13','Instalações hidráulicas e sanitárias',13),('CAT-14','Instalações elétricas',14),('CAT-15','Gás, aquecimento e energia',15),
('CAT-16','Climatização e ventilação',16),('CAT-17','Automação, dados e segurança',17),('CAT-18','Esquadrias, vidros e fachadas',18),
('CAT-19','Revestimentos e pisos',19),('CAT-20','Forros e tratamento acústico',20),('CAT-21','Pintura e acabamentos',21),
('CAT-22','Mármores, granitos e bancadas',22),('CAT-23','Louças, metais e acessórios',23),('CAT-24','Marcenaria',24),
('CAT-25','Iluminação decorativa',25),('CAT-26','Equipamentos e eletrodomésticos',26),('CAT-27','Piscina, spa e lazer',27),
('CAT-28','Paisagismo e áreas externas',28),('CAT-29','Infraestrutura definitiva',29),('CAT-30','Testes e comissionamento',30),
('CAT-31','Limpeza e preparação para entrega',31),('CAT-32','Vistorias e correções',32),('CAT-33','Documentação final',33),('CAT-34','Entrega e pós-obra',34);
