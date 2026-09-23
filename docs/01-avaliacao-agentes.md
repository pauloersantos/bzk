# Avaliação dos pacotes e conversão

## Conclusão

Usar a disciplina de descoberta do KAPPITA e o detalhamento técnico do EQ HUB, com menos infraestrutura obrigatória e papéis acionados por necessidade. Os agentes são instruções de trabalho, não processos em execução nem especialistas humanos certificados. Converter a sintaxe sem revisar o domínio preservaria erros e dependências inadequadas.

## Inventário

| Pacote | Agentes | Comandos | Hooks | Skills |
|---|---:|---:|---:|---:|
| agents-kappita.zip | 8 | 1 | 3 | 0 |
| agents-eqhub.zip | 18 | 12 | 2 | 17 |

São 26 definições de agentes, com 19 nomes distintos: sete papéis se repetem. O pacote EQ HUB também contém referências, scripts e licenças de terceiros. O inventário detalhado com hashes ficará em `inventario-fontes.json`. Os ZIPs originais permanecem intactos.

## Pontos aproveitados

- KAPPITA separa processo operacional, produto, arquitetura e segurança; marca decisões candidatas como propostas e evita uma equipe grande antes de haver necessidade.
- EQ HUB define ownership, contratos de API, qualidade, migrações, isolamento entre organizações, rastreabilidade e recuperação.
- Ambos valorizam evidências, documentos versionados e distinção entre intenção e entrega.
- A regra de que conteúdo recebido de terceiros é dado, não instrução, foi mantida.

## Achados específicos

| ID | Evidência no anexo | Problema | Tratamento |
|---|---|---|---|
| A01 | EQ HUB `agents/solution-architect.md`, Responsabilidades e Expertise sênior | O mesmo arquivo manda começar como monólito modular e exige microserviços desde o início. | Uma única proposta: monólito modular Node.js; divisão futura exige necessidade e ADR. |
| A02 | Ambos, referências a `CLAUDE.md`, blueprint e decisões atuais | Os documentos citados não acompanham os ZIPs; não é possível confirmar decisões atribuídas ao usuário original. | Não herdar aprovação, veto ou arquitetura daquele projeto. Usar os requisitos desta conversa. |
| A03 | EQ HUB backend/database/QA | Quarkus, Java, Flyway, Hibernate e PIT não correspondem à stack pedida. | Node.js/TypeScript, PostgreSQL, migrações SQL e testes adequados ao ambiente. |
| A04 | EQ HUB solution-architect, DevOps e skills | Kafka, Kubernetes, OPA, Vault, lake e vários bancos aparecem como obrigatórios. | Adiar componentes sem necessidade demonstrada. Manter os objetivos de segurança e recuperação. |
| A05 | KAPPITA solution-architect | Flowise e n8n são exigências de outro produto. | Não incluir no núcleo do sistema de obras. |
| A06 | Todos os agentes médicos | Plantões, CRM/RQE, paciente, HIPAA e CFM não descrevem obras. | Substituir por domínio de obra, custos, contratos e validação humana técnica; não transportar regras regulatórias de saúde. |
| A07 | YAML dos agentes | `model: opus/sonnet/haiku` e ferramentas Claude não são configuração Codex. | Arquivos TOML com name, description e developer_instructions; herdar modelo e permissões da sessão. |
| A08 | EQ HUB PMO/tech-lead e outros | Alguns agentes prometem gravar relatórios, mas não listam ferramenta de escrita. | Ownership expresso; revisores retornam parecer ao principal, que pode persistir. Não copiar listas de tools. |
| A09 | EQ HUB squad-orchestrator | Regra de manter todos ocupados pode gerar trabalho desnecessário; KPIs absolutos não têm baseline. | Usar apenas trabalho útil, limitar WIP e medir antes de fixar metas. |
| A10 | `commands/team.md` | Requer 3–5 agentes, contestação obrigatória e comandos de lifecycle específicos. | Procedimento Codex proporcional à tarefa; sem debate artificial nem disparo automático por existir um papel. |
| A11 | `hooks/block-destructive.sh` | Regex sobre JSON não é sandbox, pode bloquear texto inofensivo e deixar variantes passarem. Inclui `migrate deploy`, que não é necessariamente destrutivo. | Não instalar como controle de segurança. Usar permissões reais, credenciais limitadas, revisão de migração e autorização contextual. |
| A12 | KAPPITA `token-usage-log.sh` + `kappita-usage.md` | Hook relê toda a transcrição a cada Stop; somar snapshots cumulativos superestima consumo. | Relatar medição oficial quando disponível; em exportações cumulativas, usar deltas ou último snapshot por sessão, sem misturar formatos. |
| A13 | Hooks team-idle | Persistem payload bruto fora do projeto, podem registrar informações sensíveis; diretório pode não existir. | Registrar somente resumo mínimo, sem tokens ou payload bruto; não prometer hook portado. |
| A14 | Skills frontend/mcp/testing | Existem licenças anexadas; copiar tudo tornaria o pacote maior e ativaria tecnologias fora do escopo. | Reescrever procedimentos próprios; não redistribuir scripts nem textos integrais dessas skills. Preservar originais nos ZIPs. |

## Destino de todos os agentes

K = KAPPITA; E = EQ HUB. Os papéis duplicados foram consolidados, mantendo o melhor de cada versão.

| Origem | Nome original | Destino Codex | Uso |
|---|---|---|---|
| K/E | product-analyst | product-analyst | PRD e critérios de aceite |
| K/E | solution-architect | solution-architect | Arquitetura, dados e contratos |
| K/E | tech-lead | tech-lead | Plano por fatia e integração |
| K/E | squad-orchestrator | squad-orchestrator | Coordenação sob demanda |
| K/E | pmo | pmo | Evidências e situação do software |
| K/E | compliance-security-reviewer | compliance-security-reviewer | Revisão de privacidade e segurança |
| K/E | medical-domain-expert | construction-domain-expert | Regras de obra; fontes e limites técnicos |
| K | escalista-senior | construction-operations-reviewer | Jornada de obra, aprovações e exceções |
| E | backend-engineer | backend-engineer | API Node.js e regras transacionais |
| E | database-engineer | database-engineer | PostgreSQL, integridade, RLS e migrações |
| E | web-frontend-engineer | web-frontend-engineer | React responsivo |
| E | qa-engineer | qa-engineer | Testes financeiros, segurança e jornada |
| E | ux-reviewer | ux-reviewer | Usabilidade e acessibilidade |
| E | blueprint-guardian | blueprint-guardian | Aderência ao pedido e às decisões |
| E | devops-engineer | devops-engineer | Operação, entrega e restauração |
| E | mobile-engineer | responsive-experience-reviewer | Web no canteiro; não cria app nativo |
| E | ai-engineer | ai-engineer | Opcional: OCR/assistência futura |
| E | data-platform-engineer | data-platform-engineer | Opcional: relatórios e integrações de dados |
| E | ml-analytics-engineer | ml-analytics-engineer | Opcional: previsões após dados suficientes |

Os últimos três não introduzem IA, data lake ou ML na primeira entrega. O PMO acompanha o desenvolvimento do software; o cronograma da construção é uma funcionalidade do produto. São duas esteiras diferentes.

## Comandos e skills

Os 13 comandos viram skills `obra-*`: spec, plan-feature, implement-feature, adr, spec-api, spec-event, review-feature, review-arch, review-ai, threat-model, release-check, team e usage. `$ARGUMENTS` vira o pedido concreto do usuário. Não são aliases executáveis `/spec` do Claude.

| Skill original EQ HUB | Destino/adaptação |
|---|---|
| frontend-design, frontend-stack | obra-frontend: React responsivo e design da obra |
| quarkus-backend | obra-node-api |
| postgres-best-practices | obra-postgres |
| auth-keycloak-opa, secure-coding | obra-security; provedor de identidade configurável |
| cloud-native-devops | obra-delivery; containers simples e restauração |
| webapp-testing | obra-testing; sem copiar scripts de terceiros |
| ai-first-feature, ai-platform, rag-hybrid-search, token-control | obra-ai; opcional e sem provedor obrigatório |
| kafka-event-driven | obra-spec-event; outbox quando houver integração assíncrona |
| data-platform | obra-data; métricas reconciliáveis antes de lake |
| healthcare-interop | Retirada; integrações de obra futuras usam API documentada |
| mcp-builder | Não ativada; MCP não é necessário ao produto agora |

## Limites de validação

Revisados os agentes e comandos, o conteúdo dos hooks e os pontos de integração das skills. Scripts auxiliares do pacote MCP e de browser foram inventariados, não executados nem certificados. A conversão é uma adaptação consolidada para OBRAS, não uma reprodução dos dois sistemas de saúde. Configuração com sintaxe válida não comprova carregamento em todas as versões do Codex; o guia inclui a verificação de descoberta na instalação do usuário.
