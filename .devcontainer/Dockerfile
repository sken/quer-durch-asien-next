FROM mcr.microsoft.com/devcontainers/javascript-node:20-bullseye

# Enable corepack and ensure pnpm is available
RUN corepack enable && corepack prepare pnpm@latest --activate

# Add custom bashrc for pnpm PATH
COPY .bashrc /root/.bashrc
