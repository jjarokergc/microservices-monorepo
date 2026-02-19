# syntax=docker/dockerfile:1.4

# Dockerfile - Production Image for Individual Service
#
# Build context must be the **root** of the monorepo!
# docker build -f apps/auth-service/Dockerfile -t auth-service:latest --target runner .
#
# ────────────────────────────────────────────────
# Stage 0: Common base with pnpm prepared
# ────────────────────────────────────────────────
FROM node:23-alpine AS base

ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    TURBO_TELEMETRY_DISABLED=1 \
    DO_NOT_TRACK=1

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ────────────────────────────────────────────────
# Stage Dev: Microservice install with dev dependencies for local development
# Microservice: auth-service
# ────────────────────────────────────────────────
FROM base AS development-server

# Copy dependency & workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy Build Files
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/common/package.json     ./packages/common/

# Install everything necessary for build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Source Code for this microservice + shared packages it depends on
COPY apps/auth-service ./apps/auth-service
COPY packages ./packages

# ────────────────────────────────────────────────
# Stage 1: Prune & install only production dependencies for this service + shared packages it uses
# ────────────────────────────────────────────────
FROM development-server AS prod-deps

# Prune the monorepo to only what's needed for this service
RUN pnpm --filter ./apps/auth-service --prod deploy --prod pruned --legacy

WORKDIR /app/pruned

# ────────────────────────────────────────────────
# Stage 2: Full monorepo install → build only what's needed
# ────────────────────────────────────────────────
FROM development-server AS build

# Build only this service + its dependencies
# ... syntax: tells turbo to include all dependencies of auth-service in the build graph
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm turbo run build --filter=./apps/auth-service...

# ────────────────────────────────────────────────
# Stage 3: Final production image combining prod deps and build output
# Two folders copied from previous stages
# Omits source code, dev dependencies, and build tools
# ────────────────────────────────────────────────
FROM node:23-alpine AS runner

# Create non-root user (Alpine style)
RUN addgroup -g 1001 nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy production artifacts from pruned prod-deps stage
COPY --from=prod-deps --chown=nodejs:nodejs /app/pruned/node_modules ./node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/pruned/package.json ./package.json

# Copy only the built output of this specific service
COPY --from=build --chown=nodejs:nodejs /app/apps/auth-service/dist ./dist

USER nodejs

EXPOSE 8080

# Start the server
CMD ["node", "dist/index.cjs"]
