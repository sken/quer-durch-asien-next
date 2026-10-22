#!/usr/bin/env bash
# Runs once when the dev container / Codespace is created.
set -euo pipefail

cd "$(dirname "$0")/.."

# In a Codespace the browser reaches forwarded ports on *.app.github.dev,
# elsewhere (local VS Code) on localhost.
if [[ -n "${CODESPACE_NAME:-}" ]]; then
    domain="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
    api_url="https://${CODESPACE_NAME}-3000.${domain}"
    web_url="https://${CODESPACE_NAME}-4200.${domain}"
else
    api_url="http://localhost:3000"
    web_url="http://localhost:4200"
fi

# Local env files (gitignored). Existing files are left alone.
if [[ ! -f apps/api/.env ]]; then
    cat > apps/api/.env <<ENV
DATABASE_URL=${DATABASE_URL}
CORS_ORIGINS=http://localhost:4200,${web_url}
COMMENTS_AUTO_APPROVE=false
ENV
fi
if [[ ! -f apps/web/.env.local ]]; then
    echo "NEXT_PUBLIC_API_URL=${api_url}" > apps/web/.env.local
fi

# Install dependencies (runs `prisma generate` via postinstall)
pnpm install

# Wait for Postgres, then create the tables in the dev and test databases
until pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; do sleep 1; done
(cd apps/api && npx prisma db push --skip-generate)
(cd apps/api && DATABASE_URL="${TEST_DATABASE_URL}" npx prisma db push --skip-generate)

cat <<MSG

Dev container ready.
  pnpm dev                          start web (port 4200) and API (port 3000)
  pnpm --filter quer-durch-asien-api test     run the API tests
  cd apps/api && npx prisma studio  browse the database (port 5555)

The local database is empty. Import a copy of production with:
  pg_dump --no-owner --no-acl "<production connection string>" | psql "\$DATABASE_URL"
MSG
