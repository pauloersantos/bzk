# Esteira de entrega e qualidade

## Fase atual

Documentação, conversão dos agentes e telas. Não executar os agentes de implementação para produzir aplicação nesta fase. A restrição vem diretamente do usuário, não dos gates médicos dos anexos.

## Fluxo do desenvolvimento

| Etapa | Responsável | Entrada | Saída verificável |
|---|---|---|---|
| Descoberta | product-analyst + domínio quando necessário | Pedido e documentos aplicáveis | Critérios de aceite e perguntas classificadas |
| UX | web-frontend-engineer em modo design + ux-reviewer | Jornada e critérios | Telas e comportamento responsivo |
| Arquitetura | solution-architect | Requisitos e decisões | ADR proposta, dados e API |
| Planejamento | tech-lead | Escopo e contratos | Fatias, dependências e riscos |
| Revisão do usuário | Usuário | Documentação e telas concretas | Correções ou pedido para implementar |
| Implementação | Backend, banco e frontend conforme fatia | Pedido autorizado e plano | Mudança revisável e testes relevantes |
| Revisão | QA, UX, segurança e aderência conforme impacto | Mudança e evidências | Achados classificados e correções |
| Entrega | DevOps + principal | Versão validada | Release, recuperação e situação real |
| Acompanhamento | PMO | Artefatos, testes e releases | Status com fontes |

Os papéis são capacidades; não é necessário iniciar todos. Trabalho independente pode ser delegado se houver autorização contextual e recursos disponíveis. O principal integra e decide próximos passos. Dois agentes não editam o mesmo contrato ou migração ao mesmo tempo. Não inventar trabalho para manter agentes ocupados. Revisões podem ocorrer em paralelo quando independentes; a decisão final considera todos os achados críticos.

## Fatias propostas

1. Base: autenticação, organizações, obras, membership, auditoria e isolamento.
2. Orçamento: EAP, itens, baseline, revisão, contingência e fórmulas.
3. Suprimentos: solicitação, cotação, aprovação, contrato/pedido e parcela prevista.
4. Execução financeira: medição/recebimento, obrigação, adiantamento, retenção, pagamento parcial e estorno.
5. Gestão: painel conciliável, fluxo de caixa, relatórios e exportação.
6. Obra em campo: cronograma, diário, inspeções, alterações e documentos completos.
7. Operação: importação, recuperação, testes finais, documentação de usuário e entrega.

Nenhuma data de entrega é prometida antes da avaliação de esforço e disponibilidade. A primeira fatia útil deve permitir um fluxo completo pequeno, sem chamar partes demonstrativas de funcionais.

## Matriz mínima de testes

| Cenário | Evidência exigida |
|---|---|
| Acesso entre organizações, obras e fornecedores | Teste API + banco com papel não privilegiado |
| Aprovação concorrente | Duas transações disputando saldo; uma deve falhar corretamente |
| Duplicação por retry | Idempotência em pagamento, medição e importação |
| Adiantamento/retenção | Exemplo numérico do PRD, compensação e liberação reconciliados |
| Estorno parcial | Saldo, trilha e projeção sem dupla contagem |
| Precisão | Casas decimais, rateios, arredondamento e centavo residual |
| Contrato e cliente | Requests/responses aderentes ao OpenAPI |
| UI | Fluxo por teclado, 390/768/1440px, loading/empty/error/success |
| Documentos | Download indevido, upload inválido e permissão revogada |
| Recuperação | Restauração de banco + objetos e validação de vínculos |

Percentuais de cobertura são auxiliares; não substituem testes desses riscos. Mudanças simples e reversíveis não exigem uma bateria artificial de testes. Registrar comandos executados, ambiente, resultados e testes não executados.

## Critério de conclusão

Uma feature está implementada quando atende aos critérios aprovados, dados persistem, autorização existe no servidor, testes relevantes passam e não há defeito crítico aberto. Publicada é outro estado, comprovado por ambiente e versão acessíveis. Protótipo, documentação e configuração de agente têm critérios próprios; não contam como funcionalidade implementada.

## Papéis e fronteiras

- Produto: `docs/product/`; domínio: `docs/domain/`; arquitetura: `docs/architecture/` e `contracts/`.
- Plano/coordenação: `docs/context/`; PMO: `docs/pmo/`.
- Frontend futuro: `apps/web/`, `packages/ui/`; API futura: `apps/api/`; banco futuro: `database/`.
- QA: `tests/` e `docs/qa/`; segurança: parecer em `docs/security/`; UX: `docs/ux/`; aderência: `docs/reviews/`.
- DevOps futuro: `infra/` e configurações de CI. Fronteiras são coordenação, não restrições de filesystem impostas por TOML.
