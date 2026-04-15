# syntax=docker/dockerfile:1
# Monorepo API image — build from repository root:
#   docker build -t smartcart-api .
# Render: Root Directory empty, Dockerfile Path "Dockerfile", Docker Context "."
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
RUN npm ci
COPY server/prisma ./prisma
COPY server/tsconfig.json ./
COPY server/src ./src
# Prisma validate DATABASE_URL even at generate/build time.
# Render only injects secrets at runtime, so we pass a dummy URL for the build stage only.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY server/package*.json ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
