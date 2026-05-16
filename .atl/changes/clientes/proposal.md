# Proposal: Módulo Clientes

## Intent

Construir desde cero el módulo Clientes (Etapa 1 Core). Cero código existe. Backend: CRUD con filtrado, soft-delete, legajo, impuestos por cliente, semáforo stubbed. Frontend: tabla con filtros, formulario sheet, legajo con tabs, CUIT autocomplete AFIP mock. SOCIO gestiona todo; COLABORADOR solo ve sus clientes asignados.

## Scope

### In Scope
- 2 modelos Prisma: `Cliente`, `ClienteImpuesto` + 2 enums: `TipoImpuesto`, `EstadoSemaforo`
- CRUD backend con split controller (Public + Admin), siguiendo patrón UserModule
- COLABORADOR auto-filter: `where: { encargadoId: authUser.userId }` en todas las queries GET
- Legajo: GET /clientes/:id con impuestos incluidos
- AFIP autocomplete mock (GET /clientes/afip/:cuit → datos estáticos de muestra)
- Semáforo stubbed VERDE (lógica real depende de Tareas/Liquidaciones, no existen aún)
- Frontend: página lista con DataTable + filtros, página legajo con tabs, sheet create/edit
- Nav item Clientes con RBAC SOCIO/COLABORADOR

### Out of Scope
- Semáforo real (requiere Tareas + Liquidaciones)
- AFIP integración real (requiere certificado fiscal, scoping aparte)
- Excel import/export clientes
- Portal Cliente, comunicaciones, archivos en legajo (tabs vacíos stubbed)

## Capabilities

### New Capabilities
- `clientes-backend`: CRUD clientes con impuestos, filtrado por encargado, semáforo stubbed, soft-delete
- `clientes-frontend`: tabla paginada con filtros, sheet create/edit, legajo con tabs, AFIP autocomplete mock

### Modified Capabilities
None — no hay specs previos.

## Approach

**Backend-first**: schema Prisma → migración → repositorio → service → controllers → i18n → tests. Luego frontend: tipos → service → queries/mutations → componentes → páginas.

Arquitectura: `ClientesPublicController` (GET lista/legajo/afip, JWT) + `ClientesAdminController` (POST/PATCH/DELETE, SOCIO-only). Service inyecta `encargadoId` auto-filter según `authUser.role`. Create incluye `tipoImpuesto[]` → crea `ClienteImpuesto` records en transacción.

DTOs: `ClienteCreateDto` (class-validator: cuit único, encargadoId required, tipoImpuesto array), `ClienteUpdateDto` (partial), `ClienteLegajoResponseDto` (con impuestos). `actividades` se recibe como string[] (Prisma nativo).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/prisma/schema.prisma` | Modified | +2 models, +2 enums |
| `apps/api/src/common/database/enums/` | **New** | tipo-impuesto.enum.ts, estado-semaforo.enum.ts |
| `apps/api/src/common/database/repositories/` | **New** | cliente.repository.ts |
| `apps/api/src/common/database/interfaces/` | **New** | cliente.interface.ts |
| `apps/api/src/modules/clientes/` | **New** | Module, service, 3 controllers, 4 DTOs |
| `apps/api/src/languages/en/` | **New** | clientes.json i18n |
| `apps/api/src/app/app.module.ts` | Modified | +ClientesModule import |
| `apps/api/src/common/database/database.module.ts` | Modified | +ClienteRepository provider |
| `apps/web/src/features/clientes/` | **New** | api/, schemas/, components/ (tabla, sheet, legajo, afip-search) |
| `apps/web/src/app/dashboard/clientes/` | **New** | page.tsx (lista), [id]/page.tsx (legajo) |
| `apps/web/src/config/nav-config.ts` | Modified | +Clientes nav item |
| `apps/web/src/components/icons.tsx` | Modified | +icons (Building, TrafficCone, IdCard) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| AFIP mock no escala a integración real | Med | Aislar en `afip.service.ts` con interfaz clara, fácil reemplazar |
| Semáforo siempre VERDE hasta Tareas/Liquidaciones | High | Stub explícito con TODO comments, recalcular cuando módulos existan |
| String[] (actividades) mal serializado por class-validator | Low | `@IsArray()` + `@IsString({ each: true })`, tests de integración |
| ClienteImpuesto en create requiere transacción | Med | `prisma.$transaction` al crear cliente + impuestos juntos |

## Rollback Plan

1. Revertir migración: `prisma migrate reset` o `prisma migrate diff` rollback
2. Revertir schema: `git checkout HEAD~1 -- apps/api/prisma/`
3. Revertir backend: `git checkout HEAD~1 -- apps/api/src/modules/clientes/ apps/api/src/common/`
4. Revertir frontend: eliminar `apps/web/src/features/clientes/`, `apps/web/src/app/dashboard/clientes/`
5. Revertir nav-config + icons: `git checkout HEAD~1 -- apps/web/src/config/ apps/web/src/components/icons.tsx`

## Dependencies

- Auth & Login (Etapa 0) — guards, roles, IAuthUser. Completado. Sin dependencias externas adicionales.

## Success Criteria

- [ ] GET /clientes lista paginada con filtros encargado/semaforo/búsqueda
- [ ] COLABORADOR solo ve clientes donde `encargadoId = su userId`
- [ ] POST/PATCH/DELETE solo SOCIO; create incluye ClienteImpuesto en transacción
- [ ] DELETE soft (activo: false), no elimina registros
- [ ] GET /clientes/:id legajo con impuestos anidados
- [ ] GET /clientes/afip/:cuit devuelve datos mock para autocompletar
- [ ] Frontend: tabla clientes con DataTable, sheet create/edit con TanStack Form + Zod
- [ ] Frontend: legajo detalle con tabs (Resumen activo, resto stubbed)
- [ ] Tests backend 100% coverage (Jest)
- [ ] Nav item Clientes visible para SOCIO y COLABORADOR
