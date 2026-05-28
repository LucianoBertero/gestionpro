# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk upgrade --no-cache \
 && apk add --no-cache python3 make g++ \
 && corepack enable \
 && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production

RUN apk upgrade --no-cache

WORKDIR /app

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nestjs -u 1001 -G nodejs

# Copy entire workspace with node_modules intact
COPY --from=builder /app /app

# Set proper ownership
RUN chown -R nestjs:nodejs /app

WORKDIR /app/apps/api

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
