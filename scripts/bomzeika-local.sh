#!/usr/bin/env bash
set -Eeuo pipefail

# Ambiente local do BOMzeika Obras.
# Uso no Windows: abra o Git Bash na raiz do projeto e execute:
#   ./scripts/bomzeika-local.sh setup
#   ./scripts/bomzeika-local.sh all

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-bomzeika}"
DB_USER="${DB_USER:-postgres}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-3100}"

DEV_USER_ID="${DEV_USER_ID:-00000000-0000-4000-8000-000000000001}"
DEV_ORGANIZATION_ID="${DEV_ORGANIZATION_ID:-00000000-0000-4000-8000-000000000002}"

log() { printf '\n\033[1;34m[BOMzeika]\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31m[Erro]\033[0m %s\n' "$*" >&2; exit 1; }

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório não encontrado: $1"
}

find_psql() {
  if command -v psql >/dev/null 2>&1; then
    command -v psql
    return
  fi

  local windows_psql="/c/Program Files/PostgreSQL/18/bin/psql.exe"
  [[ -x "$windows_psql" ]] || fail "psql não encontrado. Instale PostgreSQL 18 ou adicione psql ao PATH."
  printf '%s\n' "$windows_psql"
}

read_database_password() {
  if [[ -z "${DB_PASSWORD:-}" ]]; then
    read -r -s -p "Senha do PostgreSQL para ${DB_USER}: " DB_PASSWORD
    printf '\n'
  fi
  [[ -n "$DB_PASSWORD" ]] || fail "A senha do PostgreSQL é obrigatória."
  export DB_PASSWORD
}

configure_backend_environment() {
  read_database_password
  export NODE_ENV="development"
  export PORT="$BACKEND_PORT"
  export API_PREFIX="api/v1"
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  export JWT_SECRET="${JWT_SECRET:-BomzeikaJwtTeste2026_ChaveLocal_AlterarDepois}"
  export JWT_ISSUER="bomzeika-obras"
  export JWT_AUDIENCE="bomzeika-obras-api"
  export JWT_TTL_SECONDS="3600"
  export CORS_ORIGINS="http://localhost:${FRONTEND_PORT}"
  export RATE_LIMIT_TTL_MS="60000"
  export RATE_LIMIT_DEFAULT="120"
  export RATE_LIMIT_AUTH="10"
  export LOG_LEVEL="info"
  export DEV_USER_ID DEV_ORGANIZATION_ID
}

create_database() {
  local psql_bin
  psql_bin="$(find_psql)"
  export PGPASSWORD="$DB_PASSWORD"

  log "Validando PostgreSQL ${DB_HOST}:${DB_PORT}"
  "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
    -v ON_ERROR_STOP=1 -tAc "select 1" >/dev/null

  if [[ "$("$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "select 1 from pg_database where datname='${DB_NAME}'")" != "1" ]]; then
    log "Criando banco ${DB_NAME}"
    "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
      -v ON_ERROR_STOP=1 -c "create database ${DB_NAME}"
  else
    log "Banco ${DB_NAME} já existe"
  fi

  unset PGPASSWORD
}

setup() {
  require_command node
  require_command npm
  configure_backend_environment
  create_database

  log "Instalando dependências do frontend"
  (cd "$PROJECT_DIR" && npm install --no-audit --no-fund)

  log "Instalando dependências do backend"
  (cd "$BACKEND_DIR" && npm install --no-audit --no-fund)

  log "Aplicando migrações e dados demonstrativos"
  (cd "$BACKEND_DIR" && npm run migrate && npm run seed:dev)

  log "Validando frontend e backend"
  (cd "$PROJECT_DIR" && npm run lint && npm run build)
  (cd "$BACKEND_DIR" && npm run build && npm test)

  log "Configuração concluída"
}

start_frontend() {
  require_command npm
  log "Frontend: http://localhost:${FRONTEND_PORT}"
  (cd "$PROJECT_DIR" && npm run dev -- --port "$FRONTEND_PORT")
}

start_backend() {
  require_command npm
  configure_backend_environment
  log "Swagger: http://localhost:${BACKEND_PORT}/api/docs"
  (cd "$BACKEND_DIR" && npm run start:dev)
}

start_all() {
  configure_backend_environment
  log "Iniciando backend e frontend"
  (cd "$BACKEND_DIR" && npm run start:dev) &
  local backend_pid=$!

  cleanup() {
    log "Encerrando processos locais"
    kill "$backend_pid" 2>/dev/null || true
  }
  trap cleanup EXIT INT TERM

  (cd "$PROJECT_DIR" && npm run dev -- --port "$FRONTEND_PORT")
}

usage() {
  cat <<'EOF'
Uso: ./scripts/bomzeika-local.sh <comando>

Comandos:
  setup      cria o banco, instala, migra, popula e valida o projeto
  frontend   inicia somente o frontend em http://localhost:3000
  backend    inicia somente a API e o Swagger em http://localhost:3100/api/docs
  all        inicia frontend e backend no mesmo terminal
  help       exibe esta ajuda

Variáveis opcionais:
  DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_USER, JWT_SECRET
  FRONTEND_PORT, BACKEND_PORT, DEV_USER_ID, DEV_ORGANIZATION_ID
EOF
}

case "${1:-help}" in
  setup) setup ;;
  frontend) start_frontend ;;
  backend) start_backend ;;
  all) start_all ;;
  help|-h|--help) usage ;;
  *) usage; fail "Comando desconhecido: $1" ;;
esac
