# BOMzeika Obras API

Primeira fatia executável do backend em NestJS e PostgreSQL. Ela cobre cadastro de obras, catálogo de etapas e serviços, fornecedores e configuração da obra com predecessor, sucessor e fornecedor principal. Os demais módulos do produto continuam documentados e ainda não estão implementados nesta API.

## Requisitos

- Node.js 22 ou superior
- PostgreSQL 16 ou superior com `pgcrypto`
- um banco e um usuário próprios para a aplicação

## Configuração protegida

As variáveis operacionais ficam em um envelope AES-256-GCM. A chave mestra não pode ficar no repositório nem dentro do arquivo criptografado; ela deve ser entregue pelo gerenciador de segredos do ambiente ou por um arquivo montado com acesso restrito.

1. Copie `.env.example` para `.env.local` e substitua todos os exemplos.
2. Gere uma chave fora do repositório:

   ```powershell
   $bytes = New-Object byte[] 32
   [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
   [Convert]::ToBase64String($bytes) | Set-Content "$HOME/.bomzeika-master-key"
   $env:CONFIG_MASTER_KEY_FILE = "$HOME/.bomzeika-master-key"
   ```

3. Criptografe a configuração e apague o texto aberto:

   ```powershell
   npm run config:encrypt -- .env.local config/runtime.env.encrypted
   Remove-Item .env.local
   ```

`CONFIG_MASTER_KEY_FILE`, `CONFIG_MASTER_KEY` e `ENCRYPTED_ENV_FILE` são parâmetros de inicialização. A chave é o único segredo de bootstrap e precisa permanecer externa. Em produção, a API recusa iniciar sem o envelope criptografado.

## Banco, execução e testes

Com a chave disponibilizada no processo:

```powershell
npm install
npm run migrate:status
npm run migrate
npm run seed:dev
npm run token:dev
npm run start:dev
```

O `seed:dev` é exclusivo de desenvolvimento e cria dados fictícios identificados. Migrações são imutáveis e registradas com checksum. O contexto de organização, usuário e requisição é aplicado em cada transação para as políticas RLS.

Validação local:

```powershell
npm run build
npm test
```

## Tela de testes das APIs

Após iniciar a API, abra `http://127.0.0.1:3100/api/docs`. A tela Swagger contém os endpoints, esquemas e exemplos de payload. Gere um token com `npm run token:dev`, clique em **Authorize** e informe o JWT.

Exemplo de criação de obra:

```json
{
  "name": "Residência Jardins — demonstração",
  "address": "Alameda Exemplo, 100 — São Paulo/SP",
  "builtAreaM2": "845.5000",
  "approvedBudget": "12500000.00",
  "plannedStart": "2026-10-01",
  "plannedEnd": "2028-03-31",
  "status": "planning"
}
```

Exemplo de configuração de dependência:

```json
{
  "predecessorStageId": "11111111-1111-4111-8111-111111111111",
  "successorStageId": "22222222-2222-4222-8222-222222222222",
  "dependencyType": "FS",
  "lagDays": 2,
  "reason": "A estrutura deve terminar antes do início das vedações"
}
```

## Controles já presentes

- JWT com emissor e audiência validados;
- limite global de requisições parametrizado;
- validação de payload com campos desconhecidos rejeitados;
- CORS por lista permitida e corpo JSON limitado a 1 MB;
- cabeçalhos Helmet, correlação por `requestId` e logs com campos sensíveis ocultados;
- isolamento por organização e obra por RLS;
- auditoria append-only, versões históricas e revisão da configuração;
- valores monetários e quantitativos em `numeric`, sem ponto flutuante.

As migrações devem ser aplicadas com um papel proprietário. A API em execução deve usar um papel sem `BYPASSRLS` e sem privilégios de proprietário sobre as tabelas.
