# Tasks: Auth & Login

## Phase 1: Prisma Schema

## Task 1.1: Rename Role enum + restructure User + add RefreshToken model ✅
- **Depends on**: none
- **Files**: `apps/api/prisma/schema.prisma`
- **Verification**: `npx prisma validate` — SOCIO|COLABORADOR; User: nombre/emoji/activo/estudioId, no deletedAt; RefreshToken: token/expira/revocado

## Task 1.2: Run migration, regenerate client, update seed ✅ (schema + client done, seed deferred to Phase 2)
- **Depends on**: 1.1
- **Files**: `prisma migrate dev`, `apps/api/src/scripts/seeds/user.seed.ts`
- **Verification**: migration clean; seed creates SOCIO 👑 with nombre+activo (no firstName/isVerified)
- **Note**: Schema applied via `prisma db push` (direct URL, port 5432 — PgBouncer blocks DDL). Client regenerated. Seed update deferred until repository layer matches new model.

## Phase 2: Backend Auth Logic

## Task 2.1: RefreshToken repo + UserRepository mods + DB module registration ✅
- **Depends on**: 1.2
- **Files**: `interfaces/refresh-token.interface.ts`, `repositories/refresh-token.repository.ts`, `repositories/user.repository.ts`, `interfaces/user.interface.ts`, `database.module.ts`
- **Verification**: RefreshTokenRepo: create/findByToken/revoke; UserRepo: softDelete→activo=false, findByActivo; DB module exports both

## Task 2.2: AuthService — login (persist RefreshToken + cookie), signup (SOCIO-only) ✅
- **Depends on**: 2.1
- **Files**: `src/modules/auth/services/auth.service.ts`, `src/modules/auth/controllers/auth.public.controller.ts`, `src/modules/auth/dtos/auth.signup.dto.ts`
- **Verification**: login→200+Set-Cookie+DB row (BE3); signup: SOCIO→201, anonymous→401, COLABORADOR→403, new user=COLABORADOR (BE4)

## Task 2.3: AuthService — refresh (DB rotation), logout (revoke+clear cookie) ✅
- **Depends on**: 2.1
- **Files**: `src/modules/auth/services/auth.service.ts`, `src/modules/auth/controllers/auth.public.controller.ts`, `src/modules/auth/providers/jwt-refresh.strategy.ts`, `src/modules/auth/dtos/auth.response.dto.ts`
- **Verification**: refresh: valid→new pair+old revoked, expired→401 (BE5); logout: revoke→200+cookie cleared, post-logout→401 (BE6)

## Phase 3: DTOs, Controller, Guards, i18n

## Task 3.1: Update auth+user DTOs and AuthPublicController ✅
- **Depends on**: 2.2, 2.3
- **Files**: `dtos/auth.signup.dto.ts`, `dtos/auth.response.dto.ts`, `dtos/user.dto.ts`, `dtos/user.update.dto.ts`, `controllers/auth.public.controller.ts`
- **Verification**: signup has nombre; UserResponseDto exposes new fields; controller: signup=@AllowedRoles([SOCIO]), POST logout + GET users exist
- **Note**: DTOs and controller already updated in Phase 2. Fixed googleTokens type in user.dto.ts, added `as any` casts in user.repository.ts for Prisma Json compatibility. Verificado: tsc --noEmit src/ = 0 errors.

## Task 3.2: Update guards/decorators to new roles + i18n ✅
- **Depends on**: 1.2
- **Files**: `guards/roles.guard.ts`, `decorators/roles.decorator.ts`, `en/auth.json`, `en/user.json`
- **Verification**: no ADMIN/MEMBER/DEVELOPER refs; SOCIO-only blocks COLABORADOR (BE7); i18n has logout/rotation/insufficientPermissions keys
- **Note**: roles.guard.ts and roles.decorator.ts use UserRole enum — no changes needed. user.admin.controller.ts changed to @AllowedRoles([UserRole.SOCIO]). Seed updated: UserRole.SOCIO, emoji '👑', nombre field. seed.config.ts changed userName→nombre. CLAUDE.md and .claude/ files updated: ADMIN→SOCIO. i18n auth.json has all required keys (loggedOut, tokensRefreshed, insufficientPermissions). user.json has no ADMIN/MEMBER/DEVELOPER refs.

## Phase 4: Backend Tests

## Task 4.1: Unit tests — AuthService + RefreshTokenRepository + RolesGuard
- **Depends on**: 2.3, 3.2
- **Files**: `test/modules/auth/services/auth.service.spec.ts`, `test/common/database/repositories/refresh-token.repository.spec.ts`, `test/common/request/guards/roles.guard.spec.ts`
- **Verification**: 100% coverage BE3-BE7; guard: SOCIO passes, COLABORADOR→ForbiddenException

## Task 4.2: E2E — login→refresh→logout cycle via Supertest
- **Depends on**: 4.1
- **Files**: `test/modules/auth/auth.e2e-spec.ts`
- **Verification**: login→200+tokens+cookie; refresh→new pair+old revoked; logout→cleared; post-logout→401

## Phase 5: Frontend Auth Infrastructure

## Task 5.1: Axios instance (interceptors) + Zustand auth store ✅
- **Depends on**: 2.3
- **Files**: `apps/web/package.json`, `lib/auth/axios-instance.ts`, `features/auth/store/auth.types.ts`, `features/auth/store/auth.store.ts`, `types/auth.ts`
- **Verification**: interceptor: inject Bearer, 401→refresh→retry (FE3); store: user/token/isAuthenticated, login/logout/refresh (FE1)

## Task 5.2: Auth API service + AuthProvider (wire into providers.tsx) ✅
- **Depends on**: 5.1
- **Files**: `features/auth/api/types.ts`, `features/auth/api/service.ts`, `layout/auth-provider.tsx`, `layout/providers.tsx`
- **Verification**: service hits /v1/auth/*; AuthProvider on mount→refresh()→hydrate; nested in providers

## Phase 6: Frontend Login Page

## Task 6.1: UserPicker + LoginForm components ✅
- **Depends on**: 5.2
- **Files**: `features/auth/components/user-picker.tsx`, `features/auth/components/login-form.tsx`
- **Verification**: picker: emoji+nombre grid from getActiveUsers; form: password input→login (FE2)

## Task 6.2: LoginPage orchestrator + /login route ✅
- **Depends on**: 6.1
- **Files**: `features/auth/components/login-page.tsx`, `app/login/page.tsx`
- **Verification**: /login→picker→form→login→redirect /dashboard; authenticated bypass (FE2+FE4)

## Phase 7: Route Protection

## Task 7.1: Middleware.ts + nav-config/use-nav RBAC ✅
- **Depends on**: 5.2
- **Files**: `apps/web/src/middleware.ts`, `config/nav-config.ts`, `hooks/use-nav.ts`, `app/dashboard/layout.tsx`, `types/index.ts`
- **Verification**: no cookie→/login; has cookie on /login→/dashboard; nav filtered by role; no Clerk (FE4)
- **Note**: Middleware created at `src/middleware.ts` (Edge-compatible). NavItem type extended with `roles` field. Clerk `access` properties removed from nav-config. `useFilteredNavGroups` filters groups by role from Zustand store. Dashboard layout adds server-side cookie check as middleware backup.

## Phase 8: Integration

## Task 8.1: Manual E2E — login→dashboard→refresh→logout
- **Depends on**: 7.1, 6.2, 4.2
- **Verification**: SOCIO seed login→dashboard; Axios injects token; background refresh; logout→cleared→/login redirect (FE3+FE5)
