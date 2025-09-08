# Copilot Instructions for quer-durch-asien-next

## Project Overview
- Monorepo managed with `pnpm` and TurboRepo. Main apps: `apps/web` (Next.js frontend) and `apps/api` (Node.js API with Prisma).
- Shared configs and tooling in `packages/` (eslint, jest, typescript).
- API uses Prisma ORM (`apps/api/prisma/schema.prisma`) and exposes routes in `apps/api/src/routes/`.
- Frontend uses Next.js app directory (`apps/web/src/app/`).

## Developer Workflows

**Install dependencies:** `pnpm install` (run at root)
**Start all apps:** `pnpm turbo run dev` (runs dev scripts for all packages)
**Build all apps:** `pnpm turbo run build` (runs build scripts for all packages)
**Lint all apps:** `pnpm turbo run lint` (uses shared config in `packages/eslint-config`)
**Start individual app:** `pnpm turbo run dev --filter web` or `--filter api`
**Prisma:** Update schema in `apps/api/prisma/schema.prisma`, then run `pnpx prisma generate --schema=apps/api/prisma/schema.prisma`
**Test:** No explicit test workflow found; check for test scripts in each package if needed.

## Conventions & Patterns
- **Routing:** API routes in `apps/api/src/routes/*.routes.ts`, schemas in `apps/api/src/schemas/`.
- **Plugins:** API plugins in `apps/api/src/plugins/` (e.g., `prisma.ts`, `swagger.ts`).
- **Frontend:** Main entry is `apps/web/src/app/page.tsx`. Global styles in `apps/web/src/app/globals.css`.
- **Config:** Shared TypeScript, ESLint, Jest configs in `packages/`.
- **Docker:** API can be run in Docker using `apps/api/docker-compose.yml`.

## Integration Points
- **Database:** Prisma connects to database defined in `apps/api/.env` (`DATABASE_URL`).
- **Frontend/Backend:** Both default to port 3000; ensure only one runs at a time or change ports.
- **VS Code Dev Container:** `.devcontainer/devcontainer.json` sets up environment, installs dependencies, and forwards port 3000.

## Examples
- To add a new API route: create a file in `apps/api/src/routes/`, define schema in `apps/api/src/schemas/`, and register in `app.ts`.
- To add a new shared config: update or add to `packages/` and reference in app `tsconfig.json` or `.eslintrc`.

## Quick Start
1. Open codespace (devcontainer auto-installs deps)
2. Start frontend: `pnpm --filter web dev`
3. Start API: `pnpm --filter api dev` or use Docker
4. Edit code in `apps/web/src/app/` or `apps/api/src/`

---
If any conventions or workflows are unclear, ask the user for clarification or examples from their recent work.
