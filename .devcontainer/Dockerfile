FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

# psql/pg_dump for importing and inspecting the database
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# pnpm via corepack; the version comes from "packageManager" in package.json
RUN corepack enable
