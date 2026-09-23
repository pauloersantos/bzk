# Frontend React

## Estado atual

A primeira fatia da interface de produção usa React 19, TypeScript, Next.js e CSS responsivo. Estão implementados:

- shell autenticado visual com menu agrupado;
- seletor global de obra no topo;
- painel executivo com indicadores, avanço, fluxo e riscos;
- consulta de etapas e serviços;
- consulta de fornecedores;
- carteira e seleção de obras;
- navegação móvel com menu lateral;
- estados de foco, link de salto e textos associados aos indicadores.

Os dados são fictícios e estão identificados na interface. A aplicação não usa `localStorage` para registros de negócio. Botões que dependem de endpoints ainda ausentes ficam desabilitados e informam que a integração está pendente.

## Estrutura

- `app/layout.tsx`: metadados e idioma da aplicação.
- `app/page.tsx`: ponto de entrada da página.
- `components/bomzeika-app.tsx`: navegação, telas da primeira fatia e dados demonstrativos.
- `app/globals.css`: tokens visuais, layouts e breakpoints.
- `next.config.ts`: cabeçalhos defensivos da camada web.

## Responsividade

O desktop usa menu lateral fixo, indicadores em quatro colunas e painéis comparáveis. Em tablet, indicadores e cards passam para duas colunas. Abaixo de 820 px, o menu vira drawer e a busca é retirada do cabeçalho compacto. No celular, cards usam uma coluna e tabelas comparativas mantêm rolagem horizontal.

## Segurança da interface

- CSP restrita à própria origem e à API local; scripts e estilos inline ainda são permitidos até a adoção de nonce por resposta;
- proteção contra framing e MIME sniffing;
- política de referência e permissões de navegador restritas;
- nenhum token ou dado financeiro persistido pelo protótipo;
- ações dependentes de permissão serão validadas na API, nunca somente ocultadas no React;
- futuras sessões web usarão cookies `HttpOnly`, `Secure` e `SameSite` conforme o desenho de autenticação do backend.

## Próximas fatias

1. integrar leitura de obras, catálogo e fornecedores com a API;
2. implementar autenticação e estados 401/403 sem expor token ao JavaScript;
3. criar formulários completos com React Hook Form e Zod;
4. implementar conflito de versão, erro recuperável e preservação do formulário;
5. avançar para orçamento, compras, pagamentos, cronograma e diário.

## Validação

```powershell
npm ci
npm run lint
npm run build
```
