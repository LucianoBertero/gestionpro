# Tasks: Módulo Clientes

## Phase 1: Prisma Schema (Foundation)

- [x] 1.1 Add `TipoImpuesto` + `EstadoSemaforo` enums and `Cliente` + `ClienteImpuesto` models to `apps/api/prisma/schema.prisma` — follow `@map/@map` snake_case, `@@map`, uuid PK conventions
- [x] 1.2 Run `prisma db push` (with DIRECT_URL) and verify `prisma generate` succeeds
  → Depends on: nothing. Prerequisite for all other phases.

## Phase 2: Backend Data Layer (Enums + Interfaces + DTOs)

- [x] 2.1 Create `tipo-impuesto.enum.ts` + `estado-semaforo.enum.ts` re-exporting Prisma enums, matching `role.enum.ts` pattern
- [x] 2.2 Create `cliente.interface.ts` with `ClienteEntity`, `CreateClienteInput`, `UpdateClienteInput`
- [x] 2.3 Create all DTOs: `cliente.dto.ts` (ClienteResponseDto + ClienteLegajoResponseDto with impuestos array), `cliente.create.dto.ts` (class-validator: cuit unique, encargadoId required, tipoImpuesto[] array), `cliente.update.dto.ts` (PartialType), `cliente-impuesto.dto.ts`
  → Depends on: 1.2

## Phase 3: Backend Repository

- [x] 3.1 Create `cliente.repository.ts`: CRUD, `findAll` with pagination + encargadoId/semaforo/search filters, `findLegajo` (include impuestos + encargado), soft-delete (activo: false), existsByCuit, existsById. Follow `user.repository.ts` pattern.
  → Depends on: 2.1, 2.2

## Phase 4: Backend Business Logic (Services + Controllers + Wiring + i18n)

- [x] 4.1 Create `clientes.service.ts`: role-based encargadoId auto-filter for COLABORADOR, `prisma.$transaction` for create (cliente + impuestos), soft-delete, toggle impuestos (inactivate old + create new), semáforo default VERDE
- [x] 4.2 Create `afip.service.ts`: mock `getAfipData(cuit)` with static sample data, validate CUIT format (XX-NNNNNNNN-X), return denominación/domicilio/condicionIva/actividades
- [x] 4.3 Create `clientes.public.controller.ts` (JwtAuthGuard) + `clientes.admin.controller.ts` (@AllowedRoles([SOCIO])), following `user.public/admin.controller.ts` patterns
- [x] 4.4 Create `clientes.module.ts` + `clientes.json` i18n keys + wire: add ClienteRepository to `database.module.ts` providers/exports, add ClientesModule to `app.module.ts` imports
  → Depends on: 3.1, 2.3

## Phase 5: Frontend API Layer

- [x] 5.1 Create `features/clientes/api/` (types.ts, service.ts with Axios to /v1/clientes, queries.ts with query key factory + queryOptions, mutations.ts with create/update/delete), mirroring `features/users/api/` pattern
- [x] 5.2 Create `features/clientes/schemas/cliente.ts` with Zod schemas for create/update
  → Depends on: 2.3 (DTO shapes inform types/schemas)

## Phase 6: Frontend Components

- [x] 6.1 Create `clientes-table/` (columns.tsx: denominación, CUIT, encargado, semáforo chip, impuestos badges, edit/delete actions; options.tsx: semaforo/encargado/search filters; cell-action.tsx)
- [x] 6.2 Create `cliente-form-sheet.tsx` with TanStack Form + Zod: CUIT field triggers AFIP autocomplete, UserPicker for encargadoId, multi-select tipoImpuesto[], tag input actividades, save via POST (create) or PATCH (edit)
- [x] 6.3 Create `cliente-afip-search.tsx`: on CUIT blur → GET /afip/:cuit → auto-fill denominación/domicilio/condicionIva (integrated into cliente-form-sheet.tsx as onBlur handler)
- [x] 6.4 Create `cliente-listing.tsx` server component: `void prefetchQuery` + `HydrationBoundary` + `<Suspense>` wrapping `<ClientesTable />` (uses `useSuspenseQuery` + nuqs URL-synced filters)
- [x] 6.5 Create `cliente-legajo/` (index.tsx tab container, resumen-tab.tsx active, tareas/liquidaciones/archivos stubs with "Próximamente")
  → Depends on: 5.1, 5.2

## Phase 7: Frontend Pages + Nav Integration

- [x] 7.1 Create `app/dashboard/clientes/page.tsx` (imports ClienteListing) + `app/dashboard/clientes/[id]/page.tsx` (server prefetch legajo, imports ClienteLegajo), following users page pattern
- [x] 7.2 Modify `nav-config.ts` (+Clientes item with `roles: ['SOCIO','COLABORADOR']` in Overview group) + `icons.tsx` (+building: IconBuilding, trafficCone: IconTrafficCone, idCard: IconIdCard)
  → Depends on: 6.4, 6.5
