# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js with standalone output
WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV BUILD_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Prune devDependencies
WORKDIR /app
RUN pnpm prune --prod

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copy standalone output and static files from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

RUN mkdir -p .next/cache && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
