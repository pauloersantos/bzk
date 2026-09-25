# Modelo de dados e contratos conceituais

Este documento define o desenho para revisão. Não contém migração executável nem endpoints implementados.

## Convenções

UUID para identificadores; `organization_id` e `project_id` onde aplicável; datas de vencimento como DATE; eventos como timestamptz UTC, exibidos no fuso da obra. Valores finais NUMERIC(19,2), quantidade NUMERIC(19,4), preços unitários NUMERIC(19,6). API transporta decimais como strings; não usar float JavaScript como fonte de cálculo monetário. Cada operação mutável tem ator, instante, request_id e versão.

## Entidades e relacionamentos

| Grupo | Entidades | Campos/relações essenciais |
|---|---|---|
| Acesso | organizations, users, memberships, project_members, role_permissions, approval_limits | Identidade externa, status, papel, obra, limite e vigência |
| Obra | projects, environments, cost_centers, stages, work_items | Nome, endereço, área, prazo; etapa pai; unidade, categoria, ambiente |
| Pessoas | suppliers, supplier_contacts, restricted_payment_details | Documento e contato; dados bancários separados e protegidos |
| Orçamento | budget_versions, budget_lines, contingency_events, estimate_lines | Baseline, status, quantidade, preço, encargos, versão anterior; escopo coberto da estimativa |
| Compras | purchase_requests, request_lines, quotations, quotation_lines, award_decisions | Item, propostas, exclusões, condições, fornecedor escolhido e motivo |
| Compromissos | contracts, commitment_lines, amendments, amendment_lines, schedules | Contrato/pedido/compra direta, valor original, atualização, retenção, índice e parcelas previstas |
| Execução | measurements, measurement_lines, receipts, receipt_lines, recognition_entries | Período, item contratado, quantidade, valor aprovado, aprovador e reversão |
| Financeiro | obligations, obligation_lines, payments, payment_allocations, advances, advance_offsets, retention_entries, reversals | Bruto, descontos, impostos, compensação, líquido, vencimento, conta, data, estorno |
| Planejamento | tasks, task_dependencies, progress_events, baseline_tasks | Datas, peso físico, predecessora, tipo de dependência, realizado |
| Campo | diary_entries, inspections, issues, change_requests, finish_specifications | Etapa/ambiente, equipe, evidências, aceites e revisões |
| Documentação | documents, document_versions, document_links, comments, notifications | Objeto privado, checksum, versão, destinatários e vínculo de negócio |
| Controle | approvals, audit_events, idempotency_records, outbox_jobs | Escopo aprovado, autor, hash da requisição, resposta, tarefa e tentativa |

FKs compostas ou validação equivalente com constraints devem impedir vínculo entre organizações/obras diferentes. Relações N:N usam tabelas de alocação: um pagamento pode liquidar várias obrigações e uma obrigação pode receber pagamentos parciais. Auditoria armazena diferença mínima necessária, não cópia irrestrita de dados pessoais.

## Invariantes transacionais

1. Aprovar medição bloqueia ou verifica atomicamente a versão do compromisso; soma acumulada não ultrapassa limite aprovado. Reconhecimento e auditoria são gravados na mesma transação.
2. Gerar obrigação utiliza a origem única (medição/recebimento/parcela). UNIQUE por origem e tipo evita reaproveitamento duplicado; parcelas previstas são convertidas/vinculadas, não somadas novamente.
3. Baixa parcial exige valor positivo e não superior ao saldo liquidável. Excedente só pode ser adiantamento/crédito explicitamente separado e autorizado. Alocação e saldo mudam atomicamente.
4. Compensação não supera saldo de adiantamento nem valor elegível da obrigação. Retenção é dívida postergada, não desconto de custo.
5. Estorno referencia a operação original e não supera o valor ainda reversível. Estorno do pagamento não estorna automaticamente medição ou recebimento.
6. Aditivo aprovado mantém valor original; supressão não reduz limite abaixo do executado sem procedimento de reversão/encerramento com créditos explicados.
7. Mesmo Idempotency-Key + mesmo ator/obra/operação + mesmo corpo retorna mesma resposta. Reuso com corpo diferente retorna conflito. Reservar chave e gravar efeito na mesma transação.
8. Lock otimista (version/If-Match) detecta edição concorrente; nenhuma atualização silenciosa de registro aprovado.

## API proposta

Prefixo `/api/v1`; recursos de obra em `/projects/{projectId}`. Bearer interno ou cookie de sessão conforme arquitetura; autorização sempre no servidor. Listagens paginadas por cursor, com limites máximos, filtros explícitos e ordenação estável. Erros usam `application/problem+json`, com código de domínio, request_id e campos inválidos.

| Operação | Rota relativa | Papel/regra |
|---|---|---|
| GET/POST | /projects | Listar autorizadas / cadastrar obra |
| GET/POST | /projects/{p}/budget-versions | Ver / criar revisão |
| POST | /projects/{p}/budget-versions/{v}/submit | Gestor envia para aprovação |
| POST | /projects/{p}/budget-versions/{v}/approve | Aprovador dentro da alçada |
| GET/POST | /projects/{p}/purchase-requests | Solicitação de compra |
| POST | /projects/{p}/purchase-requests/{r}/quotations | Fornecedor vinculado ou gestor |
| POST | /projects/{p}/purchase-requests/{r}/award | Escolha com motivo e aprovação |
| GET/POST | /projects/{p}/contracts | Cadastro/listagem |
| POST | /projects/{p}/contracts/{c}/amendments | Aditivo proposto |
| POST | /projects/{p}/amendments/{a}/approve | Aprovar impacto autorizado |
| GET/POST | /projects/{p}/measurements | Medição rascunho/listagem |
| POST | /projects/{p}/measurements/{m}/approve | Responsável habilitado e alçada |
| POST | /projects/{p}/receipts | Recebimento de pedido |
| GET/POST | /projects/{p}/obligations | Obrigações vinculadas |
| POST | /projects/{p}/payments | Registrar pagamento; não transferir dinheiro |
| POST | /projects/{p}/payments/{x}/reversals | Motivo, valor e permissão de estorno |
| POST | /projects/{p}/advances/{a}/offsets | Compensar saldo em obrigação |
| GET | /projects/{p}/dashboard?asOf=... | Indicadores e data de corte |
| GET | /projects/{p}/cost-breakdown?itemId=... | Origem de cada total |
| GET/POST | /projects/{p}/tasks | Cronograma |
| GET/POST | /projects/{p}/diary-entries | Diário |
| GET/POST | /projects/{p}/issues | Qualidade e pendências |
| GET/POST | /projects/{p}/change-requests | Solicitar e acompanhar mudança |
| POST | /projects/{p}/documents/upload-intents | Upload autorizado e limitado |
| POST | /projects/{p}/documents/{d}/download-url | URL privada de curta validade |
| POST | /projects/{p}/imports/preview | Validar planilha sem gravação |
| POST | /projects/{p}/imports/{i}/confirm | Gravar linhas aprovadas com idempotência |
| POST | /projects/{p}/reports | Gerar PDF/XLSX com filtros |
| GET | /projects/{p}/audit-events | Apenas perfis autorizados |

POST financeiro recebe Idempotency-Key; respostas de conflito usam 409, autenticação ausente 401, permissão negada 403, recurso invisível pode usar 404 consistentemente. Validação de domínio usa 422; indisponibilidade 503. Requisições com decimais inválidos, valores negativos indevidos ou datas malformadas falham antes da transação.

### Contrato de medição — exemplo documental

Entrada: contractId, periodStart, periodEnd, lines[{commitmentLineId, quantity:"10.0000", grossAmount:"40000.00"}], documentIds[], expectedVersion.
Saída: id, status, version, totals{gross:"40000.00", retention:"2000.00", advanceOffset:"10000.00", netPayable:"28000.00"}.
Os totais são calculados no servidor; o cliente não pode decidir descontos, limites ou papel do aprovador.

### Contrato de pagamento — exemplo documental

Entrada: obligationId, amount:"14000.00", paidAt:"2026-09-25", method:"PIX", accountId, proofDocumentId, expectedVersion.
Saída: paymentId, obligationStatus:"partially_paid", remainingAmount:"14000.00", requestId.
Reenviar a requisição idêntica retorna o mesmo paymentId. O usuário visualiza a origem, data e comprovante no histórico.

## Exportação e importação

Importação usa template versionado, números pt-BR normalizados, erros por linha, hashes e chaves naturais para deduplicação. Prévia e confirmação devem usar o mesmo conteúdo/hash. Relatório inclui data de corte, filtros, versão do orçamento e definições dos indicadores. Exportação nunca contorna RBAC. Arquivos com fórmulas externas/macros não são executados pelo servidor.
