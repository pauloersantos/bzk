# Documentação técnica do backend

Este diretório documenta a primeira fatia implementada da API do BOMzeika Obras. Ele diferencia o que já existe em código do que ainda depende das próximas fatias.

| Documento | Conteúdo |
| --- | --- |
| [arquitetura.md](arquitetura.md) | Componentes, limites e fluxo de uma requisição |
| [banco-de-dados.md](banco-de-dados.md) | Migrações, RLS, histórico e auditoria |
| [autenticacao-segura.md](autenticacao-segura.md) | Controles existentes e desenho do fluxo completo de autenticação |
| [api-e-swagger.md](api-e-swagger.md) | Rotas implementadas, exemplos e tela de testes |

## Estado da entrega

Implementado: fundação NestJS, configuração protegida, JWT de acesso, rate limit global, cadastros iniciais, configuração de etapas e serviços, migrações, RLS, auditoria e Swagger.

Pendente: autenticação de produção, MFA, recuperação de senha, módulos financeiros, contratos, documentos, diário de obra e demais funcionalidades descritas na especificação funcional geral.
