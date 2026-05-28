# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk upgrade --no-cache \
 && apk add --no-cache python3 make g++ \
 && corepack enable \
 && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk upgrade --no-cache \
 && corepack enable \
 && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY . .

WORKDIR /app/apps/api

RUN pnpm prisma generate \
 && pnpm run build

# ─── Stage 3: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production

RUN apk upgrade --no-cache

WORKDIR /app

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nestjs -u 1001 -G nodejs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist         ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma       ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/docker-entrypoint.sh ./
COPY --from=builder --chown=nestjs:nodejs /app/packages/types         ./packages/types

RUN chmod +x docker-entrypoint.sh

USER nestjs

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
