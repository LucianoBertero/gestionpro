## Exploration: Módulo Clientes — GestiónPro Etapa 1

### Current State

**Backend (apps/api)**:
- **Modules**: Only `auth` (login/signup/refresh/logout) and `user` (profile + admin CRUD) exist
- **Prisma schema**: Only `User` and `RefreshToken` models + `Role` enum (SOCIO/COLABORADOR)
- **Repositories**: `UserRepository` and `RefreshTokenRepository` in `common/database/repositories/`
- **Enums**: Only `role.enum.ts` re-exporting `Role as UserRole`
- **i18n**: `en/auth.json`, `en/user.json`, `en/http.json` exist
- **Auth infra**: JWT access (15min) + refresh (7d rotation), `@AllowedRoles([UserRole.SOCIO])`, `IAuthUser { userId, role }`
- **Controllers**: Split into public (JWT-protected) and admin (SOCIO-only) controllers

**Frontend (apps/web)**:
- **Pages**: `overview`, `product`, `users` exist in dashboard
- **Features**: `auth`, `users`, `products`, `overview` — each with `api/{types, service, queries, mutations}`
- **Nav config**: `nav-config.ts` with `roles: ['SOCIO']` RBAC pattern on Users item
- **Data fetching**: React Query v5 with `useSuspenseQuery` + `HydrationBoundary` + `nuqs` URL state
- **API client**: Axios instance with JWT interceptor at `lib/auth/axios-instance.ts`, calls `NEXT_PUBLIC_API_URL`
- **Forms**: TanStack Form via `useAppForm` with Zod schemas
- **Icons**: Centralized in `components/icons.tsx` (Tabler icons only)
- **Tables**: `DataTable` + `DataTableToolbar`, column definitions in `{feature}/components/{name}-tables/`
- **No clientes code** at all — zero references in both frontend and backend

### Affected Areas

#### Backend — files to CREATE
- `apps/api/prisma/schema.prisma` — add `Cliente`, `ClienteImpuesto` models + `TipoImpuesto`, `EstadoSemaforo` enums
- `apps/api/src/common/database/enums/tipo-impuesto.enum.ts` — re-export from Prisma
- `apps/api/src/common/database/enums/estado-semaforo.enum.ts` — re-export from Prisma
- `apps/api/src/common/database/interfaces/cliente.interface.ts` — `ClienteEntity`, `CreateClienteInput`, `UpdateClienteInput`
- `apps/api/src/common/database/repositories/cliente.repository.ts` — CRUD + filtering + legajo query
- `apps/api/src/common/database/database.module.ts` — add `ClienteRepository` to providers/exports
- `apps/api/src/modules/clientes/clientes.module.ts` — feature module importing `DatabaseModule`
- `apps/api/src/modules/clientes/services/clientes.service.ts` — business logic (semáforo, impuestos, role filtering)
- `apps/api/src/modules/clientes/controllers/clientes.public.controller.ts` — JWT-protected: GET /clientes, GET /clientes/:id
- `apps/api/src/modules/clientes/controllers/clientes.admin.controller.ts` — SOCIO-only: POST/PATCH/DELETE
- `apps/api/src/modules/clientes/controllers/clientes.afip.controller.ts` — AFIP autocomplete (or inline in public ctrl)
- `apps/api/src/modules/clientes/dtos/cliente.dto.ts` — `ClienteResponseDto`, `ClienteLegajoResponseDto`
- `apps/api/src/modules/clientes/dtos/cliente.create.dto.ts` — `ClienteCreateDto`
- `apps/api/src/modules/clientes/dtos/cliente.update.dto.ts` — `ClienteUpdateDto`
- `apps/api/src/modules/clientes/dtos/cliente-impuesto.dto.ts` — `ClienteImpuestoDto`
- `apps/api/src/languages/en/clientes.json` — i18n keys
- `apps/api/src/app/app.module.ts` — add `ClientesModule` to imports

#### Frontend — files to CREATE
- `apps/web/src/features/clientes/api/types.ts` — `Cliente`, `ClienteFilters`, `ClienteLegajo`, etc.
- `apps/web/src/features/clientes/api/service.ts` — axios calls to `/v1/clientes` endpoints
- `apps/web/src/features/clientes/api/queries.ts` — React Query key factory + `queryOptions`
- `apps/web/src/features/clientes/api/mutations.ts` — create/update/delete mutation options
- `apps/web/src/features/clientes/schemas/cliente.ts` — Zod schemas for forms
- `apps/web/src/features/clientes/components/clientes-table/index.tsx` — table component with filters
- `apps/web/src/features/clientes/components/clientes-table/columns.tsx` — column definitions
- `apps/web/src/features/clientes/components/clientes-table/cell-action.tsx` — row actions (edit/delete)
- `apps/web/src/features/clientes/components/clientes-table/options.tsx` — filter options (semáforo, encargado)
- `apps/web/src/features/clientes/components/cliente-listing.tsx` — server component with prefetch
- `apps/web/src/features/clientes/components/cliente-form-sheet.tsx` — create/edit form sheet
- `apps/web/src/features/clientes/components/cliente-legajo/*` — legajo detail with tabs
- `apps/web/src/features/clientes/components/cliente-afip-search.tsx` — CUIT lookup component
- `apps/web/src/app/dashboard/clientes/page.tsx` — list page
- `apps/web/src/app/dashboard/clientes/[id]/page.tsx` — legajo detail page

#### Files to MODIFY
- `apps/web/src/config/nav-config.ts` — add Clientes nav item
- `apps/web/src/components/icons.tsx` — add clientes-related icons (users, building, id-badge, traffic-lights, etc.)
- `apps/web/src/lib/searchparams.ts` — add semaforo/encargado filters if needed

### Approaches

#### 1. **Controller Split (Public + Admin)** — matching existing pattern
Same as `UserPublicController` + `UserAdminController`: split endpoints by role needs.
- **Pros**: Consistent with existing pattern, clear separation, easy to reason about
- **Cons**: More files, some endpoint duplication if shared logic
- **Effort**: Low — we know the pattern well

#### 2. **Single Controller with Role Guards per Method**
One `ClientesController` with mixed `@AllowedRoles` on individual methods.
- **Pros**: Fewer files, all clientes endpoints in one place
- **Cons**: Inconsistent with existing pattern (user module uses split), harder to scan permissions
- **Effort**: Low — but diverges from project convention

### Recommendation

**Approach 1** — Controller Split (Public + Admin). Follow the exact same pattern as `UserModule`:
- `clientes.public.controller.ts`: GET /clientes (with COLABORADOR auto-filter), GET /clientes/:id (legajo), GET /clientes/afip/:cuit
- `clientes.admin.controller.ts` (`@AllowedRoles([UserRole.SOCIO])`): POST /clientes, PATCH /clientes/:id, DELETE /clientes/:id
- COLABORADOR auto-filter in service: when `role !== SOCIO`, inject `where: { encargadoId: authUser.userId }`

### Risks

- **AFIP Integration**: The doc specifies `GET /clientes/afip/:cuit` but AFIP's public API may require authentication (certificado fiscal). **Decision needed**: mock for now vs. real integration. Recommend mock with static sample data until AFIP integration is properly scoped.
- **Semáforo computing**: Depends on Tareas and Liquidaciones modules (not yet built). The semáforo logic can be stubbed initially (always VERDE) and updated when those modules exist.
- **ClienteImpuesto creation**: The doc says "al crear cliente configurar ClienteImpuesto según impuestos seleccionados" — the create DTO must include a `tipoImpuesto[]` field and the service must create related `ClienteImpuesto` records.
- **EncargadoId is required**: The doc marks `encargadoId` as `Int` (not optional). SOCIO must assign an encargado when creating. Need to ensure the frontend provides a user picker (reuse `UserPicker` from auth feature).
- **actividades is `String[]`**: PostgreSQL native array. Prisma supports this natively. Need to ensure DTO transforms comma-separated to array.

### Ready for Proposal

**Yes**. All information needed to proceed is gathered. The next step is `sdd-propose` to create the formal change proposal with scope, approach, and acceptance criteria.
