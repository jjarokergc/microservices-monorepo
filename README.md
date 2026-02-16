# Microservices Express Typescript Template

--DRAFTING--

This is a blueprint for multiple Express-TypeScript microservices that are deployed through Kubernetes.

## Tooling

- pnpm
- Turborepo
- TypeScript
- Kubernetes

## Initialize monorepo

```bash
mkdir microservices-monorepo
cd microservices-monorepo

pnpm init
pnpm add -D turbo typescript @types/node
```

## Build Common Packages

Build packages/comon separately and import the compiled output

packages/common-express/pnpm build

## Folder Structure

```
microservices-monorepo/
├── apps/                       # ← actual runnable services (each like original template)
│   ├── auth-service/           # example microservice
│   │   ├── src/
│   │   │   ├── api/            # routes, controllers, services, repos (copied/adapted)
│   │   │   ├── index.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── tsconfig.json       # extends shared/tsconfig.base.json
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── product-service/        # similar structure
│   ├── order-service/
│   └── gateway/                # optional: API gateway / BFF (e.g. express or traefik)
├── packages/                   # shared, reusable code
│   ├── common/                 # most important shared package
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── requestLogger.ts
│   │   │   │   └── rateLimiter.ts
│   │   │   ├── health/
│   │   │   │   └── healthRouter.ts          # reusable health check
│   │   │   ├── openapi/
│   │   │   │   ├── openAPIDocumentGenerator.ts
│   │   │   │   ├── openAPIResponseBuilders.ts
│   │   │   │   └── openAPIRouter.ts         # reusable OpenAPI
│   │   │   ├── utils/
│   │   │   │   ├── envConfig.ts
│   │   │   │   ├── httpHandlers.ts
│   │   │   │   └── commonValidation.ts
│   │   │   └── types/
│   │   │       └── serviceResponse.ts
│   │   ├── package.json        # "name": "@example-org/common"
│   │   └── tsconfig.json
│   ├── config/                 # shared eslint, prettier, tsconfig bases
│   │   ├── eslint/
│   │   ├── prettier/
│   │   └── tsconfig.base.json
│   ├── vite-config/                   # shared base config
│   │   ├── src/
│   │   │   └── base.mts               # export default defineConfig({ ... })
│   │   ├── package.json               # "name": "@example-org/vite-config"
│   │   └── tsconfig.json
│   └── db-utils/               # (optional) shared mongoose utils, prisma client, etc.
├── infra/
│   └── k8s/                    # Kubernetes manifests (ArgoCD / Flux style)
│       ├── base/
│       ├── auth-service/
│       ├── product-service/
│       └── ...
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                # root – mostly devDependencies
├── .gitignore
└── README.md
```

## Testing

Vitest is a local workspace package and used for multiple back-end services. In root package.json. A symlink will be created in auth-service:

```bash
pnpm add -D -w vite vitest vite-tsconfig-paths   # workspace-wide dev tools
pnpm add -D @example-org/vite-config@workspace:* --filter @example-org/auth-service
```

Each consumer has its own `vite.config.mts`. A shared base configuration is in packages.

## Local Development

This template requires a mongodb server:

```bash
docker pull mongo
docker run --name mongodb -p 37017:27017 -d mongo
```

## Docker

Run from the root of the monorepo

```bash
docker build -f apps/auth-service/Dockerfile -t auth-service:latest --target runner .
docker run -p 3000:3000 --env-file apps/auth-service/.env auth-service
```

### Development (with persistent Mongo)

docker compose --profile dev up --build -d

### Check logs

docker compose --profile dev logs -f app-dev

### Stop (data survives)

docker compose --profile dev down

### Production (no mongo in compose — assume external)

docker compose --profile prod up --build -d
