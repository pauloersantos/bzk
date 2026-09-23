# API e tela Swagger

Com a API em execução, a tela interativa fica em:

`http://127.0.0.1:3100/api/docs`

O documento OpenAPI em JSON fica em `/api/docs-json`. Os DTOs expõem exemplos editáveis de payload, e o botão **Authorize** recebe um Bearer JWT.

## Rotas implementadas

| Método | Rota | Finalidade |
| --- | --- | --- |
| GET | `/api/v1/health/live` | vida do processo |
| GET | `/api/v1/health/ready` | conectividade com PostgreSQL |
| GET/POST | `/api/v1/projects` | listar e criar obras |
| GET | `/api/v1/projects/:projectId` | consultar obra |
| GET/POST | `/api/v1/catalog/stages` | catálogo de etapas |
| GET/POST | `/api/v1/catalog/services` | catálogo de serviços |
| GET/POST | `/api/v1/suppliers` | fornecedores |
| GET | `/api/v1/projects/:projectId/config` | configuração consolidada |
| POST | `/api/v1/projects/:projectId/config/stages` | adicionar etapa |
| POST | `/api/v1/projects/:projectId/config/services` | adicionar serviço e fornecedor |
| POST | `/api/v1/projects/:projectId/config/dependencies` | predecessor e sucessor |

## Erros

Erros seguem `application/problem+json` e incluem `status`, `detail`, `instance` e `requestId`. Respostas 500 não expõem mensagens internas. O mesmo requestId aparece no header da resposta e nos logs para diagnóstico.

## Limites da tela

O Swagger prova contrato, validação e roteamento. Operações de dados dependem das migrações aplicadas, do seed de desenvolvimento e de um token compatível. Ele não substitui testes de integração com RLS nem testes funcionais da interface web.
