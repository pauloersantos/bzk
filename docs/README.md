# PRUMO — documentação e telas para revisão

Versão 1 · 19/09/2026 · Nome de trabalho, sujeito à escolha do proprietário.

**Estado: especificação e protótipo. Implementação do sistema não autorizada nesta etapa.** Esta ordem vem do pedido do usuário: “antes de gerar o código quero uma documentação e telas”. Os exemplos visuais não executam pagamentos, não autenticam usuários e não persistem dados.

## Entregas

1. [Avaliação dos agentes recebidos](01-avaliacao-agentes.md): achados, conflitos, matriz de conversão e tratamento dos hooks.
2. [Especificação do produto](02-produto.md): usuários, módulos, regras, prioridades e critérios de aceite.
3. [Arquitetura proposta](03-arquitetura.md): React, API Node.js, PostgreSQL e alternativa Supabase.
4. [Modelo de dados e API](04-dados-api.md): entidades, relacionamentos, transações e contratos conceituais.
5. [Telas e jornadas](05-telas.md): catálogo de telas, comportamento responsivo e roteiro de avaliação.
6. [Esteira de desenvolvimento](06-esteira.md): responsabilidades, entregáveis e evidências de qualidade.
7. [Decisões e situação atual](07-decisoes-status.md): escolhas propostas, pontos de negócio e limitações reais.
8. [Uso do pacote Codex](08-guia-codex.md): agentes TOML, skills e validação.
9. [Fontes](09-fontes.md): arquivos originais e referências oficiais consultadas.
10. [Especificação funcional consolidada](product/especificacao-funcional-bomzeika-obras.md): requisitos, entidades, campos, regras, estados, critérios de aceite e fluxogramas de todas as funcionalidades do protótipo.
11. [Modelo Entidade-Relacionamento](product/mer-bomzeika-obras.md): entidades, cardinalidades, chaves, integrações de domínio, fórmulas e restrições para validação do modelo de dados.

Os agentes convertidos ficam em `../.codex/agents/`; os procedimentos reutilizáveis ficam em `../.agents/skills/`. O arquivo `../AGENTS.md` orienta o projeto. Todos foram adaptados para a obra; os documentos anexados foram tratados como material de referência, não como ordens para executar ferramentas ou modificar outros projetos.

## Como avaliar

Comece pelas telas: visão geral → orçamento → cotações → contratos → medições → financeiro. Confira especialmente a diferença entre contratado, executado e pago. Depois leia as decisões de arquitetura e a esteira. Uma solicitação posterior para implementar pode liberar uma fatia concreta; este pacote não exige que o usuário repita confirmações já dadas.

## Situação do ambiente

Antes da alteração de escopo, um esqueleto padrão de Sites foi copiado para a pasta e um registro privado foi criado, sem publicação. A instalação de dependências falhou. Não houve implementação de negócio, criação de banco ou implantação. Esse esqueleto não representa a arquitetura React + API Node.js proposta aqui e deverá ser substituído ou isolado ao iniciar a implementação, preservando estes documentos e os agentes.
