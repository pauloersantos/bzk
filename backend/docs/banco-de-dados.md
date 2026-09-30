# Banco de dados, histórico e auditoria

## Migrações

As migrações ficam em `backend/migrations` e são executadas em ordem lexical. `schema_migrations` guarda o SHA-256 de cada arquivo aplicado. Uma alteração posterior em arquivo já executado interrompe o processo; correções devem ser acrescentadas em nova migração.

| Migração | Responsabilidade |
| --- | --- |
| `001_foundation.sql` | Organização, usuário, obra, membros e funções de contexto |
| `002_catalog_and_configuration.sql` | Catálogos, fornecedores, configuração e dependências |
| `003_audit_and_history.sql` | eventos de auditoria, snapshots e revisões temporais |
| `004_rls.sql` | políticas de isolamento por organização e obra |

## Isolamento

Cada transação recebe `app.organization_id`, `app.user_id` e `app.request_id`. As políticas consultam membros ativos e limitam leitura e escrita ao tenant e à obra autorizados. As tabelas críticas usam `FORCE ROW LEVEL SECURITY`.

O papel de runtime precisa de permissões mínimas e deve permanecer sujeito a RLS. O papel de migração mantém a propriedade do esquema e não deve ser usado pela API.

## Auditoria

`audit_events` registra ator, ação, entidade, versões, campos alterados, requestId e snapshots sanitizados. Dados pessoais selecionados são retirados dos snapshots genéricos. `audit_events` e `audit_field_changes` rejeitam atualização e exclusão.

As revisões da configuração preservam a visão aprovada de etapas, serviços, dependências e fornecedor exibido naquele momento. Esse histórico não substitui a trilha financeira, que será implementada junto aos módulos de orçamento, contratos e pagamentos.

## Execução segura

Antes de aplicar em ambiente real:

1. criar banco e papéis separados para migração e runtime;
2. executar as migrações com o papel proprietário;
3. conceder ao runtime apenas uso do esquema, sequências necessárias e operações previstas;
4. confirmar que o runtime não possui `BYPASSRLS`;
5. executar testes de isolamento com duas organizações distintas;
6. testar backup e restauração antes de aceitar dados reais.
