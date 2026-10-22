# QUER DURCH ASIEN NEXT
Travel photo blog "Quer durch Asien": Next.js frontend (`apps/web`) and Fastify + Prisma API (`apps/api`) on PostgreSQL.

## Getting started

### GitHub Codespaces (or VS Code Dev Containers)

On GitHub: **Code → Codespaces → Create codespace on this branch**. The container comes with
Node 22, pnpm, a Postgres 16 database and all dependencies installed. Then:

```bash
pnpm dev                                  # web on port 4200, API on port 3000 (Swagger at /docs)
cd apps/api && npx prisma studio          # browse the database on port 5555
pnpm test                                 # API unit + integration tests
```

The database starts empty. To work with real content, import a copy of production:

```bash
pg_dump --no-owner --no-acl "<production connection string>" | psql "$DATABASE_URL"
```

The colour search and the comment form call the API from the browser. In a Codespace, set
port 3000 to **Public** in the Ports tab, or those requests are blocked by GitHub's login check.

### Local

```bash
pnpm install
cp apps/api/.env.example apps/api/.env    # set DATABASE_URL
pnpm dev
```
