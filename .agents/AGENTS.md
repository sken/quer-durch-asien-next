# Workspace Rules & Session Context

This file persists key session context, architectural choices, and constraints for all AI agents working in this repository.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend API**: Fastify, TypeScript, Node.js
- **Database**: PostgreSQL connected via Prisma ORM and Prisma Accelerate
- **Dependency Manager**: pnpm workspaces (managed via Turborepo)
- **Monorepo**: `quer-durch-asien-next` containing `apps/web` and `apps/api`

## 💻 Commands
- **Dev Server**: `pnpm run dev` (starts both web and api)
- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint`
- **Format**: `pnpm run format`
- **Prisma Generate**: `pnpm --filter quer-durch-asien-api run generate`

## 🏗️ Code Conventions
- **TypeScript**: Ensure strict typing across API schemas (Fastify) and Page components (Next.js).
- **Frontend Components**: Functional React components. Use Next.js Server Components by default; only use `"use client"` when hooks or browser APIs are required.
- **Styling**: Tailwind CSS for all styling.
- **Prisma**: Ensure client generation matches `schema.prisma` paths (`apps/api/src/generated/client`).

## 🛑 Boundaries
- **Routing constraints**: Respect legacy paths from the old WordPress/CodeIgniter app (e.g., dynamic `/[year]/[month]/[day]/[slug]` post routing) to preserve SEO.
- **Modifying Schema**: Ask before modifying `schema.prisma` or running migrations, as it affects the production database.

## 📄 Feature Specifications & Implementation Status
All original legacy features have been migrated and are currently in the implementation/review phase.
- **Specs Index**: `docs/specs/README.md`
- **Blog & Comments**: `docs/specs/01-blog-and-comments.md` [FULLY IMPLEMENTED]
- **Gallery & Albums**: `docs/specs/02-gallery-and-albums.md` [FULLY IMPLEMENTED]
- **GPS Routing Map**: `docs/specs/03-gps-routing-map.md` [FULLY IMPLEMENTED]
- **Color Search**: `docs/specs/04-color-search.md` [FULLY IMPLEMENTED]
- **Contact & Static Pages**: `docs/specs/05-contact-static-pages.md` [FULLY IMPLEMENTED] (Imprint/Contact obsolete; Packliste implemented)

## 🔄 Current Session State
- The legacy application (`../quer-durch-asien`) has been successfully reverse-engineered.
- Uncommitted changes currently exist containing the full implementation of the API routes and Next.js frontend pages. 
- **Next immediate goal**: Fix the ESLint `@typescript-eslint/no-unused-expressions` configuration error in `apps/web/src/app/[year]/[month]/[day]/[slug]/CommentForm.tsx` and commit the migration milestone.
