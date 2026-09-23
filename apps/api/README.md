# 
https://www.prisma.io/docs/getting-started/prisma-postgres/import-from-existing-database-mysql

# Docker 

Run `docker-compose up -d`


# Scripts

- `pnpm dev` – run the API with ts-node-dev on port 3000
- `pnpm build` – generate the Prisma client and compile to `dist/`
- `pnpm start` – run the compiled API (`dist/api/index.js`)

# Tests

`pnpm test` runs the unit tests. The integration tests in `test/api.test.ts` need an
empty, disposable Postgres database (they truncate and seed the tables they use):

```
createdb qda_test
DATABASE_URL=postgresql://localhost/qda_test npx prisma db push --skip-generate
TEST_DATABASE_URL=postgresql://localhost/qda_test pnpm test
```

Without `TEST_DATABASE_URL` the integration tests are skipped. Never point it at the
production database.
