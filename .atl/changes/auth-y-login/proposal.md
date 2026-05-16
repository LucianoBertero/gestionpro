# Proposal: Auth & Login

## Intent

Reemplazar el módulo auth del template hmake98 (roles ADMIN/MEMBER/DEVELOPER, signup público, refresh tokens sin DB) por el sistema de autenticación definido en el doc técnico §0.2–§0.3: roles SOCIO/COLABORADOR, refresh tokens rotativos DB-backed, signup solo SOCIO, y frontend con login visual + Zustand + Axios interceptor. **Módulo fundación Etapa 0** — todo lo demás depende de él.

## Scope

### In Scope
- Migrar enum de roles a `SOCIO | COLABORADOR`
- User: `nombre` (unificado), `emoji`, `telegramChatId`, `estudioId=1`, `googleTokens`, `activo`
- Modelo `RefreshToken`: token hash, expira, revocado, usuarioId
- Refresh rotativo con revocación DB + endpoint logout
- Signup restringido a SOCIO
- Frontend: auth store (Zustand), login con selector visual, Axios interceptor (inject + 401 refresh), middleware de protección
- Actualizar DTOs, i18n, seed users

### Out of Scope
- Cron cleanup tokens, integración Google/Telegram, multitenancy real
- Cold start password, rate limiting adicional

## Capabilities

### New Capabilities
- `auth-backend`: JWT access 15min + refresh 7d rotativo, roles, signup restringido, logout con revocación
- `auth-frontend`: Login visual con emoji-selector, Zustand store, Axios interceptor auto-refresh, route protection

### Modified Capabilities
None — no hay specs previos.

## Approach

**Backend-first**: modificar schema Prisma → migrar → adaptar servicios auth → testear. Luego frontend: instalar Axios → store → login → interceptor → middleware.

Orden migración: (1) Role enum, (2) User fields, (3) RefreshToken model.

Decisiones ya tomadas: PKs UUID String, campo único `nombre`, soft-delete vía `activo`, refresh token DB-backed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/prisma/schema.prisma` | Modified | Role enum, User fields, nuevo RefreshToken |
| `apps/api/src/modules/auth/` | Modified | Signup SOCIO-only, logout, refresh DB rotation |
| `apps/api/src/modules/user/` | Modified | DTOs, service, repository → nuevo schema |
| `apps/api/src/common/request/` | Modified | Guards/decorators a nuevos roles |
| `apps/api/src/config/`, `src/common/i18n/` | Modified | Seed + mensajes |
| `apps/web/src/features/auth/` | **New** | Login page, componentes, store |
| `apps/web/src/lib/auth/` | **New** | Axios instance + interceptor |
| `apps/web/src/middleware.ts` | **New** | Protección de rutas |
| `apps/web/package.json`, `providers.tsx`, `config/` | Modified | axios, AuthProvider, limpiar Clerk |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Migración Prisma rompe DB dev con datos | Med | Backup + seed regenerativo |
| Guards dependen de enum viejo → runtime errors | High | Cambiar enum + TODAS las refs, correr tests antes del frontend |
| Token expirado sin refresh automático → UX rota | Med | Axios interceptor con cola de requests pendientes |
| Cookie httpOnly en dev local cross-origin | Low | Cookie en prod, localStorage en dev con flag de entorno |

## Rollback Plan

1. `prisma migrate reset` o generar rollback migration
2. Revertir schema: `git checkout HEAD~1 -- apps/api/prisma/`
3. Revertir código backend auth/user: `git checkout HEAD~1 -- apps/api/src/modules/auth/ apps/api/src/modules/user/ apps/api/src/common/`
4. Frontend: eliminar `src/features/auth/`, `src/lib/auth/`, revertir providers, desinstalar axios

## Dependencies

Ninguna — módulo fundación. Todos los módulos siguientes dependen de este.

## Success Criteria

- [ ] Login email+password → access 15min + refresh 7d (httpOnly cookie)
- [ ] Refresh rota tokens: nuevo access + nuevo refresh, revoca anterior en DB
- [ ] Logout revoca refresh, frontend limpia store
- [ ] Solo SOCIO crea usuarios
- [ ] Login frontend: selector visual de usuarios → pide password
- [ ] Axios interceptor: inject token + auto-refresh en 401
- [ ] Middleware redirige a /login sin sesión
- [ ] Tests auth pasan (100% coverage)
