# Pacote Codex — uso e limites

## Estrutura

- `AGENTS.md`: contexto e restrição atual de documentação antes de implementação.
- `.codex/agents/*.toml`: 20 papéis consolidados, incluindo o `senior-dba-reviewer` para validar modelo PostgreSQL, histórico, evolução e integridade.
- `.agents/skills/obra-*/SKILL.md`: procedimentos de trabalho e conhecimento técnico adaptado.
- `docs/`: fonte de especificação desta obra e evidência da conversão.

Conforme a [documentação oficial de agentes](https://learn.chatgpt.com/docs/agent-configuration/subagents), cada agente possui `name`, `description` e `developer_instructions`. O pacote não fixa modelos de outro fornecedor e não altera permissões, credenciais ou configuração global. O suporte depende da versão instalada. A sintaxe foi conferida; o carregamento deve ser verificado em uma nova sessão no projeto.

As [skills do Codex](https://learn.chatgpt.com/docs/build-skills) usam pastas com `SKILL.md`, incluindo name e description no frontmatter. Instruções persistentes ficam no [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Esses mecanismos são diferentes: um papel define responsabilidade, uma skill descreve um procedimento e AGENTS.md define contexto comum.

## Como pedir trabalho

- “Use o product-analyst para revisar a especificação de orçamento, sem implementar.”
- “Use $obra-spec-api para detalhar o contrato de medições.”
- “Use $obra-review-feature para revisar as telas contra o PRD.”
- “Use $obra-team para dividir a revisão de segurança e UX em tarefas independentes.”
- Quando decidir implementar: “Pode implementar a primeira fatia do plano usando React, Node.js e PostgreSQL.”

Pedir conversão de agentes não os executa automaticamente. A invocação exata de agentes pode variar conforme o cliente; se o papel não aparecer, abrir sua definição e aplicar as instruções na sessão principal é alternativa explícita, não evidência de que um subagente foi iniciado.

## Verificação local

1. Abrir uma nova tarefa/sessão apontando para a raiz OBRAS.
2. Pedir a listagem das instruções aplicáveis e conferir AGENTS.md.
3. Conferir descoberta de uma skill `obra-spec` e de `product-analyst`.
4. Pedir uma análise curta de documentação. Verificar que não há alteração do produto.
5. Se a versão não aceitar agentes TOML independentes, consultar a documentação da versão; não converter silenciosamente para chaves antigas nem ativar permissões mais amplas.

## Hooks

Nenhum hook Claude foi instalado ou executado. O formato de eventos/retorno e a transcrição precisam de adaptação específica da versão do host; fazer uma troca textual `.claude` → `.codex` seria incorreto. As intenções úteis foram convertidas em regras de trabalho: cautela com operações destrutivas, status persistido e consumo baseado em evidência. Não há bloqueio técnico adicional nem telemetria automática oferecidos por este pacote.

Para o consumo, usar o status/medição oficial disponível. Não ler segredos ou logs de outros projetos. Dados indisponíveis são “não medidos”. Contadores cumulativos precisam de deduplicação; não somar snapshots completos repetidos.

## Licenças e distribuição

Os novos prompts são adaptações para o projeto. Scripts, referências extensas e licenças dos anexos não foram incorporados como dependências de produção. Antes de redistribuir material original de terceiros, revisar a licença correspondente e conservar os avisos exigidos. A licença comercial do produto final ainda não foi definida pelo usuário.
