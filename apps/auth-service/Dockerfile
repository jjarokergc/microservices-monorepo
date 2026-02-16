# Dockerfile - Production Image for Individual Service
#
# Build context must be the **root** of the monorepo!
# docker build -f apps/auth-service/Dockerfile -t auth-service:latest --target runner .
#
# ────────────────────────────────────────────────
# Stage 0: Common base with pnpm prepared
# ────────────────────────────────────────────────
FROM node:23.11.1-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 
WORKDIR /app

# ────────────────────────────────────────────────
# Stage 1: Prune & install only production dependencies for this service + shared packages it uses
# ────────────────────────────────────────────────
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copy only the folders needed for this service (adjust service name!)
COPY apps/auth-service ./apps/auth-service
# Shared packages this service depends on
COPY packages/common      ./packages/common
COPY packages/config      ./packages/config
COPY packages/vite-config ./packages/vite-config

# Prune the monorepo to only what's needed for this service
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/auth-service --prod deploy --prod pruned --legacy

WORKDIR /app/pruned

# ────────────────────────────────────────────────
# Stage 2: Full monorepo install → build only what's needed
# ────────────────────────────────────────────────
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copy minimal structure to make turbo happy
COPY apps ./apps
COPY packages ./packages
# Install everything (dev + prod)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

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
ENV NODE_ENV=production
CMD ["node", "dist/index.cjs"]
