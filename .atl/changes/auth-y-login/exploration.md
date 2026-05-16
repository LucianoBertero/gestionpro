# Exploration: Auth & Login (auth-y-login)

## Current State (Backend)

### What exists
- **Auth module** (`apps/api/src/modules/auth/`) fully functional from hmake98 template:
  - `AuthPublicController`: `POST /v1/auth/login`, `POST /v1/auth/signup`, `GET /v1/auth/refresh-token`
  - `AuthService`: login (argon2 verify), signup (argon2 hash), refreshTokens, signTokens (JWT access + refresh)
  - `JwtAccessStrategy` + `JwtRefreshStrategy`: passport-jwt, bearer token extraction
  - `AuthModule` imports: DatabaseModule, PassportModule, JwtModule.register({})
- **Guards** (`apps/api/src/common/request/guards/`):
  - `JwtAccessGuard` (global APP_GUARD): skips `@PublicRoute()`, validates Bearer token
  - `JwtRefreshGuard`: per-endpoint only on refresh-token
  - `RolesGuard` (global APP_GUARD): checks `@AllowedRoles([...])`, skips if no metadata
  - Order: ThrottlerGuard → JwtAccessGuard → RolesGuard
- **User model** (`prisma/schema.prisma`):
  - Fields: id (UUID), userName, email, passwordHash, firstName?, lastName?, isVerified, phone?, role (ADMIN|MEMBER|DEVELOPER), avatar?, timestamps (createdAt, updatedAt, deletedAt)
  - No emoji, no telegramChatId, no estudioId
- **User repository**: findById, findByEmail, existsById, existsByEmail, create, update, softDelete
- **User DTO**: UserResponseDto with all fields (passwordHash excluded), UserUpdateDto
- **Config**: `auth.accessToken.secret/exp`, `auth.refreshToken.secret/exp` — env: AUTH_ACCESS_TOKEN_EXP=15m ✅, AUTH_REFRESH_TOKEN_EXP=7d ✅
- **Seed**: Admin user (role=ADMIN, email/password from env)
- **i18n**: auth.json (login/signup/refresh messages + error keys), user.json (profile/update/delete)
- **No RefreshToken model in Prisma** — tokens are stateless (signed, not stored in DB)

### What works
- Login with email+password ✅
- JWT access token validation (global guard) ✅
- Role-based access control (ADMIN) ✅
- Refresh token endpoint ✅
- Public routes bypass JwtAccessGuard ✅

## Current State (Frontend)

### What exists
- **Zustand** installed (`^5.0.12`) but NO stores created (zero usage in src/)
- **api-client.ts**: bare `fetch()` wrapper to `/api` — no JWT, no interceptors, no auth header
- **query-client.ts**: TanStack Query client with 60s staleTime — no auth awareness
- **providers.tsx**: only ActiveThemeProvider + QueryProvider — no AuthProvider
- **No auth pages**: `src/app/auth/` does not exist, `src/features/auth/` does not exist
- **No middleware**: no `middleware.ts` for route protection
- **Dashboard layout**: unprotected — anyone can access `/dashboard/*`
- **Nav config**: still has Clerk RBAC patterns (`requireOrg`, `permission`, `plan`)
- **Clerk removed** from codebase, but text traces remain in about/privacy pages
- **Axios** not in package.json (needs install)

### What's missing — entirely
- Auth Zustand store
- Login page with user selector
- JWT token management (storage, refresh, attach to requests)
- Route protection (middleware or HOC)
- Role-based nav filtering (SOCIO vs COLABORADOR)
- Axios interceptor for token injection and 401 refresh

## Target State (from doc técnico)

### Section 0.2 — Auth completo
1. Registro de usuario: **solo SOCIO** puede crear usuarios (actualmente público)
2. Login: email+password → access token 15min + refresh token 7d
3. **Refresh token rotativo**: cada uso genera uno nuevo, invalida el anterior (DB-backed)
4. **Logout**: revoca refresh token en DB
5. JwtAuthGuard en todos los endpoints protegidos
6. RolesGuard con `@Roles(Rol.SOCIO)`

### Section 0.3 — Selección de perfil en frontend
1. Pantalla de login con **selector visual de usuario** (emoji-based picker)
2. Seleccionar usuario → pedir password
3. Token en memoria (Zustand) + refresh token en **cookie httpOnly**
4. **Interceptor Axios**: adjunta token, refresca si expira

### Section 4 — User model
- `id Int @id @default(autoincrement())` (template usa UUID String)
- `nombre String` (template usa firstName+lastName)
- `rol Rol @default(COLABORADOR)` — values: SOCIO, COLABORADOR
- `emoji String?` — avatar emoji para selector visual
- `telefono String?` (equivale a `phone`)
- `telegramChatId String?` — para bot Telegram
- `estudioId Int @default(1)` — preparado para multitenancy
- `googleTokens Json?` — OAuth Google Calendar
- `activo Boolean @default(true)` — en lugar de soft delete (deletedAt)
- Sin `userName`, sin `isVerified`, sin `firstName/lastName`
- RefreshToken model separado con `usuarioId`

## Gap Analysis

### Backend — Must Change

| # | Gap | Current | Target | Effort |
|---|-----|---------|--------|--------|
| B1 | Role enum | ADMIN, MEMBER, DEVELOPER | SOCIO, COLABORADOR | Low |
| B2 | User PK type | String UUID | Int autoincrement | **HIGH** — cascade to ALL models/relations |
| B3 | User fields | firstName, lastName, userName, phone, isVerified | nombre, telefono, emoji, telegramChatId, activo | Medium |
| B4 | estudioId field | Missing | Int @default(1) | Medium |
| B5 | googleTokens field | Missing | Json? | Low |
| B6 | RefreshToken model | Missing | New table (usuarioId, token, expira, revocado) | Medium |
| B7 | Refresh token rotation | Stateless (no DB storage) | DB-backed: store token, revoke old on refresh | High |
| B8 | Logout endpoint | Missing | New endpoint: revoke refresh token | Medium |
| B9 | Signup restriction | Public (anyone can signup) | Only SOCIO can create users | Medium |
| B10 | Seed users | 1 admin with ADMIN role | SOCIO users + COLABORADOR users | Low |
| B11 | User DTOs | Reflect current fields | Update to new fields (nombre, emoji, etc.) | Low |
| B12 | i18n keys | Admin-focused error messages | SOCIO/COLABORADOR messages | Low |

### Frontend — Must Create

| # | Gap | State | Effort |
|---|-----|-------|--------|
| F1 | Zustand auth store | Missing entirely | Medium |
| F2 | Axios instance + interceptor | Missing (needs `npm install axios`) | Medium |
| F3 | Login page | Missing entirely | High — visual user selector UX |
| F4 | Auth route protection | No middleware, no HOC | Medium |
| F5 | AuthProvider component | Not in providers.tsx | Medium |
| F6 | api-client rewrite | Fetch → Axios with auth | Medium |
| F7 | Role-based nav filtering | Clerk RBAC → role-based (use-nav.ts) | Medium |
| F8 | httpOnly cookie for refresh token | Not implemented | Low |
| F9 | Remove Clerk text traces | about/page.tsx, privacy-policy/page.tsx | Low |

## Risk Assessment

### 🔴 Critical Decision: UUID vs Int PKs
The template uses `String @id @default(uuid())` for ALL models. The doc técnico uses `Int @id @default(autoincrement())` for ALL models. This is a **cascade decision**:
- If we keep UUID → every FK in target models (Cliente.encargadoId, Tarea.usuarioId, etc.) becomes String
- If we switch to Int → template user module, guards, strategies, JWT payload (userId) changes
- **Recommendation**: KEEP UUID. It aligns with the template, avoids migration hell, and all existing relation patterns (guards, repository, service) already expect String. Update doc técnico to use UUID. This is the pragmatic choice for Stage 0.

### 🟡 Refresh Token DB Storage
The template's stateless refresh tokens are simpler but the doc requires rotating tokens stored in DB. This adds:
- New RefreshToken model + repository + migration
- Token revocation on refresh and logout
- Cron job for expired token cleanup (future)

### 🟡 Nombre vs firstName+lastName
The doc uses a single `nombre` field. The template has `firstName` and `lastName`. Simplifying to one field simplifies the UI (no last name to fill) but loses structured data. Recommend using `nombre` as the doc specifies — this is an internal tool for ~8 users, not a public app.

### 🟢 Low Risk Items
- Role enum change: simple Prisma migration, few references
- Emoji/telegramChatId: nullable new fields, no impact
- Frontend: entirely new code, no risk of breaking existing things (there's nothing to break)
- Axios: needs installation but is in the approved stack

### Dependencies
- Backend changes must complete before frontend login page can be tested
- Prisma migration order: 1) Role enum, 2) User model changes, 3) RefreshToken model
- Frontend depends on backend auth endpoints being deployed/accessible

## Ready for Proposal
Yes. The exploration is complete. Key architectural decisions to resolve before design:
1. **UUID vs Int PKs** — recommend keeping UUID (template convention)
2. **nombre vs firstName+lastName** — recommend `nombre` (doc convention, simpler)

These decisions should be confirmed in the proposal before design begins.
