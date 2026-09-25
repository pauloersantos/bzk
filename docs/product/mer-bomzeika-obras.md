# BOMzeika Obras — Modelo Entidade-Relacionamento

**Versão:** 1.0 para validação  
**Estado:** modelo lógico proposto; não representa tabelas, migrações ou banco implementado  
**Fontes:** especificação funcional consolidada, protótipo navegável e `docs/04-dados-api.md`

## 1. Objetivo e convenções

Este MER organiza as entidades necessárias para administrar várias organizações e obras, mantendo separação entre orçamento, compromisso, execução reconhecida, obrigação e pagamento.

Convenções:

- `UUID` para chaves primárias e estrangeiras.
- Toda entidade de negócio pertence a uma `ORGANIZACAO`.
- Entidades específicas de obra também possuem `obra_id`.
- Valores monetários usam decimal exato; datas de calendário usam `date`; eventos auditáveis usam `timestamptz`.
- `PK` identifica chave primária; `FK`, chave estrangeira; `UK`, unicidade lógica.
- Relações com `||` são obrigatórias e únicas; `o|` são opcionais e únicas; `o{` são opcionais e múltiplas; `|{` são obrigatórias e múltiplas.
- Entidades aprovadas ou com efeito financeiro são corrigidas por revisão, reversão, cancelamento ou estorno, sem exclusão silenciosa.
- Os diagramas exibem os campos necessários para validar identidade e relacionamentos. O catálogo completo de atributos está na especificação funcional.

## 2. Visão geral dos domínios

```mermaid
flowchart LR
    A[Organização e acesso] --> B[Catálogos globais]
    B --> C[Obra e configuração]
    C --> D[Orçamento e propostas]
    D --> E[Compras e contratos]
    E --> F[Execução e recebimentos]
    F --> G[Obrigações e pagamentos]
    C --> H[Cronograma, diário e qualidade]
    C --> I[Documentos e infraestrutura]
    C --> J[Pós-obra, memorial e venda]
    G --> K[Painéis e relatórios]
    H --> K
    I --> K
    J --> K
```

## 3. Organização, usuários e acesso

```mermaid
erDiagram
    ORGANIZACAO ||--o{ OBRA : possui
    ORGANIZACAO ||--o{ MEMBRO_ORGANIZACAO : admite
    USUARIO ||--o{ MEMBRO_ORGANIZACAO : participa
    MEMBRO_ORGANIZACAO ||--o{ MEMBRO_OBRA : recebe_acesso
    OBRA ||--o{ MEMBRO_OBRA : autoriza
    PERFIL ||--o{ MEMBRO_ORGANIZACAO : perfil_geral
    PERFIL ||--o{ MEMBRO_OBRA : perfil_na_obra
    PERFIL ||--o{ PERMISSAO_PERFIL : agrega
    PERMISSAO ||--o{ PERMISSAO_PERFIL : compoe
    ORGANIZACAO ||--o{ REGRA_APROVACAO : configura
    OBRA o|--o{ REGRA_APROVACAO : especializa
    REGRA_APROVACAO ||--o{ SOLICITACAO_APROVACAO : avalia
    SOLICITACAO_APROVACAO ||--o{ DECISAO_APROVACAO : recebe
    USUARIO ||--o{ DECISAO_APROVACAO : decide

    ORGANIZACAO {
        UUID id PK
        string razao_social
        string nome_fantasia
        string documento UK
        string moeda
        string fuso_horario
        string status
    }
    USUARIO {
        UUID id PK
        string nome
        string email UK
        string telefone
        string status
        timestamptz ultimo_acesso
    }
    MEMBRO_ORGANIZACAO {
        UUID id PK
        UUID organizacao_id FK
        UUID usuario_id FK
        UUID perfil_id FK
        date vigencia_inicio
        date vigencia_fim
        string status
    }
    MEMBRO_OBRA {
        UUID id PK
        UUID membro_organizacao_id FK
        UUID obra_id FK
        UUID perfil_id FK
        decimal alcada_opcional
        date vigencia_inicio
        date vigencia_fim
        string status
    }
    PERFIL {
        UUID id PK
        UUID organizacao_id FK
        string nome
        string escopo
        boolean sistema
    }
    PERMISSAO {
        UUID id PK
        string codigo UK
        string recurso
        string acao
    }
    PERMISSAO_PERFIL {
        UUID perfil_id PK,FK
        UUID permissao_id PK,FK
        boolean permitido
    }
    REGRA_APROVACAO {
        UUID id PK
        UUID organizacao_id FK
        UUID obra_id FK
        string tipo_operacao
        decimal valor_inicial
        decimal valor_final
        int quantidade_aprovadores
        boolean segregar_solicitante
        string status
    }
    SOLICITACAO_APROVACAO {
        UUID id PK
        UUID regra_aprovacao_id FK
        UUID obra_id FK
        string tipo_objeto
        UUID objeto_id
        decimal valor_referencia
        int versao_objeto
        string status
    }
    DECISAO_APROVACAO {
        UUID id PK
        UUID solicitacao_id FK
        UUID aprovador_id FK
        string decisao
        string justificativa
        timestamptz decidida_em
    }
```

### Regras para validação

1. Participar da organização não concede acesso automático a todas as obras.
2. `MEMBRO_OBRA` deve referenciar um membro da mesma organização da obra.
3. Valores e quantidades de aprovadores são configuráveis; não existem alçadas fixas no modelo.
4. A decisão registra a versão exata do objeto submetido.

## 4. Catálogos, fornecedores e configuração da obra

```mermaid
erDiagram
    ORGANIZACAO ||--o{ ETAPA_CATALOGO : define
    ETAPA_CATALOGO o|--o{ ETAPA_CATALOGO : etapa_pai
    ETAPA_CATALOGO ||--o{ SERVICO_CATALOGO : contem
    UNIDADE_MEDIDA ||--o{ SERVICO_CATALOGO : mede
    CATEGORIA_CUSTO ||--o{ SERVICO_CATALOGO : classifica
    ORGANIZACAO ||--o{ FORNECEDOR : cadastra
    FORNECEDOR ||--o{ CONTATO_FORNECEDOR : possui
    FORNECEDOR ||--o| DADO_PAGAMENTO_FORNECEDOR : possui_restrito
    FORNECEDOR ||--o{ ESPECIALIDADE_FORNECEDOR : atua
    ESPECIALIDADE ||--o{ ESPECIALIDADE_FORNECEDOR : classifica
    OBRA ||--o{ AMBIENTE : divide
    OBRA ||--o{ CENTRO_CUSTO : organiza
    OBRA ||--o{ ETAPA_OBRA : configura
    ETAPA_CATALOGO ||--o{ ETAPA_OBRA : origina
    ETAPA_OBRA ||--o{ SERVICO_OBRA : contem
    SERVICO_CATALOGO ||--o{ SERVICO_OBRA : origina
    FORNECEDOR o|--o{ ETAPA_OBRA : responsavel
    FORNECEDOR o|--o{ SERVICO_OBRA : executa
    AMBIENTE o|--o{ SERVICO_OBRA : localiza
    CENTRO_CUSTO o|--o{ SERVICO_OBRA : contabiliza
    ETAPA_OBRA ||--o{ DEPENDENCIA_ATIVIDADE : sucessora
    ETAPA_OBRA ||--o{ DEPENDENCIA_ATIVIDADE : predecessora

    ETAPA_CATALOGO {
        UUID id PK
        UUID organizacao_id FK
        UUID etapa_pai_id FK
        string codigo
        string nome
        string descricao
        int ordem
        string status
    }
    SERVICO_CATALOGO {
        UUID id PK
        UUID etapa_catalogo_id FK
        UUID unidade_id FK
        UUID categoria_custo_id FK
        string codigo
        string nome
        string descricao_escopo
        decimal peso_padrao
        int prazo_padrao_dias
        string criterio_avanco
        string status
    }
    UNIDADE_MEDIDA {
        UUID id PK
        UUID organizacao_id FK
        string codigo UK
        string nome
        int casas_decimais
    }
    CATEGORIA_CUSTO {
        UUID id PK
        UUID organizacao_id FK
        string codigo
        string nome
        string grupo
    }
    FORNECEDOR {
        UUID id PK
        UUID organizacao_id FK
        string tipo_pessoa
        string razao_social
        string nome_fantasia
        string cpf_cnpj
        string inscricao_estadual
        int prazo_medio_dias
        decimal avaliacao
        string status
    }
    CONTATO_FORNECEDOR {
        UUID id PK
        UUID fornecedor_id FK
        string nome
        string funcao
        string email
        string telefone
        boolean principal
    }
    DADO_PAGAMENTO_FORNECEDOR {
        UUID id PK
        UUID fornecedor_id FK
        string banco_protegido
        string agencia_protegida
        string conta_protegida
        string chave_pix_protegida
        string status_validacao
    }
    ESPECIALIDADE {
        UUID id PK
        UUID organizacao_id FK
        string nome
    }
    ESPECIALIDADE_FORNECEDOR {
        UUID fornecedor_id PK,FK
        UUID especialidade_id PK,FK
        boolean principal
    }
    AMBIENTE {
        UUID id PK
        UUID obra_id FK
        UUID ambiente_pai_id FK
        string nome
        string tipo
        decimal area_m2
    }
    CENTRO_CUSTO {
        UUID id PK
        UUID obra_id FK
        string codigo
        string nome
        string status
    }
    ETAPA_OBRA {
        UUID id PK
        UUID obra_id FK
        UUID etapa_catalogo_id FK
        UUID fornecedor_id FK
        int ordem
        date inicio_planejado
        date fim_planejado
        decimal peso_fisico
        decimal percentual_conclusao
        string status
    }
    SERVICO_OBRA {
        UUID id PK
        UUID etapa_obra_id FK
        UUID servico_catalogo_id FK
        UUID fornecedor_id FK
        UUID ambiente_id FK
        UUID centro_custo_id FK
        decimal quantidade
        string unidade_snapshot
        decimal peso_fisico
        string criterio_avanco
        string status
    }
    DEPENDENCIA_ATIVIDADE {
        UUID id PK
        UUID obra_id FK
        UUID predecessora_id FK
        UUID sucessora_id FK
        string tipo
        int defasagem_dias
        string motivo
    }
```

### Regras para validação

1. Cada etapa e serviço configurado deve estar vinculado à obra e, antes de contratação, a um fornecedor responsável.
2. A dependência não pode formar ciclo nem ligar atividades de obras diferentes.
3. O sucessor é obtido pela relação cuja atividade atual é predecessora; não deve existir campo textual divergente.
4. A soma dos pesos da baseline ativa deve ser 100%; caso contrário, o avanço é “não calculável”.
5. Alterar pesos após início da execução cria nova baseline e preserva a anterior.

## 5. Planejamento, progresso e baseline

```mermaid
erDiagram
    OBRA ||--o{ BASELINE_CRONOGRAMA : possui
    BASELINE_CRONOGRAMA ||--o{ ATIVIDADE_BASELINE : congela
    ETAPA_OBRA ||--o{ ATIVIDADE_CRONOGRAMA : representa
    SERVICO_OBRA o|--o{ ATIVIDADE_CRONOGRAMA : detalha
    ATIVIDADE_CRONOGRAMA ||--o{ DEPENDENCIA_CRONOGRAMA : sucessora
    ATIVIDADE_CRONOGRAMA ||--o{ DEPENDENCIA_CRONOGRAMA : predecessora
    ATIVIDADE_CRONOGRAMA ||--o{ EVENTO_PROGRESSO : recebe
    USUARIO ||--o{ EVENTO_PROGRESSO : registra

    BASELINE_CRONOGRAMA {
        UUID id PK
        UUID obra_id FK
        int versao
        string status
        timestamptz aprovada_em
        UUID aprovada_por FK
    }
    ATIVIDADE_BASELINE {
        UUID id PK
        UUID baseline_id FK
        UUID atividade_id FK
        date inicio_planejado
        date fim_planejado
        decimal peso_fisico
        decimal desembolso_previsto
    }
    ATIVIDADE_CRONOGRAMA {
        UUID id PK
        UUID obra_id FK
        UUID etapa_obra_id FK
        UUID servico_obra_id FK
        string nome
        date inicio_planejado
        date fim_planejado
        date inicio_real
        date fim_real
        decimal percentual_conclusao
        string risco_atraso
        string status
    }
    DEPENDENCIA_CRONOGRAMA {
        UUID id PK
        UUID predecessora_id FK
        UUID sucessora_id FK
        string tipo
        int defasagem_dias
    }
    EVENTO_PROGRESSO {
        UUID id PK
        UUID atividade_id FK
        UUID usuario_id FK
        date data_referencia
        decimal percentual_anterior
        decimal percentual_novo
        string justificativa
        UUID evidencia_id FK
    }
```

## 6. Orçamento, cenários e contingência

```mermaid
erDiagram
    OBRA ||--o{ VERSAO_ORCAMENTO : possui
    VERSAO_ORCAMENTO ||--o{ LINHA_ORCAMENTO : contem
    VERSAO_ORCAMENTO o|--o{ VERSAO_ORCAMENTO : revisa
    SERVICO_OBRA ||--o{ LINHA_ORCAMENTO : orca
    FORNECEDOR o|--o{ LINHA_ORCAMENTO : referencia
    CATEGORIA_CUSTO ||--o{ LINHA_ORCAMENTO : classifica
    VERSAO_ORCAMENTO ||--o{ EVENTO_CONTINGENCIA : controla
    LINHA_ORCAMENTO ||--o{ ESTIMATIVA_RESTANTE : estima

    VERSAO_ORCAMENTO {
        UUID id PK
        UUID obra_id FK
        UUID versao_anterior_id FK
        int numero_versao
        string nome
        string cenario
        string status
        decimal total_servicos
        decimal reserva_contingencia
        timestamptz congelada_em
    }
    LINHA_ORCAMENTO {
        UUID id PK
        UUID versao_orcamento_id FK
        UUID servico_obra_id FK
        UUID fornecedor_id FK
        UUID categoria_custo_id FK
        decimal quantidade
        decimal custo_unitario
        decimal frete
        decimal impostos
        decimal desconto
        decimal perdas
        decimal total
        string forma_pagamento_prevista
    }
    EVENTO_CONTINGENCIA {
        UUID id PK
        UUID versao_orcamento_id FK
        UUID linha_destino_id FK
        string tipo
        decimal valor
        string justificativa
        string status
    }
    ESTIMATIVA_RESTANTE {
        UUID id PK
        UUID obra_id FK
        UUID linha_orcamento_id FK
        date data_referencia
        decimal valor
        string escopo_coberto
        string status
    }
```

### Regras para validação

1. Somente uma versão pode ser a baseline vigente da obra em uma data de corte.
2. Aprovar revisão não sobrescreve a versão anterior.
3. Cada estimativa restante declara o escopo coberto para não sobrepor contratos ou custos executados.
4. Eventos de contingência preservam saldo anterior, destino, justificativa e aprovação.

## 7. Propostas, compras, contratos e compromissos

```mermaid
erDiagram
    OBRA ||--o{ SOLICITACAO_COMPRA : solicita
    SOLICITACAO_COMPRA ||--|{ ITEM_SOLICITACAO : contem
    LINHA_ORCAMENTO ||--o{ ITEM_SOLICITACAO : origina
    SOLICITACAO_COMPRA ||--o{ PROPOSTA : recebe
    FORNECEDOR ||--o{ PROPOSTA : envia
    PROPOSTA ||--|{ ITEM_PROPOSTA : detalha
    ITEM_SOLICITACAO ||--o{ ITEM_PROPOSTA : responde
    SOLICITACAO_COMPRA ||--o| DECISAO_PROPOSTA : seleciona
    PROPOSTA ||--o| DECISAO_PROPOSTA : escolhida
    DECISAO_PROPOSTA ||--o| COMPRA : efetiva
    COMPRA ||--|{ ITEM_COMPRA : contem
    FORNECEDOR ||--o{ COMPRA : fornece
    OBRA ||--o{ CONTRATO : contrata
    FORNECEDOR ||--o{ CONTRATO : contratado
    CONTRATO ||--|{ LINHA_COMPROMISSO : contem
    ITEM_COMPRA o|--o{ LINHA_COMPROMISSO : compromete
    SERVICO_OBRA ||--o{ LINHA_COMPROMISSO : cobre
    CONTRATO ||--o{ ADITIVO : altera
    ADITIVO ||--|{ LINHA_ADITIVO : detalha
    LINHA_COMPROMISSO ||--o{ LINHA_ADITIVO : ajusta
    COMPRA ||--|{ PARCELA_PREVISTA : programa
    CONTRATO ||--o{ PARCELA_PREVISTA : programa

    SOLICITACAO_COMPRA {
        UUID id PK
        UUID obra_id FK
        string numero UK
        string finalidade
        date data_limite
        string status
    }
    ITEM_SOLICITACAO {
        UUID id PK
        UUID solicitacao_id FK
        UUID linha_orcamento_id FK
        string descricao_escopo
        decimal quantidade
        string unidade
    }
    PROPOSTA {
        UUID id PK
        UUID solicitacao_id FK
        UUID fornecedor_id FK
        string numero_fornecedor
        date validade
        int prazo_entrega_dias
        string garantia
        string condicao_pagamento
        decimal total
        string status
    }
    ITEM_PROPOSTA {
        UUID id PK
        UUID proposta_id FK
        UUID item_solicitacao_id FK
        string marca_modelo
        decimal quantidade
        decimal preco_unitario
        decimal frete
        decimal impostos
        decimal desconto
        decimal total
        string exclusoes
    }
    DECISAO_PROPOSTA {
        UUID id PK
        UUID solicitacao_id FK
        UUID proposta_id FK
        string justificativa
        decimal economia_calculada
        string status
        UUID aprovacao_id FK
    }
    COMPRA {
        UUID id PK
        UUID obra_id FK
        UUID decisao_proposta_id FK
        UUID fornecedor_id FK
        string numero UK
        date data_pedido
        date entrega_prevista
        decimal valor_total
        string status
    }
    ITEM_COMPRA {
        UUID id PK
        UUID compra_id FK
        UUID item_proposta_id FK
        UUID servico_obra_id FK
        decimal quantidade
        decimal valor_total
        decimal quantidade_recebida
    }
    CONTRATO {
        UUID id PK
        UUID obra_id FK
        UUID fornecedor_id FK
        string numero UK
        string tipo
        decimal valor_original
        decimal retencao_percentual
        date inicio
        date fim
        string status
    }
    LINHA_COMPROMISSO {
        UUID id PK
        UUID contrato_id FK
        UUID item_compra_id FK
        UUID servico_obra_id FK
        decimal quantidade_autorizada
        decimal valor_autorizado
        decimal valor_executado
        string status
    }
    ADITIVO {
        UUID id PK
        UUID contrato_id FK
        string tipo
        string motivo
        decimal valor_total
        int impacto_prazo_dias
        string status
    }
    LINHA_ADITIVO {
        UUID id PK
        UUID aditivo_id FK
        UUID linha_compromisso_id FK
        decimal quantidade_delta
        decimal valor_delta
    }
    PARCELA_PREVISTA {
        UUID id PK
        UUID compra_id FK
        UUID contrato_id FK
        int numero
        date vencimento
        decimal valor_previsto
        string tipo
        string status
    }
```

### Regras para validação

1. A efetivação usa uma chave idempotente e cria no máximo uma compra para a mesma decisão aprovada.
2. A proposta escolhida não precisa ser a de menor preço, mas exige justificativa de custo-benefício.
3. A compra conserva vínculo com proposta, solicitação e orçamento de origem.
4. Aditivo aprovado altera o compromisso atualizado; rascunho ou rejeitado não altera totais.
5. Supressão não reduz limite abaixo do valor já executado sem procedimento explícito de reversão ou encerramento.

## 8. Execução, recebimentos, obrigações e pagamentos

```mermaid
erDiagram
    LINHA_COMPROMISSO ||--o{ LINHA_MEDICAO : medida
    MEDICAO ||--|{ LINHA_MEDICAO : contem
    OBRA ||--o{ MEDICAO : possui
    COMPRA ||--o{ RECEBIMENTO : recebe
    RECEBIMENTO ||--|{ ITEM_RECEBIMENTO : contem
    ITEM_COMPRA ||--o{ ITEM_RECEBIMENTO : confirma
    LINHA_MEDICAO ||--o| RECONHECIMENTO_CUSTO : reconhece
    ITEM_RECEBIMENTO ||--o| RECONHECIMENTO_CUSTO : reconhece
    RECONHECIMENTO_CUSTO ||--o{ REVERSAO_RECONHECIMENTO : reverte
    MEDICAO o|--o{ OBRIGACAO : origina
    RECEBIMENTO o|--o{ OBRIGACAO : origina
    PARCELA_PREVISTA o|--o{ OBRIGACAO : converte
    OBRIGACAO ||--|{ LINHA_OBRIGACAO : detalha
    PAGAMENTO ||--|{ ALOCACAO_PAGAMENTO : distribui
    OBRIGACAO ||--o{ ALOCACAO_PAGAMENTO : liquida
    PAGAMENTO ||--o{ ESTORNO_PAGAMENTO : estorna
    FORNECEDOR ||--o{ ADIANTAMENTO : recebe
    ADIANTAMENTO ||--o{ COMPENSACAO_ADIANTAMENTO : compensa
    OBRIGACAO ||--o{ COMPENSACAO_ADIANTAMENTO : recebe
    LINHA_MEDICAO ||--o{ RETENCAO : gera
    RETENCAO ||--o{ LIBERACAO_RETENCAO : libera
    OBRIGACAO o|--o{ LIBERACAO_RETENCAO : paga

    MEDICAO {
        UUID id PK
        UUID obra_id FK
        UUID contrato_id FK
        date periodo_inicio
        date periodo_fim
        string criterio
        decimal valor_bruto
        decimal retencao
        decimal compensacao_adiantamento
        decimal valor_liquido
        string status
    }
    LINHA_MEDICAO {
        UUID id PK
        UUID medicao_id FK
        UUID linha_compromisso_id FK
        decimal quantidade_periodo
        decimal percentual_periodo
        decimal valor_bruto
        decimal retencao
        decimal valor_aprovado
    }
    RECEBIMENTO {
        UUID id PK
        UUID compra_id FK
        date recebido_em
        string tipo
        string conferencia
        string status
    }
    ITEM_RECEBIMENTO {
        UUID id PK
        UUID recebimento_id FK
        UUID item_compra_id FK
        decimal quantidade_recebida
        decimal quantidade_aprovada
        decimal valor_reconhecido
        string resultado
    }
    RECONHECIMENTO_CUSTO {
        UUID id PK
        UUID obra_id FK
        UUID linha_medicao_id FK
        UUID item_recebimento_id FK
        UUID servico_obra_id FK
        date data_reconhecimento
        decimal valor
        string tipo_origem
        string status
    }
    REVERSAO_RECONHECIMENTO {
        UUID id PK
        UUID reconhecimento_id FK
        decimal valor
        string motivo
        timestamptz revertido_em
    }
    OBRIGACAO {
        UUID id PK
        UUID obra_id FK
        UUID fornecedor_id FK
        UUID medicao_id FK
        UUID recebimento_id FK
        UUID parcela_prevista_id FK
        date competencia
        date vencimento
        decimal valor_bruto
        decimal deducoes
        decimal valor_liquido
        decimal saldo
        string status
    }
    LINHA_OBRIGACAO {
        UUID id PK
        UUID obrigacao_id FK
        UUID servico_obra_id FK
        string tipo
        decimal valor
    }
    PAGAMENTO {
        UUID id PK
        UUID obra_id FK
        UUID conta_financeira_id FK
        date pago_em
        string forma
        decimal valor
        string idempotency_key UK
        string status
    }
    ALOCACAO_PAGAMENTO {
        UUID id PK
        UUID pagamento_id FK
        UUID obrigacao_id FK
        decimal valor_alocado
    }
    ESTORNO_PAGAMENTO {
        UUID id PK
        UUID pagamento_id FK
        decimal valor
        string motivo
        timestamptz estornado_em
    }
    ADIANTAMENTO {
        UUID id PK
        UUID obra_id FK
        UUID fornecedor_id FK
        UUID compra_id FK
        decimal valor_original
        decimal saldo
        string status
    }
    COMPENSACAO_ADIANTAMENTO {
        UUID id PK
        UUID adiantamento_id FK
        UUID obrigacao_id FK
        decimal valor
        timestamptz compensado_em
    }
    RETENCAO {
        UUID id PK
        UUID linha_medicao_id FK
        decimal valor_original
        decimal saldo
        date liberacao_prevista
        string status
    }
    LIBERACAO_RETENCAO {
        UUID id PK
        UUID retencao_id FK
        UUID obrigacao_id FK
        decimal valor
        date liberada_em
    }
```

### Regras para validação

1. Medições acumuladas não podem exceder o compromisso autorizado atualizado.
2. Cada linha de medição ou recebimento aprovado gera no máximo um reconhecimento de custo ativo.
3. Cada origem financeira gera no máximo uma obrigação correspondente por tipo.
4. Uma obrigação pode receber pagamentos parciais; um pagamento pode liquidar várias obrigações.
5. A soma das alocações não pode exceder o pagamento líquido nem o saldo das obrigações.
6. Estorno reduz o pago líquido e reabre saldo da obrigação, mas não estorna automaticamente o custo reconhecido.
7. Compensação não excede o saldo do adiantamento nem o valor elegível da obrigação.
8. Liberação de retenção não reconhece novamente o custo.

## 9. Contas e movimentos financeiros

```mermaid
erDiagram
    ORGANIZACAO ||--o{ CONTA_FINANCEIRA : possui
    OBRA ||--o{ MOVIMENTO_FINANCEIRO : movimenta
    CONTA_FINANCEIRA ||--o{ MOVIMENTO_FINANCEIRO : registra
    PAGAMENTO o|--o{ MOVIMENTO_FINANCEIRO : desembolsa
    APORTE o|--o{ MOVIMENTO_FINANCEIRO : ingressa
    MOVIMENTO_FINANCEIRO ||--o{ REVERSAO_MOVIMENTO : reverte

    CONTA_FINANCEIRA {
        UUID id PK
        UUID organizacao_id FK
        string nome
        string tipo
        string instituicao
        string identificacao_protegida
        string status
    }
    APORTE {
        UUID id PK
        UUID obra_id FK
        UUID participante_id FK
        date previsto_em
        date realizado_em
        decimal valor_previsto
        decimal valor_realizado
        string status
    }
    MOVIMENTO_FINANCEIRO {
        UUID id PK
        UUID obra_id FK
        UUID conta_financeira_id FK
        UUID pagamento_id FK
        UUID aporte_id FK
        string natureza
        date data_movimento
        date competencia
        decimal valor
        string status
    }
    REVERSAO_MOVIMENTO {
        UUID id PK
        UUID movimento_id FK
        decimal valor
        string motivo
        timestamptz revertido_em
    }
```

## 10. Diário, qualidade, mudanças e infraestrutura

```mermaid
erDiagram
    OBRA ||--o{ DIARIO_OBRA : possui
    ETAPA_OBRA ||--o{ DIARIO_OBRA : registra
    AMBIENTE o|--o{ DIARIO_OBRA : localiza
    DIARIO_OBRA ||--o{ EQUIPE_DIARIO : informa
    DIARIO_OBRA ||--o{ EVIDENCIA : anexa
    OBRA ||--o{ INSPECAO : inspeciona
    ETAPA_OBRA ||--o{ INSPECAO : verifica
    INSPECAO ||--o{ PENDENCIA_QUALIDADE : identifica
    PENDENCIA_QUALIDADE ||--o{ EVIDENCIA : comprova
    OBRA ||--o{ SOLICITACAO_MUDANCA : solicita
    SOLICITACAO_MUDANCA ||--o{ IMPACTO_MUDANCA : avalia
    SOLICITACAO_MUDANCA ||--o{ ESPECIFICACAO_ACABAMENTO : altera
    OBRA ||--o{ ITEM_INFRAESTRUTURA : requer
    FORNECEDOR o|--o{ ITEM_INFRAESTRUTURA : atende
    ITEM_INFRAESTRUTURA ||--o{ EVIDENCIA : documenta

    DIARIO_OBRA {
        UUID id PK
        UUID obra_id FK
        UUID etapa_obra_id FK
        UUID ambiente_id FK
        date data
        string clima
        string servicos_realizados
        string ocorrencias
        string impedimentos
        UUID responsavel_id FK
    }
    EQUIPE_DIARIO {
        UUID id PK
        UUID diario_id FK
        UUID fornecedor_id FK
        string funcao
        int quantidade_pessoas
        decimal horas
    }
    INSPECAO {
        UUID id PK
        UUID obra_id FK
        UUID etapa_obra_id FK
        string tipo
        date data
        string resultado
        UUID responsavel_id FK
        string status
    }
    PENDENCIA_QUALIDADE {
        UUID id PK
        UUID inspecao_id FK
        string descricao
        string severidade
        UUID responsavel_id FK
        date prazo
        string status
        date aceita_em
    }
    SOLICITACAO_MUDANCA {
        UUID id PK
        UUID obra_id FK
        string descricao
        string justificativa
        UUID solicitante_id FK
        string status
    }
    IMPACTO_MUDANCA {
        UUID id PK
        UUID solicitacao_mudanca_id FK
        string dimensao
        decimal impacto_custo
        int impacto_prazo_dias
        string impacto_escopo
    }
    ESPECIFICACAO_ACABAMENTO {
        UUID id PK
        UUID obra_id FK
        UUID solicitacao_mudanca_id FK
        UUID ambiente_id FK
        string item
        string marca
        string modelo
        int versao
        string status
    }
    ITEM_INFRAESTRUTURA {
        UUID id PK
        UUID obra_id FK
        UUID fornecedor_id FK
        string tipo
        string protocolo
        date solicitada_em
        date prazo_previsto
        decimal custo_previsto
        decimal custo_realizado
        string status
    }
    EVIDENCIA {
        UUID id PK
        UUID obra_id FK
        string tipo_entidade
        UUID entidade_id
        UUID arquivo_id FK
        string legenda
        date data_referencia
    }
```

## 11. Documentos, versões, comentários e notificações

```mermaid
erDiagram
    ORGANIZACAO ||--o{ DOCUMENTO : possui
    OBRA o|--o{ DOCUMENTO : contextualiza
    DOCUMENTO ||--|{ VERSAO_DOCUMENTO : versiona
    ARQUIVO_PRIVADO ||--o{ VERSAO_DOCUMENTO : armazena
    DOCUMENTO ||--o{ VINCULO_DOCUMENTO : relaciona
    DOCUMENTO ||--o{ COMENTARIO_DOCUMENTO : recebe
    USUARIO ||--o{ COMENTARIO_DOCUMENTO : escreve
    USUARIO ||--o{ NOTIFICACAO : recebe
    DOCUMENTO o|--o{ NOTIFICACAO : origina

    DOCUMENTO {
        UUID id PK
        UUID organizacao_id FK
        UUID obra_id FK
        string categoria
        string titulo
        string codigo
        string nivel_acesso
        string status
        UUID versao_vigente_id FK
    }
    VERSAO_DOCUMENTO {
        UUID id PK
        UUID documento_id FK
        UUID arquivo_id FK
        int numero_versao
        string revisao
        date data_documento
        date validade
        string status
    }
    ARQUIVO_PRIVADO {
        UUID id PK
        UUID organizacao_id FK
        string chave_armazenamento
        string nome_original
        string mime_type
        bigint tamanho_bytes
        string hash
        string status_analise
    }
    VINCULO_DOCUMENTO {
        UUID id PK
        UUID documento_id FK
        string tipo_entidade
        UUID entidade_id
    }
    COMENTARIO_DOCUMENTO {
        UUID id PK
        UUID documento_id FK
        UUID versao_documento_id FK
        UUID autor_id FK
        string texto
        timestamptz criado_em
        string status
    }
    NOTIFICACAO {
        UUID id PK
        UUID usuario_id FK
        UUID obra_id FK
        UUID documento_id FK
        string evento
        string titulo
        string mensagem
        timestamptz criada_em
        timestamptz lida_em
    }
```

## 12. Pós-obra, garantias, memorial e venda

```mermaid
erDiagram
    OBRA ||--o{ ITEM_ENTREGA : verifica
    ITEM_ENTREGA ||--o{ EVIDENCIA_ENTREGA : comprova
    ITEM_ENTREGA ||--o{ GARANTIA : origina
    GARANTIA ||--o{ PLANO_MANUTENCAO : programa
    GARANTIA ||--o{ CHAMADO_POS_OBRA : atende
    OBRA ||--o| CONFIGURACAO_MEMORIAL : configura
    CONFIGURACAO_MEMORIAL ||--o{ MEMORIAL_GERADO : gera
    MEMORIAL_GERADO ||--o{ COMPARTILHAMENTO_MEMORIAL : compartilha
    OBRA ||--o{ OFERTA_IMOVEL : oferece
    OFERTA_IMOVEL ||--o{ CAMPANHA_COMERCIAL : divulga
    CAMPANHA_COMERCIAL ||--o{ CUSTO_COMERCIAL : gera
    OFERTA_IMOVEL ||--o{ PROPOSTA_VENDA : recebe
    INTERESSADO_COMPRADOR ||--o{ PROPOSTA_VENDA : apresenta
    PROPOSTA_VENDA ||--o| VENDA : converte
    VENDA ||--o{ COMISSAO_VENDA : remunera
    PARTICIPANTE_COMERCIAL ||--o{ COMISSAO_VENDA : recebe
    OBRA ||--o{ SOLICITACAO_RELATORIO : gera

    ITEM_ENTREGA {
        UUID id PK
        UUID obra_id FK
        UUID etapa_obra_id FK
        string tipo
        string descricao
        UUID responsavel_id FK
        date prazo
        string status
        date aceita_em
    }
    EVIDENCIA_ENTREGA {
        UUID id PK
        UUID item_entrega_id FK
        UUID arquivo_id FK
        string legenda
        date registrada_em
    }
    GARANTIA {
        UUID id PK
        UUID obra_id FK
        UUID item_entrega_id FK
        UUID fornecedor_id FK
        string item_garantido
        date inicio
        date fim
        string condicoes
        string status
    }
    PLANO_MANUTENCAO {
        UUID id PK
        UUID garantia_id FK
        string atividade
        string periodicidade
        date proxima_execucao
        UUID responsavel_id FK
        string status
    }
    CHAMADO_POS_OBRA {
        UUID id PK
        UUID garantia_id FK
        string descricao
        string prioridade
        date aberto_em
        date concluido_em
        string status
    }
    CONFIGURACAO_MEMORIAL {
        UUID id PK
        UUID obra_id FK
        boolean incluir_financeiro
        boolean incluir_imagens
        boolean incluir_documentos
        string nivel_detalhe
    }
    MEMORIAL_GERADO {
        UUID id PK
        UUID configuracao_id FK
        UUID arquivo_id FK
        date data_corte
        string filtros_json
        string status
        timestamptz gerado_em
    }
    COMPARTILHAMENTO_MEMORIAL {
        UUID id PK
        UUID memorial_id FK
        UUID destinatario_id FK
        string token_hash
        timestamptz expira_em
        timestamptz revogado_em
    }
    OFERTA_IMOVEL {
        UUID id PK
        UUID obra_id FK
        decimal preco_anuncio
        date inicio_divulgacao
        string descricao_comercial
        string status
    }
    PARTICIPANTE_COMERCIAL {
        UUID id PK
        UUID organizacao_id FK
        string tipo
        string nome
        string documento
        string contato
        string status
    }
    CAMPANHA_COMERCIAL {
        UUID id PK
        UUID oferta_id FK
        UUID participante_id FK
        string canal
        date inicio
        date fim
        decimal orcamento
        string status
    }
    CUSTO_COMERCIAL {
        UUID id PK
        UUID campanha_id FK
        UUID participante_id FK
        string categoria
        decimal valor_previsto
        decimal valor_realizado
        date competencia
        string status
    }
    INTERESSADO_COMPRADOR {
        UUID id PK
        UUID organizacao_id FK
        string nome_protegido
        string documento_protegido
        string contato_protegido
        string status
    }
    PROPOSTA_VENDA {
        UUID id PK
        UUID oferta_id FK
        UUID interessado_id FK
        UUID corretora_id FK
        decimal valor
        date apresentada_em
        date validade
        string forma_pagamento
        string status
    }
    VENDA {
        UUID id PK
        UUID proposta_venda_id FK
        decimal preco_venda
        date contratada_em
        date recebimento_previsto
        string status
    }
    COMISSAO_VENDA {
        UUID id PK
        UUID venda_id FK
        UUID participante_id FK
        decimal percentual
        decimal valor_previsto
        decimal valor_pago
        string status
    }
    SOLICITACAO_RELATORIO {
        UUID id PK
        UUID obra_id FK
        string tipo
        date data_corte
        string filtros_json
        UUID arquivo_id FK
        string status
    }
```

### Regras para validação

1. Custos de marketing, corretagem e comissões são custos comerciais, separados do custo de construção.
2. O memorial é um artefato derivado, com data de corte e filtros; não substitui os registros de origem.
3. Compartilhamentos possuem prazo, destinatário e possibilidade de revogação.
4. Dados do comprador são restritos e não aparecem em buscas ou exportações sem permissão.
5. Garantia preserva fornecedor, item, período e documentos mesmo após seu vencimento.

## 13. Controle, auditoria e idempotência

```mermaid
erDiagram
    ORGANIZACAO ||--o{ EVENTO_AUDITORIA : registra
    OBRA o|--o{ EVENTO_AUDITORIA : contextualiza
    USUARIO ||--o{ EVENTO_AUDITORIA : executa
    ORGANIZACAO ||--o{ REGISTRO_IDEMPOTENCIA : protege
    OBRA o|--o{ REGISTRO_IDEMPOTENCIA : contextualiza
    ORGANIZACAO ||--o{ TAREFA_OUTBOX : publica
    USUARIO ||--o{ FILTRO_SALVO : salva
    OBRA o|--o{ FILTRO_SALVO : contextualiza
    ORGANIZACAO ||--o{ LOTE_IMPORTACAO : importa
    LOTE_IMPORTACAO ||--|{ LINHA_IMPORTACAO : valida

    EVENTO_AUDITORIA {
        UUID id PK
        UUID organizacao_id FK
        UUID obra_id FK
        UUID usuario_id FK
        string acao
        string tipo_entidade
        UUID entidade_id
        int versao_anterior
        int versao_nova
        string motivo
        string request_id
        timestamptz ocorrido_em
    }
    REGISTRO_IDEMPOTENCIA {
        UUID id PK
        UUID organizacao_id FK
        UUID obra_id FK
        UUID usuario_id FK
        string operacao
        string chave UK
        string hash_requisicao
        string resposta_referencia
        timestamptz criado_em
    }
    TAREFA_OUTBOX {
        UUID id PK
        UUID organizacao_id FK
        string tipo_evento
        UUID agregado_id
        string payload_json
        int tentativas
        timestamptz proxima_tentativa
        string status
    }
    FILTRO_SALVO {
        UUID id PK
        UUID usuario_id FK
        UUID obra_id FK
        string tela
        string nome
        string criterios_json
        boolean compartilhado
    }
    LOTE_IMPORTACAO {
        UUID id PK
        UUID organizacao_id FK
        UUID obra_id FK
        string tipo
        string template_versao
        string hash_arquivo
        string status
    }
    LINHA_IMPORTACAO {
        UUID id PK
        UUID lote_id FK
        int numero_linha
        string dados_normalizados_json
        string chave_natural
        string status
        string erros_json
    }
```

## 14. Histórico, auditoria e flexibilidade evolutiva

O modelo utiliza três mecanismos complementares. Eles não devem ser confundidos:

1. **Auditoria técnica:** registra quem alterou o quê, quando, por qual requisição e quais campos mudaram.
2. **Histórico temporal de negócio:** permite reconstruir a configuração válida de obra, etapas, serviços, dependências e parâmetros em uma data de corte.
3. **Eventos financeiros imutáveis:** reconhecimentos, reversões, pagamentos e estornos continuam sendo a autoridade para saldos; snapshots de auditoria não substituem esses eventos.

```mermaid
erDiagram
    ORGANIZACAO ||--o{ EVENTO_AUDITORIA : registra
    OBRA o|--o{ EVENTO_AUDITORIA : contextualiza
    USUARIO ||--o{ EVENTO_AUDITORIA : executa
    EVENTO_AUDITORIA ||--o{ ALTERACAO_CAMPO : detalha
    TRANSACAO_NEGOCIO ||--o{ EVENTO_AUDITORIA : agrupa
    OBRA ||--o{ REVISAO_CONFIGURACAO_OBRA : versiona
    REVISAO_CONFIGURACAO_OBRA ||--o{ ETAPA_OBRA_VERSAO : congela
    REVISAO_CONFIGURACAO_OBRA ||--o{ SERVICO_OBRA_VERSAO : congela
    REVISAO_CONFIGURACAO_OBRA ||--o{ DEPENDENCIA_VERSAO : congela
    ETAPA_OBRA ||--o{ ETAPA_OBRA_VERSAO : historiza
    SERVICO_OBRA ||--o{ SERVICO_OBRA_VERSAO : historiza
    DEPENDENCIA_ATIVIDADE ||--o{ DEPENDENCIA_VERSAO : historiza
    ORGANIZACAO ||--o{ DEFINICAO_CAMPO_CUSTOMIZADO : configura
    DEFINICAO_CAMPO_CUSTOMIZADO ||--o{ VALOR_CAMPO_CUSTOMIZADO : recebe
    OBRA o|--o{ VALOR_CAMPO_CUSTOMIZADO : contextualiza
    ORGANIZACAO ||--o{ VERSAO_ESQUEMA_DADOS : registra

    TRANSACAO_NEGOCIO {
        UUID id PK
        UUID organizacao_id FK
        UUID obra_id FK
        string request_id UK
        string correlation_id
        string origem
        timestamptz iniciada_em
        timestamptz concluida_em
        string status
    }
    EVENTO_AUDITORIA {
        UUID id PK
        UUID transacao_id FK
        UUID organizacao_id FK
        UUID obra_id FK
        UUID usuario_id FK
        string tipo_entidade
        UUID entidade_id
        string operacao
        int versao_anterior
        int versao_nova
        string motivo
        jsonb snapshot_anterior
        jsonb snapshot_novo
        timestamptz ocorrido_em
    }
    ALTERACAO_CAMPO {
        UUID id PK
        UUID evento_auditoria_id FK
        string caminho_campo
        string tipo_dado
        jsonb valor_anterior
        jsonb valor_novo
        boolean dado_restrito
    }
    REVISAO_CONFIGURACAO_OBRA {
        UUID id PK
        UUID obra_id FK
        int numero_versao
        string motivo
        date valida_de
        date valida_ate
        string status
        UUID aprovada_por FK
        timestamptz aprovada_em
    }
    ETAPA_OBRA_VERSAO {
        UUID id PK
        UUID revisao_configuracao_id FK
        UUID etapa_obra_id FK
        UUID fornecedor_id FK
        int ordem
        date inicio_planejado
        date fim_planejado
        decimal peso_fisico
        string status_snapshot
    }
    SERVICO_OBRA_VERSAO {
        UUID id PK
        UUID revisao_configuracao_id FK
        UUID servico_obra_id FK
        UUID etapa_obra_id FK
        UUID fornecedor_id FK
        UUID ambiente_id FK
        decimal quantidade
        decimal peso_fisico
        string criterio_avanco
        string status_snapshot
    }
    DEPENDENCIA_VERSAO {
        UUID id PK
        UUID revisao_configuracao_id FK
        UUID dependencia_id FK
        UUID predecessora_id FK
        UUID sucessora_id FK
        string tipo
        int defasagem_dias
    }
    DEFINICAO_CAMPO_CUSTOMIZADO {
        UUID id PK
        UUID organizacao_id FK
        string entidade_alvo
        string codigo
        string rotulo
        string tipo_dado
        jsonb regra_validacao
        jsonb opcoes
        boolean obrigatorio
        boolean pesquisavel
        date vigencia_inicio
        date vigencia_fim
        string status
    }
    VALOR_CAMPO_CUSTOMIZADO {
        UUID id PK
        UUID definicao_id FK
        UUID organizacao_id FK
        UUID obra_id FK
        UUID entidade_id
        string valor_texto
        decimal valor_numero
        date valor_data
        boolean valor_booleano
        jsonb valor_estruturado
        int versao
    }
    VERSAO_ESQUEMA_DADOS {
        UUID id PK
        UUID organizacao_id FK
        string versao_aplicacao
        string migration_id UK
        string checksum
        timestamptz aplicada_em
        string estrategia
        string status
    }
```

### 14.1 Tabelas de histórico propostas

| Tabela | Finalidade | Fonte oficial? | Retenção sugerida |
|---|---|---|---|
| `transacao_negocio` | Agrupar alterações atômicas, aprovações e eventos gerados pela mesma requisição | Não; correlação | Conforme auditoria da organização |
| `evento_auditoria` | Registrar inclusão, alteração, mudança de status, cancelamento e tentativa relevante | Evidência de auditoria | Longa duração; política formal |
| `alteracao_campo` | Permitir consulta de campos modificados sem comparar snapshots completos | Evidência de alteração | Mesma do evento pai |
| `revisao_configuracao_obra` | Identificar versões válidas da configuração da obra | Sim, para versão da configuração | Durante vida da obra e pós-obra |
| `etapa_obra_versao` | Congelar fornecedor, datas, peso, ordem e estado da etapa por revisão | Sim, para consulta temporal | Permanente enquanto houver prestação de contas |
| `servico_obra_versao` | Congelar quantidade, ambiente, fornecedor, peso e critério do serviço | Sim, para consulta temporal | Permanente enquanto houver prestação de contas |
| `dependencia_versao` | Preservar predecessor, sucessor, tipo e defasagem por revisão | Sim, para cronograma histórico | Permanente enquanto houver prestação de contas |
| Tabelas já versionadas | `versao_orcamento`, `baseline_cronograma`, `versao_documento`, `aditivo`, reversões e estornos | Sim, em seus domínios | Conforme exigência de negócio |
| `versao_esquema_dados` | Registrar migrations aplicadas e estratégia expand-contract | Evidência técnica | Permanente |

### 14.2 Regras de histórico

1. Toda alteração mutável recebe `versao`, `criado_em`, `criado_por`, `atualizado_em` e `atualizado_por` na tabela corrente.
2. `EVENTO_AUDITORIA` é append-only para a aplicação. Correção de auditoria cria novo evento correlacionado.
3. Dados sensíveis devem ser mascarados, cifrados ou omitidos dos snapshots; `ALTERACAO_CAMPO.dado_restrito` controla a apresentação.
4. A mesma transação de negócio grava a alteração, o histórico e a auditoria atomicamente.
5. Histórico temporal usa intervalos sem sobreposição: `valida_de` inclusivo e `valida_ate` exclusivo ou nulo para a versão vigente.
6. Aprovar nova configuração encerra a vigência anterior e inicia a nova no mesmo instante lógico.
7. Snapshots JSONB servem para investigação e evidência; relatórios financeiros continuam calculados a partir de eventos e tabelas de domínio.
8. Exclusões permitidas de rascunhos ainda geram evento de auditoria com identificadores e campos não sensíveis necessários.
9. Leitura de histórico respeita organização, obra, perfil e classificação do campo.

### 14.3 Flexibilidade para alterações futuras

- Usar **expand-contract**: adicionar estruturas compatíveis, migrar consumidores e dados, verificar, depois retirar estruturas antigas em migração futura autorizada.
- Migração aplicada é imutável; correções usam uma nova migração com checksum próprio.
- Novos campos operacionais estáveis devem virar colunas tipadas e constraints. Campos customizados atendem variações locais ainda não estabilizadas.
- `DEFINICAO_CAMPO_CUSTOMIZADO` controla tipo, validação, opções, vigência e entidades permitidas. Valores monetários oficiais, chaves e relacionamentos críticos não podem existir somente como JSONB customizado.
- Novos estados de processo exigem revisão das transições, relatórios e regras de autorização; não devem ser apenas textos livres.
- Baselines e versões permitem incorporar mudanças após o início da construção sem reescrever o passado.
- Views e materialized views podem acelerar painéis, mas são derivadas e reconstruíveis; nunca são autoridade de aprovação ou saldo.
- Flags de funcionalidade e parâmetros de organização podem liberar novos recursos gradualmente, preservando compatibilidade da API.

### 14.4 Índices candidatos para histórico

| Tabela | Índice candidato | Uso |
|---|---|---|
| `evento_auditoria` | `(organizacao_id, obra_id, ocorrido_em desc)` | Linha do tempo da obra |
| `evento_auditoria` | `(organizacao_id, tipo_entidade, entidade_id, ocorrido_em desc)` | Histórico de um registro |
| `evento_auditoria` | `(transacao_id)` | Explicar uma operação completa |
| `alteracao_campo` | `(evento_auditoria_id)` | Detalhamento do evento |
| `revisao_configuracao_obra` | `(obra_id, valida_de desc)` | Configuração em uma data de corte |
| `etapa_obra_versao` | `(etapa_obra_id, revisao_configuracao_id)` | Evolução da etapa |
| `servico_obra_versao` | `(servico_obra_id, revisao_configuracao_id)` | Evolução do serviço |
| `valor_campo_customizado` | `(definicao_id, entidade_id)` | Resolver extensão de uma entidade |

## 15. Matriz de relacionamentos críticos

| Origem | Cardinalidade | Destino | Regra principal |
|---|---:|---|---|
| Organização | 1:N | Obras | Obra pertence a uma única organização |
| Organização | N:N via membro | Usuários | Acesso geral não libera todas as obras |
| Obra | 1:N | Etapas da obra | Etapas são configurações próprias da obra |
| Etapa da obra | 1:N | Serviços da obra | Serviço pertence a uma etapa configurada |
| Fornecedor | 1:N | Etapas/serviços | Associação pode variar entre obras |
| Atividade | N:N via dependência | Atividade | Relação dirigida predecessor → sucessor, sem ciclos |
| Obra | 1:N | Versões de orçamento | Uma baseline vigente por data de corte |
| Versão de orçamento | 1:N | Linhas de orçamento | Linhas preservam quantidade, preço e encargos da versão |
| Solicitação | 1:N | Propostas | Propostas devem responder ao mesmo escopo comparável |
| Proposta | 0:1 | Decisão | Escolha exige justificativa e aprovação aplicável |
| Decisão | 0:1 | Compra | Efetivação idempotente |
| Compra | 1:N | Itens e recebimentos | Recebimentos podem ser parciais |
| Contrato | 1:N | Linhas de compromisso | Valor original permanece imutável |
| Contrato | 1:N | Aditivos | Somente aprovados alteram o compromisso |
| Compromisso | 1:N | Linhas de medição | Acumulado não ultrapassa limite autorizado |
| Medição/recebimento | 1:0..1 | Reconhecimento | Cada escopo é reconhecido uma única vez |
| Origem financeira | 1:0..N | Obrigações | Unicidade por origem e tipo evita duplicidade |
| Obrigação | N:N via alocação | Pagamento | Permite baixa parcial e consolidação |
| Pagamento | 1:N | Estornos | Estorno não altera automaticamente o custo executado |
| Documento | 1:N | Versões | Versão anterior não é sobrescrita |
| Obra | 1:N | Itens de entrega/garantias | Histórico permanece após encerramento |
| Oferta | 1:N | Propostas de venda | Uma proposta aceita pode gerar uma venda |
| Venda | 1:N | Comissões | Comissão permanece separada do custo da construção |

## 16. Fórmulas e fontes do painel

| Indicador | Grão e fonte | Fórmula ou regra |
|---|---|---|
| Orçamento vigente `B` | Linhas da versão aprovada vigente | Soma das linhas arredondadas |
| Reserva `R` | Saldo dos eventos de contingência | Reserva inicial + créditos − alocações aprovadas |
| Compromisso `C` | Linhas de compromisso e compras autorizadas | Valor original + aditivos aprovados − supressões aprovadas |
| Executado `E` | Reconhecimentos de custo | Reconhecimentos ativos − reversões |
| Compromisso restante `CR` | Compromissos por escopo | Compromisso atualizado − executado vinculado |
| Não contratado `U` | Estimativas restantes ativas | Soma sem sobreposição com E ou CR |
| Projeção `F` | E, CR e U | `F = E + CR + U` |
| Pago | Pagamentos e estornos | Pagamentos efetivos − estornos |
| Avanço físico | Eventos de progresso e baseline | Soma de percentual × peso congelado |
| Economia em propostas | Orçamento-base e decisão | Base comparável − valor efetivado, com escopo equivalente |
| Risco de atraso | Atividades e dependências | Derivado de datas, caminho dependente, bloqueios e prazo |

## 17. Restrições de integridade recomendadas

1. Chaves estrangeiras compostas ou gatilhos equivalentes devem impedir vínculos entre organizações e obras diferentes.
2. `UNIQUE (organizacao_id, cpf_cnpj)` para fornecedor, permitindo política explícita para documentos ausentes.
3. `UNIQUE (obra_id, numero_versao)` para orçamento e baseline.
4. `UNIQUE (decisao_proposta_id)` em compra quando a decisão gerar uma única compra.
5. `CHECK (predecessora_id <> sucessora_id)` e validação de ciclo para dependências.
6. `CHECK (valor >= 0)` nos valores positivos; reversões usam entidade própria em vez de números negativos livres.
7. `UNIQUE (tipo_origem, origem_id, tipo_obrigacao)` para geração de obrigação.
8. `UNIQUE (organizacao_id, usuario_id, operacao, chave)` para idempotência.
9. Soma de alocações de pagamento limitada ao valor líquido do pagamento.
10. Soma de medições aprovada limitada à linha de compromisso atualizada.
11. Soma de compensações limitada ao saldo do adiantamento.
12. Soma de liberações limitada ao saldo da retenção.
13. Exclusão física permitida apenas para rascunho sem referências; demais registros usam estado ou evento reverso.

## 18. Pontos para validação do modelo

- Confirmar se contrato e compra usam uma entidade unificada de compromisso ou permanecem entidades separadas com `LINHA_COMPROMISSO` comum. A proposta deste MER mantém origens separadas e consolidação na linha de compromisso.
- Confirmar se uma etapa pode possuir vários fornecedores simultâneos. O modelo permite vários fornecedores nos serviços e um responsável principal na etapa.
- Confirmar se o recebimento físico precisa controlar estoque de materiais; estoque não está incluído nesta versão.
- Confirmar se uma venda pode incluir mais de uma unidade ou imóvel; o modelo atual considera uma oferta vinculada a uma obra.
- Confirmar se taxas de cartório, condomínio e prefeitura entram como orçamento de pré-obra e também como documentos. O modelo permite ambos por vínculos distintos, sem duplicar custo.
- Definir quais tipos de documento exigem validade e alertas obrigatórios.
- Definir política de retenção de dados pessoais de interessados e compradores.
- Definir se comissão é reconhecida na assinatura, no recebimento ou em outro marco configurável.

## 19. Checklist de aprovação do MER

- [ ] Organização e obra isolam todos os registros específicos.
- [ ] Catálogo global não altera obras já configuradas sem revisão explícita.
- [ ] Etapas, serviços, ambientes, fornecedores e dependências refletem a operação real.
- [ ] Não existem ciclos entre predecessor e sucessor.
- [ ] Baselines preservam pesos, datas e versões anteriores.
- [ ] Proposta escolhida mantém justificativa e origem até a compra.
- [ ] Contrato e compra geram compromissos sem duplicar escopo.
- [ ] Medição e recebimento reconhecem custo uma única vez.
- [ ] Obrigação e pagamento permanecem separados.
- [ ] Parcelamento não duplica o custo da compra.
- [ ] Adiantamentos, retenções e estornos possuem saldos próprios.
- [ ] Documentos são versionados e protegidos por obra e finalidade.
- [ ] Memorial e relatórios são derivados com data de corte.
- [ ] Custos comerciais permanecem separados do custo da construção.
- [ ] Auditoria, aprovação e idempotência cobrem operações críticas.
