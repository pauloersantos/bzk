import { Client } from 'pg';
import { loadSecureEnvironment } from '../src/config/secure-env';
import { validateEnvironment } from '../src/config/env.schema';

const catalog = [
  ['Estudos e viabilidade','Levantamento do terreno|Estudo de viabilidade|Levantamento topográfico|Sondagem do solo|Estudos ambientais'],
  ['Projetos','Projeto arquitetônico|Projeto de interiores|Projeto paisagístico|Projeto estrutural|Projeto de fundações|Compatibilização de projetos'],
  ['Licenças e documentação','Aprovação no condomínio|Aprovação na prefeitura|Alvará de construção|Emissão de ART e RRT|Licenças ambientais|Seguros da obra'],
  ['Implantação do canteiro','Fechamento do terreno|Instalações provisórias|Energia provisória|Água provisória|Escritório e depósitos|Controle de acesso'],
  ['Demolições e preparação','Demolições previstas|Retirada de entulho|Limpeza do terreno|Locação da obra|Proteções de áreas existentes'],
  ['Terraplenagem','Escavação|Corte e aterro|Compactação do solo|Transporte de terra|Regularização do terreno'],
  ['Contenções','Muros de arrimo|Cortinas de contenção|Drenagem de contenções|Impermeabilização de contenções'],
  ['Fundações','Estacas|Blocos de fundação|Sapatas|Radier|Baldrames|Impermeabilização de fundações'],
  ['Estrutura','Pilares|Vigas|Lajes|Escadas estruturais|Estruturas metálicas|Concretagem e controle tecnológico'],
  ['Alvenaria e vedações','Alvenaria externa|Alvenaria interna|Drywall|Vergas e contravergas|Encunhamento|Fechamentos técnicos'],
  ['Cobertura','Estrutura da cobertura|Telhamento|Rufos e calhas|Condutores pluviais|Isolamento termoacústico'],
  ['Impermeabilização','Lajes e coberturas|Banheiros|Varandas|Piscina|Reservatórios|Áreas enterradas'],
  ['Instalações hidráulicas e sanitárias','Água fria|Água quente|Esgoto sanitário|Águas pluviais|Reservatórios|Bombas e pressurização'],
  ['Instalações elétricas','Entrada de energia|Quadros elétricos|Eletrodutos e fiação|Tomadas e interruptores|Aterramento|Sistema de proteção contra descargas'],
  ['Gás, aquecimento e energia','Rede de gás|Aquecimento de água|Aquecimento solar|Energia fotovoltaica|Gerador e nobreak'],
  ['Climatização e ventilação','Infraestrutura de ar-condicionado|Equipamentos de climatização|Ventilação mecânica|Exaustão|Renovação de ar'],
  ['Automação, dados e segurança','Automação residencial|Rede lógica e Wi-Fi|CFTV|Alarme|Controle de acesso|Áudio e vídeo'],
  ['Esquadrias, vidros e fachadas','Esquadrias de alumínio|Esquadrias de madeira|Vidros|Guarda-corpos|Fachadas especiais|Serralheria'],
  ['Revestimentos e pisos','Contrapisos|Revestimentos cerâmicos|Porcelanatos|Pisos de madeira|Pisos cimentícios|Rodapés'],
  ['Forros e tratamento acústico','Forros de gesso|Forros de madeira|Sancas e cortineiros|Isolamento acústico|Revestimentos acústicos'],
  ['Pintura e acabamentos','Preparação de superfícies|Pintura interna|Pintura externa|Texturas|Papéis e revestimentos de parede'],
  ['Mármores, granitos e bancadas','Bancadas de cozinha|Bancadas de banheiros|Escadas em pedra|Soleiras e peitoris|Revestimentos especiais'],
  ['Louças, metais e acessórios','Louças sanitárias|Metais sanitários|Cubas|Chuveiros|Acessórios de banheiro'],
  ['Marcenaria','Armários de cozinha|Armários de dormitórios|Painéis|Portas internas|Móveis sob medida'],
  ['Iluminação decorativa','Luminárias internas|Luminárias externas|Perfis de LED|Iluminação paisagística|Sistemas de controle'],
  ['Equipamentos e eletrodomésticos','Eletrodomésticos embutidos|Adega climatizada|Elevador residencial|Equipamentos especiais'],
  ['Piscina, spa e lazer','Estrutura da piscina|Impermeabilização da piscina|Revestimento da piscina|Casa de máquinas|Spa e sauna|Equipamentos de lazer'],
  ['Paisagismo e áreas externas','Preparo do solo|Plantio|Irrigação|Decks|Pavimentação externa|Muros e portões'],
  ['Infraestrutura definitiva','Ligação definitiva de água|Ligação definitiva de energia|Internet e telefonia|Câmeras de segurança|Gás definitivo|Drenagem externa'],
  ['Testes e comissionamento','Teste hidráulico|Teste elétrico|Balanceamento da climatização|Teste da automação|Comissionamento de equipamentos'],
  ['Limpeza e preparação para entrega','Limpeza pós-obra|Proteção de acabamentos|Remoção do canteiro|Organização para entrega'],
  ['Vistorias e correções','Vistoria técnica|Lista de pendências|Correções de acabamento|Reinspeção e aceite'],
  ['Documentação final','Habite-se|As built|Manuais de operação|Termos de garantia|Certificados e laudos'],
  ['Entrega e pós-obra','Entrega das chaves|Treinamento dos sistemas|Assistência pós-obra|Plano de manutenção|Memorial da obra'],
] as const;

async function main(): Promise<void> {
  loadSecureEnvironment();
  const env=validateEnvironment(process.env);
  if(env.NODE_ENV==='production') throw new Error('Carga de demonstração bloqueada em produção');
  if(!env.DEV_USER_ID||!env.DEV_ORGANIZATION_ID) throw new Error('Configure DEV_USER_ID e DEV_ORGANIZATION_ID');
  const client=new Client({connectionString:env.DATABASE_URL,application_name:'bomzeika-catalog-loader'});
  await client.connect();
  try {
    await client.query('begin');
    // As configurações abaixo referenciam o catálogo e precisam ser refeitas após sua substituição.
    await client.query(`truncate app.project_stage_dependencies,app.project_supplier_assignments,app.project_services,app.project_stages,app.service_catalog,app.stage_catalog cascade`);
    let predecessor:string|null=null;
    let serviceNumber=1;
    for(let index=0;index<catalog.length;index++){
      const [name,serviceNames]=catalog[index];
      const categoryCode=`CAT-${String(index+1).padStart(2,'0')}`;
      const stageCode=`ET-${String(index+1).padStart(2,'0')}`;
      const stage=(await client.query<{id:string}>(`insert into app.stage_catalog(organization_id,category_code,parent_stage_id,code,name,description,display_order,created_by,updated_by) values($1,$2,$3,$4,$5,$6,$7,$8,$8) returning id`,[env.DEV_ORGANIZATION_ID,categoryCode,predecessor,stageCode,name,`Etapa padrão de ${name.toLowerCase()} para obra residencial de alto padrão.`,index+1,env.DEV_USER_ID])).rows[0];
      for(const serviceName of serviceNames.split('|')){
        const serviceCode=`SR-${String(serviceNumber++).padStart(3,'0')}`;
        await client.query(`insert into app.service_catalog(organization_id,category_code,stage_id,code,name,description,unit_code,cost_category_code,default_weight,default_duration_days,progress_criterion,created_by,updated_by) values($1,$2,$3,$4,$5,$6,'un','services',0,1,'percentage',$7,$7)`,[env.DEV_ORGANIZATION_ID,categoryCode,stage.id,serviceCode,serviceName,`Serviço padrão vinculado à etapa ${name}.`,env.DEV_USER_ID]);
      }
      predecessor=stage.id;
    }
    await client.query('commit');
    console.log(`Catálogo carregado: ${catalog.length} etapas e ${serviceNumber-1} serviços.`);
  } catch(error) {
    await client.query('rollback');
    throw error;
  } finally { await client.end(); }
}
void main();
