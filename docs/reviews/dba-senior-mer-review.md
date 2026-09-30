# Parecer DBA Sênior — MER do BOMzeika Obras

**Data da revisão:** 20/09/2026  
**Revisor:** agente `senior-dba-reviewer`  
**Artefato avaliado:** `docs/product/mer-bomzeika-obras.md`  
**Fontes de confronto:** `docs/product/especificacao-funcional-bomzeika-obras.md`, `docs/04-dados-api.md`, `prototipo/prumo-v9-completo.html` e `AGENTS.md`  
**Estado do artefato:** modelo lógico em documentação; nenhuma tabela, migração, política RLS ou rotina foi implementada ou testada

## 1. Resumo executivo

O MER cobre os principais domínios do produto e preserva a separação essencial entre orçamento, compromisso, custo reconhecido, obrigação e pagamento. A nova seção de histórico também segue a direção correta ao separar auditoria técnica, histórico temporal de negócio e eventos financeiros.

O modelo, porém, ainda não deve ser convertido diretamente em DDL. Existem riscos de integridade que precisam ser eliminados antes da fisicalização:

1. as FKs ainda não demonstram, de forma executável, que todos os relacionamentos permanecem dentro da mesma organização e obra;
2. várias entidades financeiras possuem mais de uma origem opcional sem restrição de exclusividade, o que permite duplicação ou ambiguidade;
3. `EVENTO_AUDITORIA` aparece com duas definições diferentes e snapshots podem conter dados sensíveis;
4. a vigência da configuração usa `date`, embora o próprio modelo exija troca no mesmo instante lógico;
5. vínculos polimórficos com `tipo_entidade + entidade_id` não possuem integridade referencial nativa;
6. dependências entre etapas e serviços aparecem em dois modelos parcialmente sobrepostos;
7. alguns totais e saldos derivados são armazenados sem definir autoridade, concorrência ou reconciliação.

O modelo é suficientemente amplo para continuar a validação funcional, mas sua aprovação para migrações depende das correções críticas e altas deste parecer.

## 2. Veredito limitado ao escopo

**Veredito: aprovado com condicionantes para validação conceitual; não aprovado ainda para fisicalização PostgreSQL.**

Este parecer não aprova desempenho em produção, RLS, migrações, backup, restauração ou reconciliação, pois nada disso foi implementado ou executado. Após incorporar as correções críticas e altas ao MER, deve ser feita uma segunda revisão do esquema físico proposto, acompanhada dos testes descritos na seção 11.

## 3. Pontos positivos confirmados

- O encadeamento financeiro está conceitualmente correto: orçamento → compromisso → execução reconhecida → obrigação → pagamento.
- Pagamento é tratado como liquidação financeira, sem gerar novo custo.
- Aditivos, reversões e estornos preservam a operação original.
- Orçamentos, cronogramas, documentos e configurações possuem intenção de versionamento.
- A efetivação de proposta em compra prevê idempotência.
- O modelo contempla pagamentos parciais, alocação entre obrigações, adiantamentos e retenções.
- A dependência possui direção predecessor → sucessor e prevê validação de ciclos.
- O histórico proposto não pretende substituir os eventos financeiros oficiais.
- A estratégia `expand-contract` e a imutabilidade de migrações aplicadas são adequadas.
- Campos customizados foram limitados a extensões que não substituem chaves, relacionamentos ou valores oficiais.

## 4. Achados críticos

### CRIT-01 — O isolamento por organização e obra está declarado, mas não está fechado pelas chaves

**Evidência:** muitas tabelas específicas possuem somente `obra_id`, enquanto tabelas filhas possuem apenas o ID do pai. O texto recomenda “FKs compostas ou gatilhos equivalentes”, mas o MER não define quais chaves compostas serão usadas.

**Risco:** um registro pode referenciar fornecedor, etapa, serviço, contrato, conta, arquivo ou usuário de outra organização/obra. RLS filtra linhas visíveis, mas não corrige uma referência cruzada já gravada. O problema afeta reconciliação, autorização, relatórios e auditoria.

**Correção obrigatória:**

- Toda tabela de negócio específica de obra deve carregar `organizacao_id` e `obra_id`, mesmo quando esses valores possam ser encontrados pelo pai.
- Toda entidade pai específica de obra deve expor `UNIQUE (organizacao_id, obra_id, id)`.
- A filha deve usar FK composta `(organizacao_id, obra_id, parent_id)` para a chave composta do pai.
- Referências a catálogos da organização devem usar `(organizacao_id, catalogo_id)`.
- Referências globais legítimas, como `USUARIO`, devem ser explicitamente identificadas como exceção.
- A `OBRA` deve expor `UNIQUE (organizacao_id, id)` e ser a raiz de todas as FKs de escopo.

**Exemplo conceitual:**

```sql
unique (organizacao_id, obra_id, id)

foreign key (organizacao_id, obra_id, contrato_id)
  references contrato (organizacao_id, obra_id, id)
```

**Critério de fechamento:** nenhum vínculo de obra deve depender apenas de validação na API ou de trigger genérico quando uma FK composta puder representar a regra.

### CRIT-02 — Origens financeiras não possuem exclusividade estrutural

**Evidência:**

- `RECONHECIMENTO_CUSTO` contém `linha_medicao_id` e `item_recebimento_id`;
- `OBRIGACAO` contém `medicao_id`, `recebimento_id` e `parcela_prevista_id`;
- `LINHA_COMPROMISSO` contém `contrato_id` e `item_compra_id`;
- `PARCELA_PREVISTA` contém `compra_id` e `contrato_id`;
- `MOVIMENTO_FINANCEIRO` contém `pagamento_id` e `aporte_id`.

O modelo não define `CHECK` de exatamente uma origem nem tabela de origem tipada.

**Risco:** a mesma linha pode ter nenhuma origem, duas origens simultâneas ou origem incompatível com seu tipo. Isso permite custo reconhecido em duplicidade, obrigação duplicada, compra/contrato contados duas vezes e movimento financeiro ambíguo.

**Correção obrigatória:** escolher uma destas alternativas por agregado:

1. colunas opcionais com `CHECK (num_nonnulls(...) = 1)`, FKs compostas e índices únicos parciais; ou
2. uma entidade raiz de origem/compromisso com subtipos tipados e FKs normais.

Também devem existir:

- unicidade de reconhecimento ativo por linha de medição ou item de recebimento;
- unicidade de obrigação por origem, tipo e competência aplicável;
- unicidade de compra por decisão de proposta;
- unicidade de movimento financeiro por evento de origem;
- reversão vinculada ao evento original, limitada ao saldo reversível;
- idempotência no mesmo commit do evento financeiro.

**Critério de fechamento:** testes concorrentes devem provar que dois requests simultâneos não criam dois reconhecimentos, duas obrigações, duas compras ou duas baixas para a mesma origem.

### CRIT-03 — Saldos e totais armazenados podem divergir dos eventos oficiais

**Evidência:** o MER armazena `valor_executado`, `quantidade_recebida`, `saldo` de obrigação, saldo de adiantamento, saldo de retenção, totais de orçamento/proposta/compra e valores realizados.

**Risco:** atualização parcial, retry, concorrência ou correção manual pode fazer o saldo armazenado divergir de medições, reconhecimentos, alocações, estornos e compensações. O painel pode produzir valores diferentes do relatório ou da consulta detalhada.

**Correção obrigatória:** classificar cada campo como uma destas categorias:

- **evento-fonte imutável:** autoridade do valor;
- **estado corrente transacional:** atualizado atomicamente com `version` e lock;
- **cache derivado:** reconstruível e nunca usado como autoridade;
- **snapshot aprovado:** valor congelado para uma data/versão.

Para campos de saldo, preferir cálculo pelos eventos ou ledger de lançamentos. Se um saldo corrente for mantido por desempenho, ele deve ter rotina de reconciliação, versão otimista e prova de equivalência com o ledger.

**Critério de fechamento:** deve existir consulta de reconciliação que recompute e compare obrigação, pagamento, adiantamento, retenção e movimento financeiro sem usar o saldo armazenado como entrada.

## 5. Achados de severidade alta

### ALTA-01 — `EVENTO_AUDITORIA` possui duas definições divergentes

**Evidência:** a seção 13 define `EVENTO_AUDITORIA` sem `transacao_id` e snapshots; a seção 14 redefine a mesma entidade com campos diferentes.

**Risco:** a futura implementação pode criar tabelas incompatíveis ou omitir `resultado`, ator de sistema, correlação, requisição e classificação de dados.

**Correção recomendada:** manter uma única definição canônica, contendo no mínimo:

- `id`, `organizacao_id`, `obra_id` opcional e `transacao_id`;
- `ator_usuario_id` opcional, `ator_tipo` e referência do processo de sistema;
- `acao`, `tipo_entidade`, `entidade_id`, `versao_anterior`, `versao_nova`;
- `resultado` (`sucesso`, `negado`, `falhou`);
- `motivo`, `request_id`, `correlation_id`, `origem` e `ocorrido_em`;
- snapshots sanitizados opcionais;
- integridade append-only e política de retenção.

`ALTERACAO_CAMPO` deve ser detalhe desse evento, sem repetir campos que possam ser reconstruídos com segurança.

### ALTA-02 — Snapshots de auditoria podem copiar dados bancários e pessoais

**Evidência:** `snapshot_anterior`, `snapshot_novo`, `valor_anterior` e `valor_novo` usam JSONB; `dado_restrito` controla apenas a apresentação.

**Risco:** CPF/CNPJ, chave PIX, conta, dados de comprador, token, conteúdo de documento e outros segredos podem permanecer indefinidamente no histórico, backups e réplicas. Marcar um campo como restrito não remove o dado.

**Correção recomendada:**

- usar lista permitida de campos auditáveis por entidade;
- omitir segredos, tokens, binários e credenciais;
- mascarar ou cifrar valores sensíveis antes da gravação;
- registrar para dados bancários somente mudança, fingerprint e últimos dígitos necessários;
- separar acesso ao histórico restrito e registrar sua leitura;
- definir retenção por classe de dado;
- impedir que payloads de erro e outbox copiem dados proibidos.

### ALTA-03 — Vigência temporal com `date` não suporta o “mesmo instante lógico”

**Evidência:** `REVISAO_CONFIGURACAO_OBRA.valida_de` e `valida_ate` são `date`, enquanto as regras afirmam que uma revisão encerra e outra começa no mesmo instante.

**Risco:** duas revisões no mesmo dia ficam ambíguas; consultas `as of` não conseguem reconstruir o estado entre aprovações; o fuso da obra pode produzir corte incorreto.

**Correção recomendada:**

- usar `timestamptz` para `valida_de` e `valida_ate`;
- representar vigência como intervalo `[início, fim)`;
- adicionar `EXCLUDE USING gist` por obra para impedir sobreposição de versões aprovadas;
- usar índice único parcial para uma versão vigente por obra;
- manter `date` apenas para datas de calendário como vencimento, competência e prazo contratual.

### ALTA-04 — Vínculos polimórficos não têm integridade referencial

**Evidência:** `SOLICITACAO_APROVACAO`, `EVIDENCIA`, `VINCULO_DOCUMENTO`, `NOTIFICACAO`, auditoria e campos customizados usam `tipo_entidade/tipo_objeto + entidade_id`.

**Risco:** IDs inexistentes ou de outra organização/obra podem ser vinculados; exclusão ou mudança de escopo deixa registros órfãos; RLS fica mais difícil de provar.

**Correção recomendada:**

- para objetos críticos, criar tabelas de vínculo tipadas, como `documento_compra`, `documento_contrato`, `documento_etapa`, `evidencia_inspecao`;
- para aprovação, considerar uma entidade `objeto_aprovavel` com escopo e versão, ou relações tipadas por operação;
- manter polimorfismo somente para recursos auxiliares, com lista permitida, validação transacional e `organizacao_id/obra_id` explícitos;
- campos customizados devem referenciar uma entidade extensível registrada e validada, nunca um UUID solto.

### ALTA-05 — Dependências de configuração e cronograma se sobrepõem

**Evidência:** `DEPENDENCIA_ATIVIDADE` aponta apenas para `ETAPA_OBRA`; `DEPENDENCIA_CRONOGRAMA` aponta para `ATIVIDADE_CRONOGRAMA`. A especificação exige predecessor e sucessor tanto para etapa quanto para serviço.

**Risco:** um serviço pode ser configurado em uma tela, mas não possuir relação persistível no primeiro modelo; a mesma dependência pode divergir entre configuração e cronograma.

**Correção recomendada:** adotar uma raiz única de atividade planejável. `ATIVIDADE_CRONOGRAMA` deve representar etapa ou serviço por FK exclusiva, e `DEPENDENCIA_CRONOGRAMA` deve ser a relação canônica. A revisão da configuração congela essas atividades e dependências. Se `DEPENDENCIA_ATIVIDADE` for mantida, deve ser claramente um snapshot ou alias, não uma segunda fonte editável.

Devem existir `CHECK (predecessora_id <> sucessora_id)`, unicidade do par/tipo por revisão e validação de grafo acíclico na transação de aprovação.

### ALTA-06 — A associação de fornecedor precisa de histórico e flexibilidade operacional

**Evidência:** `ETAPA_OBRA` e `SERVICO_OBRA` possuem um `fornecedor_id` direto. O requisito atual exige fornecedor em cada item, mas mudanças durante a obra e fornecedores auxiliares são prováveis.

**Risco:** substituir o fornecedor sobrescreve responsabilidade histórica; permitir mais de um fornecedor depois exigiria quebrar a estrutura.

**Correção recomendada:** criar `ATRIBUICAO_FORNECEDOR_OBRA` com:

- organização, obra, etapa/serviço;
- fornecedor, papel (`principal`, `executor`, `fornecedor_material`, `fiscalização` etc.);
- vigência, status, motivo e revisão de configuração;
- unicidade parcial de um fornecedor principal vigente por item.

O requisito de fornecedor obrigatório deve ser aplicado ao promover a configuração para “ativa/aprovada”. Rascunhos podem permanecer incompletos se a UX precisar disso, mas não podem alimentar contratação ou cronograma aprovado.

### ALTA-07 — A configuração histórica não congela todos os atributos que afetam relatórios

**Evidência:** as tabelas de versão congelam fornecedor, datas, peso e quantidade, mas não todos os nomes, descrições, unidade, categoria, ambiente, centro de custo e regra de restrição da dependência. Catálogos permanecem mutáveis.

**Risco:** alterar o catálogo ou renomear um ambiente muda a apresentação de um relatório antigo, mesmo usando a revisão correta.

**Correção recomendada:** congelar na revisão todos os atributos necessários à reprodução funcional, ou versionar os catálogos e referenciar a versão exata. Para relatórios de prestação de contas, nomes, códigos, unidade, categoria, escopo e fornecedor exibido devem corresponder à data de corte.

### ALTA-08 — Valores monetários e percentuais ainda não possuem precisão física uniforme

**Evidência:** o MER usa o tipo lógico `decimal` sem precisão. `docs/04-dados-api.md` define as precisões necessárias.

**Correção recomendada para o futuro esquema físico:**

- dinheiro final: `numeric(19,2)`;
- quantidade: `numeric(19,4)`;
- preço unitário: `numeric(19,6)`;
- percentuais e fatores: precisão definida e `CHECK` de domínio;
- decimais trafegados pela API como string;
- arredondamento documentado por linha e moeda;
- `CHECK` de 0 a 100 para avanço, peso e percentuais que não aceitam extrapolação.

## 6. Achados de severidade média

### MEDIA-01 — `VERSAO_ESQUEMA_DADOS` não deve ser uma entidade por organização

Migrações físicas são normalmente globais para a instância e controladas pela ferramenta de migração. `organizacao_id` sugere que cada tenant pode estar em uma versão estrutural distinta, o que aumenta muito o risco operacional.

**Recomendação:** manter o histórico de migrações fora do domínio de negócio e global por banco/schema. Configuração gradual por organização deve usar feature flags ou versão de configuração própria, sem fingir que a estrutura física é diferente.

### MEDIA-02 — Campos customizados precisam de checks e versionamento mais fortes

`VALOR_CAMPO_CUSTOMIZADO` possui várias colunas de valor e um `valor_estruturado`.

**Recomendação:**

- garantir exatamente uma coluna de valor não nula conforme `tipo_dado`;
- `UNIQUE` por definição, entidade e vigência quando o campo for monovalorado;
- definir cardinalidade simples/múltipla;
- validar opções e JSON Schema permitido;
- versionar alterações de definição sem reinterpretar valores antigos;
- impedir tipos monetário oficial, FK, aprovação, saldo ou estado crítico;
- usar GIN somente para campos realmente consultados e com formato estável.

### MEDIA-03 — Regras e perfis de aprovação exigem versão temporal

A decisão registra a versão do objeto, mas a regra aplicada também precisa permanecer reproduzível.

**Recomendação:** a solicitação deve referenciar uma versão imutável da regra de aprovação e seus aprovadores/ordem. Mudança de perfil ou alçada não deve alterar a interpretação de uma decisão passada.

### MEDIA-04 — Dados de pagamento do fornecedor devem suportar múltiplas contas

O relacionamento atual é 1:0..1. Um fornecedor pode ter contas distintas, troca de chave PIX e dados com vigência.

**Recomendação:** usar 1:N com finalidade, moeda, principal, vigência, verificação, revogação e trilha restrita. Compra/contrato aprovado deve referenciar a versão de instrução de pagamento usada, sem copiar segredo para auditoria comum.

### MEDIA-05 — Estados livres como `string` precisam de catálogo ou constraints

Há muitos campos `status`, `tipo`, `forma`, `natureza` e `resultado` descritos apenas como string.

**Recomendação:** usar enum de domínio, lookup versionado ou `CHECK` conforme a necessidade de evolução. A escolha deve permitir `expand-contract`: adicionar novo estado, atualizar consumidores e somente depois torná-lo obrigatório. Toda transição crítica precisa de matriz de estados e evento de mudança.

### MEDIA-06 — Unicidades de números devem ser escopadas

`numero UK` em compra, contrato e solicitação não deve ser necessariamente global.

**Recomendação:** definir `UNIQUE (organizacao_id, obra_id, numero)` ou o escopo de negócio correspondente. Para soft delete, usar unicidade parcial somente onde a reutilização for aceita explicitamente.

### MEDIA-07 — Eventos e datas reais precisam de `timestamptz`

Campos como `pago_em`, `recebido_em`, `liberada_em`, `contratada_em` e `aberto_em` aparecem como `date` em pontos que representam um evento auditável.

**Recomendação:** manter `date` para competência/vencimento e usar `timestamptz` para o instante do evento. Registrar fuso da obra/organização apenas para apresentação e conversão.

### MEDIA-08 — Exclusão lógica precisa de política uniforme

O MER afirma que somente rascunhos sem referência podem ser excluídos, mas não padroniza `excluido_em`, `cancelado_em`, `status` e autor/motivo.

**Recomendação:** documentar por agregado se a operação é exclusão física, cancelamento, inativação, supersessão ou reversão. Entidades aprovadas e financeiras nunca devem desaparecer por cascade.

### MEDIA-09 — Auditoria volumosa requer particionamento e retenção

Snapshots e alterações por campo podem crescer rapidamente.

**Recomendação:** planejar particionamento de `EVENTO_AUDITORIA` por período quando o volume justificar, retenção por classe, arquivamento consultável e índices locais. Não particionar prematuramente as tabelas transacionais sem medição.

## 7. Modelo de histórico recomendado

### 7.1 Camada 1 — transação e auditoria técnica

| Entidade | Papel | Mutabilidade |
|---|---|---|
| `TRANSACAO_NEGOCIO` | Correlacionar request, comandos, aprovação e eventos gerados | Encerrada após conclusão; correção por novo registro |
| `EVENTO_AUDITORIA` | Quem, quando, ação, resultado, objeto e versão | Append-only |
| `ALTERACAO_CAMPO` | Diferenças permitidas e sanitizadas | Append-only |
| `EVENTO_ACESSO_RESTRITO` | Download, leitura ou exportação de dado/arquivo restrito | Append-only |

Essa camada serve para investigação e conformidade. Ela não é fonte oficial de orçamento, progresso, saldo ou pagamento.

### 7.2 Camada 2 — histórico temporal de negócio

| Agregado | História recomendada | Fonte oficial da consulta temporal |
|---|---|---|
| Obra | `REVISAO_OBRA` para dados cadastrais relevantes | Revisão aprovada vigente na data de corte |
| Configuração | `REVISAO_CONFIGURACAO_OBRA` + itens e dependências versionados | Revisão aprovada |
| Fornecedores da configuração | `ATRIBUICAO_FORNECEDOR_OBRA` com vigência | Atribuição vigente na revisão/data |
| Catálogos | versão ou snapshot de etapa, serviço, unidade e categoria | versão referenciada pela configuração |
| Cronograma | `BASELINE_CRONOGRAMA` + atividades e dependências congeladas | baseline aprovada |
| Orçamento | `VERSAO_ORCAMENTO` + linhas imutáveis após aprovação | versão baseline/vigente |
| Documentos | `VERSAO_DOCUMENTO` | versão válida e seu arquivo |
| Regras de aprovação | `VERSAO_REGRA_APROVACAO` | versão aplicada à solicitação |
| Infraestrutura, qualidade e pós-obra | eventos de status e revisões quando o estado passado precisar ser reproduzido | evento/revisão de domínio, não snapshot genérico |

Versões aprovadas devem ser imutáveis. Uma correção cria nova revisão vinculada à anterior, com motivo e aprovação quando aplicável.

### 7.3 Camada 3 — eventos financeiros imutáveis

Continuam sendo fonte oficial:

- reconhecimento de custo e reversão;
- obrigação e cancelamento/revisão;
- pagamento, alocação e estorno;
- adiantamento e compensação;
- retenção e liberação;
- aporte, movimento financeiro e reversão;
- aditivo e supressão aprovados.

Não criar uma tabela genérica de histórico financeiro para calcular saldos. O histórico técnico pode apontar para esses eventos, mas saldo e relatório devem ser reconciliados pelas tabelas de domínio.

### 7.4 Estado corrente e concorrência

Entidades mutáveis devem possuir `version bigint`, `criado_em`, `criado_por`, `atualizado_em` e `atualizado_por`. Updates usam lock otimista. Estados aprovados exigem comando explícito de revisão, cancelamento ou reversão; um `UPDATE` comum não pode reescrever seu conteúdo.

## 8. Estratégia de evolução após o início da construção

O modelo deve usar `expand-contract` em cinco passos:

1. **Expandir:** adicionar tabela/coluna/índice compatível, inicialmente opcional ou com default seguro.
2. **Popular:** executar backfill idempotente, em lotes, registrando cursor e erros.
3. **Compatibilizar:** aplicação lê o formato novo e antigo durante a transição; dual-write somente quando indispensável e monitorado.
4. **Verificar:** reconciliar contagens, hashes e valores; medir consultas e confirmar que nenhum consumidor depende do formato antigo.
5. **Contrair:** em migração futura e autorizada, tornar obrigatório, remover leitura antiga e só depois retirar a estrutura anterior.

Regras adicionais:

- migração aplicada nunca é editada;
- alteração de tipo usa coluna paralela quando houver risco de lock ou perda;
- `NOT NULL` e FKs grandes podem ser adicionados como `NOT VALID`, validados depois e então promovidos;
- índices grandes devem usar criação concorrente quando o PostgreSQL e a ferramenta permitirem;
- renomear campo público exige período de compatibilidade da API;
- baselines, versões aprovadas e eventos financeiros não sofrem backfill destrutivo;
- transformação de valor deve guardar regra, versão do transformador e evidência de reconciliação;
- feature flag por organização libera novo comportamento, mas não cria versões físicas diferentes do schema.

## 9. Estratégia de RLS proposta para validação futura

### 9.1 Princípios

- Habilitar e forçar RLS nas tabelas de tenant, incluindo filhas e tabelas de histórico.
- Fixar `app.organizacao_id`, `app.usuario_id` e contexto da requisição com `SET LOCAL` dentro da mesma transação.
- Uma sessão sem contexto válido deve negar acesso.
- A política de obra deve exigir vínculo ativo em `MEMBRO_OBRA`, além do tenant correto.
- Escrita deve usar `WITH CHECK`, não apenas `USING`.
- Relatórios, busca, arquivos, auditoria, exportação e jobs obedecem ao mesmo escopo.
- Funções `SECURITY DEFINER` devem ter `search_path` fixo, entrada validada e escopo mínimo.
- Não declarar RLS testada por acesso feito com `service_role`, proprietário da tabela ou outro papel com bypass.

### 9.2 Matriz mínima de testes RLS

| Cenário | Resultado esperado |
|---|---|
| Membro da organização sem acesso à obra | Zero linhas e nenhuma contagem da obra |
| Membro de outra organização com UUID conhecido | Nenhuma leitura, escrita ou inferência |
| Fornecedor convidado | Apenas objetos explicitamente compartilhados |
| Gestor da obra A tenta vincular fornecedor/conta/arquivo da obra B | FK/RLS rejeita |
| Usuário suspenso no meio da sessão | Próxima transação perde acesso |
| Job assíncrono | Usa contexto de tenant explícito e auditado |
| Leitura de auditoria restrita | Permitida somente ao perfil autorizado e registrada |

## 10. Índices candidatos

Índices devem ser confirmados com consultas reais e `EXPLAIN (ANALYZE, BUFFERS)`. O conjunto inicial recomendado é:

| Área | Índice candidato | Objetivo |
|---|---|---|
| Todas as tabelas de obra | `(organizacao_id, obra_id, id)` | FK composta e escopo RLS |
| Etapas/serviços | `(organizacao_id, obra_id, status, ordem)` | Listagem de configuração |
| Atribuição de fornecedor | `(organizacao_id, obra_id, item_id, vigencia_inicio desc)` | Responsável vigente |
| Dependências | `(organizacao_id, obra_id, predecessora_id)` e `(organizacao_id, obra_id, sucessora_id)` | Travessia do grafo |
| Revisão de configuração | `(organizacao_id, obra_id, valida_de desc)` + exclusão temporal | Consulta `as of` |
| Orçamento | `UNIQUE (organizacao_id, obra_id, numero_versao)` | Versão por obra |
| Baseline | índice único parcial da baseline vigente por obra | Uma baseline ativa |
| Propostas | `(organizacao_id, obra_id, solicitacao_id, fornecedor_id)` | Comparação |
| Compra | `UNIQUE (organizacao_id, obra_id, decisao_proposta_id)` | Efetivação idempotente |
| Obrigações | `(organizacao_id, obra_id, status, vencimento)` | Agenda e inadimplência |
| Obrigações | unicidade parcial por origem/tipo | Evitar duplicidade |
| Pagamentos | `(organizacao_id, obra_id, pago_em)` | Caixa por período |
| Alocações | `(obrigacao_id)` e `UNIQUE (pagamento_id, obrigacao_id, sequencia)` conforme regra | Saldo/reconciliação |
| Reconhecimentos | `(organizacao_id, obra_id, servico_obra_id, data_reconhecimento)` | Executado por escopo |
| Auditoria | `(organizacao_id, obra_id, ocorrido_em desc)` | Linha do tempo |
| Auditoria | `(organizacao_id, tipo_entidade, entidade_id, ocorrido_em desc)` | Histórico do registro |
| Documentos | `(organizacao_id, obra_id, categoria, status)` | Busca autorizada |
| Notificações | `(destinatario_id, lida_em, criada_em desc)` | Caixa interna |

Não indexar todo JSONB por padrão. Campos customizados pesquisáveis devem ter índice por tipo e somente quando a consulta for suportada pelo produto.

## 11. Testes de banco necessários

### 11.1 Integridade estrutural

1. rejeitar FK entre organizações diferentes;
2. rejeitar FK entre obras diferentes da mesma organização;
3. rejeitar etapa/serviço sem fornecedor ao aprovar a configuração;
4. rejeitar dependência consigo mesma, duplicada ou cíclica;
5. rejeitar pesos aprovados cuja soma não seja 100%;
6. rejeitar períodos inválidos e vigências sobrepostas;
7. rejeitar mais de um valor tipado em campo customizado;
8. rejeitar número duplicado no mesmo escopo e permitir em escopo distinto quando previsto.

### 11.2 Histórico e auditoria

1. aprovar uma revisão encerra a anterior e abre a nova no mesmo instante, sem lacuna ou sobreposição;
2. consulta por data de corte reproduz configuração, fornecedor, peso, unidade, categoria e dependências antigas;
3. alteração e auditoria são gravadas na mesma transação ou nenhuma delas é gravada;
4. tentativa negada relevante gera evento sem expor o objeto protegido;
5. update/delete direto em auditoria append-only é negado ao papel da aplicação;
6. snapshots não contêm chave PIX, conta completa, tokens, binários ou dados pessoais não autorizados;
7. nova revisão não altera relatório emitido com data de corte anterior.

### 11.3 Financeiro e concorrência

1. duas efetivações concorrentes da mesma proposta criam uma compra;
2. duas aprovações concorrentes não excedem o compromisso;
3. uma origem gera no máximo um reconhecimento ativo e uma obrigação por tipo;
4. alocações concorrentes não ultrapassam pagamento nem saldo da obrigação;
5. compensações concorrentes não tornam adiantamento negativo;
6. liberações concorrentes não tornam retenção negativa;
7. estorno não ultrapassa o valor reversível;
8. estorno de pagamento reabre a obrigação e não remove o custo reconhecido;
9. compra parcelada reconhece o custo uma vez e distribui apenas o caixa;
10. recomputação pelo ledger coincide com saldos correntes e painéis.

### 11.4 RLS e autorização

Executar testes com papel não privilegiado, fora do proprietário das tabelas e sem bypass. Cobrir leitura, inserção, atualização, exclusão, função, view, materialized view, busca, relatório, arquivo, histórico e exportação.

### 11.5 Migrações `expand-contract`

1. aplicar do zero e sobre base na versão anterior;
2. repetir backfill sem duplicar efeitos;
3. interromper e retomar backfill;
4. validar igualdade entre coluna antiga e nova;
5. manter aplicação anterior funcional durante a fase de expansão acordada;
6. medir lock, tempo e crescimento de índice;
7. restaurar cópia isolada e executar reconciliação após migração.

## 12. Entidades ou relações que precisam ser acrescentadas ou revistas

| Item | Necessidade |
|---|---|
| `OBRA` | Declarar campos, chaves de tenant, versão, datas e estado no próprio MER |
| `REVISAO_OBRA` | Preservar alterações cadastrais que afetam memorial e relatórios |
| `ATRIBUICAO_FORNECEDOR_OBRA` | Suportar troca, papéis e múltiplos fornecedores sem sobrescrever histórico |
| `VERSAO_REGRA_APROVACAO` | Congelar regra e aprovadores aplicados à decisão |
| `EVENTO_ACESSO_RESTRITO` | Registrar leitura/download/exportação de dado protegido |
| origem tipada de compromisso | Eliminar ambiguidade compra versus contrato |
| origem tipada de obrigação | Eliminar ambiguidade medição, recebimento e parcela |
| catálogo versionado ou snapshot completo | Reproduzir configuração e relatório antigos |
| histórico de estado por agregado crítico | Explicar transições sem depender apenas do valor corrente |

## 13. Decisões pendentes

1. Unificar compra e contrato sob uma raiz de compromisso ou manter subtipos separados com regra XOR.
2. Confirmar se uma etapa/serviço aceita vários fornecedores simultâneos e quais papéis existem.
3. Definir se dependência da configuração e do cronograma será uma única entidade canônica.
4. Definir o instante de reconhecimento de comissão e receita comercial.
5. Definir política de retenção para auditoria, documentos, compradores e dados bancários.
6. Definir quais atributos customizados podem ser pesquisados e compartilhados.
7. Definir quando estoque físico entra no escopo; não está coberto pelo modelo atual.
8. Definir se uma venda pode abranger mais de uma obra/unidade.
9. Definir regras de exclusão de rascunho por agregado e prazo de recuperação.
10. Definir a data de corte oficial de cada relatório e o fuso usado na consulta temporal.

## 14. Critérios para segunda revisão

O MER pode avançar para desenho físico quando:

- os três achados críticos estiverem resolvidos no diagrama e nas regras;
- houver uma única definição de auditoria;
- todas as FKs críticas tiverem escopo de organização e obra demonstrado;
- relações financeiras de origem possuírem XOR ou supertipo explícito;
- vigências aprovadas não puderem se sobrepor;
- dependência de etapa/serviço tiver uma única fonte oficial;
- associação de fornecedor preservar substituições e responsabilidades passadas;
- valores derivados tiverem fonte, fórmula e estratégia de reconciliação;
- a matriz RLS e o plano de migração estiverem anexos ao futuro esquema físico.

Até lá, a documentação deve continuar identificada como proposta. Nenhuma proteção, persistência ou reconciliação deve ser declarada como existente.

## 15. Ambiente PostgreSQL disponível para validação futura

Inspeção somente leitura realizada em 22/09/2026:

- PostgreSQL 18.3 instalado como serviço Windows `postgresql-x64-18`, em execução automática, porta 5432.
- PostgreSQL 16.14 instalado como serviço Windows `postgresql-x64-16`, em execução automática, porta 5433.
- Ambos usam autenticação local `scram-sha-256` para IPv4 e IPv6.
- O executável `docker` não está disponível no `PATH` desta sessão e a instalação padrão do Docker Desktop não foi localizada. Existe diretório `C:\ProgramData\DockerDesktop`, mas isso não comprova um engine Docker operacional acessível ao projeto.

Nenhuma conexão autenticada, banco, schema, tabela, role ou migração foi criada ou alterada. Quando a fisicalização for autorizada, deve-se escolher explicitamente PostgreSQL 18 ou 16, usar uma instância isolada de desenvolvimento e executar a matriz de testes deste parecer com papel não privilegiado.
