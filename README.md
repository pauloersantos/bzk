# BOMzeika Obras

Sistema web responsivo para acompanhamento e gestão de obras residenciais de alto padrão. O produto integra planejamento, orçamento, fornecedores, contratos, execução, pagamentos, qualidade e memória final da obra.

## Estado do projeto

- especificação funcional e modelo de dados revisados;
- protótipo HTML navegável disponível para validação;
- primeira fatia do backend NestJS e PostgreSQL implementada;
- frontend de produção ainda não iniciado.

## Diretórios principais

- [`backend/`](backend/README.md): API NestJS, migrações PostgreSQL e documentação técnica.
- [`backend/docs/`](backend/docs/README.md): arquitetura, banco, autenticação e guia da API.
- [`docs/`](docs/README.md): documentação de produto e arquitetura geral.
- [`prototipo/`](prototipo/prumo-v9-completo.html): protótipo navegável com dados fictícios.

## Backend

```powershell
cd backend
npm install
npm run build
npm test
```

A configuração, as migrações e a tela Swagger estão descritas no [README do backend](backend/README.md).

## Princípios

- orçamento, compromisso, execução e pagamento são grandezas separadas;
- cálculos monetários usam representação decimal;
- dados são isolados por organização e obra;
- alterações relevantes mantêm histórico e auditoria;
- registros financeiros aprovados serão corrigidos por revisão ou estorno rastreável;
- documentos e informações financeiras terão acesso restrito.
