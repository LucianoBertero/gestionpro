# Design: Módulo Clientes

## Technical Approach

Mirror `UserModule` patterns exactly. Backend-first: Prisma schema → enums → interfaces → repository → service → controllers → i18n. Frontend follows `users` feature: `api/types.ts` → `api/service.ts` → `api/queries.ts` → `api/mutations.ts` → `schemas/` → `components/`. Server prefetch via `void prefetchQuery` + `HydrationBoundary` + `useSuspenseQuery`. COLABORADOR auto-filter in service (not controller). `ClienteImpuesto` created in `prisma.$transaction` with `Cliente`. AFIP mock isolated in separate service.

## Architecture Decisions

| Decision | Options | Chosen | Rationale |
|---|---|---|---|
| Controller split | Public + Admin vs single controller | Public + Admin | Matches `UserModule` pattern. Clear permission separation. |
| COLABORADOR filter location | Service vs Controller | Service | Keeps controller thin. Single point of truth. |
| ClienteImpuesto creation | Transaction vs separate create | `prisma.$transaction` | Both succeed or both roll back. Matches proposal risk mitigation. |
| Semáforo | Real logic vs stubbed | Stubbed VERDE | Tareas/Liquidaciones modules don't exist yet. `getSemaforo()` method with TODO. |
| AFIP integration | Real API vs mock service | Mock in `AfipService` | Certificado fiscal not scoped. Separate service = drop-in replacement. |

## Prisma Schema

```prisma
enum TipoImpuesto {
  GANANCIAS IVA IIBB CONV_MULTILATERAL BIENES_PERSONALES GANANCIA_PERSONA_HUMANA
}
enum EstadoSemaforo {
  VERDE AMARILLO ROJO
}
model Cliente {
  id             String   @id @default(uuid())
  cuit           String   @unique
  razonSocial    String   @map("razon_social")
  nombreFantasia String?  @map("nombre_fantasia")
  encargadoId    String   @map("encargado_id")
  telefono       String?
  email          String?
  direccion      String?
  actividades    String[]
  semaforo       EstadoSemaforo @default(VERDE)
  activo         Boolean  @default(true)
  estudioId      Int      @default(1) @map("estudio_id")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  encargado    User              @relation(fields: [encargadoId], references: [id])
  impuestos    ClienteImpuesto[]

  @@map("clientes")
}
model ClienteImpuesto {
  id        String       @id @default(uuid())
  clienteId String       @map("cliente_id")
  tipo      TipoImpuesto
  activo    Boolean      @default(true)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  cliente   Cliente      @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@unique([clienteId, tipo])
  @@map("clientes_impuestos")
}
```

## Backend Module Structure

```
src/modules/clientes/
├── clientes.module.ts
├── controllers/
│   ├── clientes.public.controller.ts   ← GET /clientes, GET /clientes/:id, GET /clientes/afip/:cuit
│   └── clientes.admin.controller.ts    ← POST, PATCH :id, DELETE :id (@AllowedRoles([SOCIO]))
├── services/
│   ├── clientes.service.ts             ← business logic + role filter + transaction
│   └── afip.service.ts                 ← mock: static data, replaceable
└── dtos/
    ├── cliente.dto.ts                  ← ClienteResponseDto, ClienteLegajoResponseDto
    ├── cliente.create.dto.ts           ← ClienteCreateDto (cuit, razonSocial, encargadoId, tipoImpuesto[])
    ├── cliente.update.dto.ts           ← ClienteUpdateDto (partial)
    └── cliente-impuesto.dto.ts         ← ClienteImpuestoDto
```

```
src/common/database/
├── enums/
│   ├── tipo-impuesto.enum.ts           ← export { TipoImpuesto } from '@prisma/client'
│   └── estado-semaforo.enum.ts         ← export { EstadoSemaforo } from '@prisma/client'
├── interfaces/
│   └── cliente.interface.ts            ← ClienteEntity, CreateClienteInput, UpdateClienteInput
└── repositories/
    └── cliente.repository.ts           ← CRUD + findAll con filtros + findLegajo
```

## Sequence: Create Cliente with Impuestos

```
Controller                  Service                       Repository              DB
    |                          |                              |                     |
    |-- POST + DTO ---------->>|                              |                     |
    |                          |-- cuit unique check -------->>|-- findUnique ------>|
    |                          |                              |<--- null -----------|
    |                          |-- prisma.$transaction ----->>|                     |
    |                          |   create cliente             |-- create ---------->|
    |                          |   create impuestos (forEach)  |-- createMany ------>|
    |                          |<--- [cliente] ------------<<|                     |
    |<-- 201 Cliente ----------|                              |                     |
```

## Sequence: Get Legajo Completo

```
Controller                  Service                       Repository
    |                          |                              |
    |-- GET /clientes/:id --->>|                              |
    |                          |-- assertExists(id) --------->>|
    |                          |-- findLegajo(id) ----------->>|-- findUnique({
    |                          |                              |     where: {id, activo:true},
    |                          |                              |     include: {impuestos, encargado}
    |                          |                              |   }) --> DB
    |                          |<--- ClienteLegajoResponse ---| 
    |<-- 200 (con impuestos) --|                              |
```

## Frontend Component Tree

```
/app/dashboard/clientes/
├── page.tsx                          ← Server: prefetch + hydrate
│   └── features/clientes/components/
│       ├── cliente-listing.tsx       ← Server: void prefetchQuery + HydrationBoundary
│       │   └── <ClientesTable />     ← Client: useSuspenseQuery, DataTable
│       │       ├── columns.tsx       ← column defs (cuit, razonSocial, semáforo, encargado)
│       │       ├── cell-action.tsx   ← edit/delete row actions
│       │       └── options.tsx       ← filter options (semaforo, encargado)
│       └── cliente-form-sheet.tsx    ← Client: useMutation create/update
│           └── afip-search.tsx       ← CUIT autocomplete (GET /clientes/afip/:cuit)
│
├── [id]/
│   └── page.tsx                      ← Server: prefetch legajo
│       └── features/clientes/components/
│           └── cliente-legajo/
│               ├── index.tsx         ← Tab container
│               ├── resumen-tab.tsx   ← Display cliente + impuestos
│               ├── tareas-tab.tsx    ← Stub: "Próximamente"
│               ├── liquidaciones-tab.tsx ← Stub
│               └── archivos-tab.tsx  ← Stub
```

## Data Flow: React Query + Server Prefetch

```
Page (Server)                         Component (Client)
    |                                      |
    |-- searchParamsCache.parse()          |
    |-- queryClient.prefetchQuery(         |
    |     clientesQueryOptions(filters)    |
    |   ) // void, fire-and-forget         |
    |-- <HydrationBoundary> ------------>> |
    |                                      |-- useSuspenseQuery(
    |                                      |     clientesQueryOptions(filters)
    |                                      |   ) → renders DataTable
    |                                      |
    |                                      |-- Filters change (nuqs shallow)
    |                                      |   → useQueryState updates URL
    |                                      |   → queryClient refetch
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/api/prisma/schema.prisma` | Modify | +2 models, +2 enums, User array relation for encargado |
| `apps/api/src/common/database/enums/tipo-impuesto.enum.ts` | Create | Re-export TipoImpuesto from Prisma |
| `apps/api/src/common/database/enums/estado-semaforo.enum.ts` | Create | Re-export EstadoSemaforo from Prisma |
| `apps/api/src/common/database/interfaces/cliente.interface.ts` | Create | ClienteEntity, CreateClienteInput, UpdateClienteInput |
| `apps/api/src/common/database/repositories/cliente.repository.ts` | Create | CRUD with filters + findLegajo (include impuestos) |
| `apps/api/src/common/database/database.module.ts` | Modify | +ClienteRepository provider/export |
| `apps/api/src/modules/clientes/clientes.module.ts` | Create | Module importing DatabaseModule |
| `apps/api/src/modules/clientes/services/clientes.service.ts` | Create | Role filtering, transaction create, soft delete |
| `apps/api/src/modules/clientes/services/afip.service.ts` | Create | Mock AFIP static data, replaceable |
| `apps/api/src/modules/clientes/controllers/clientes.public.controller.ts` | Create | JWT-protected GET endpoints |
| `apps/api/src/modules/clientes/controllers/clientes.admin.controller.ts` | Create | SOCIO-only POST/PATCH/DELETE |
| `apps/api/src/modules/clientes/dtos/cliente.dto.ts` | Create | Response DTOs |
| `apps/api/src/modules/clientes/dtos/cliente.create.dto.ts` | Create | Create DTO with tipoImpuesto[] |
| `apps/api/src/modules/clientes/dtos/cliente.update.dto.ts` | Create | Partial update DTO |
| `apps/api/src/modules/clientes/dtos/cliente-impuesto.dto.ts` | Create | Impuesto response DTO |
| `apps/api/src/languages/en/clientes.json` | Create | i18n keys |
| `apps/api/src/app/app.module.ts` | Modify | +ClientesModule import |
| `apps/web/src/features/clientes/api/types.ts` | Create | Client types |
| `apps/web/src/features/clientes/api/service.ts` | Create | Axios calls to /v1/clientes |
| `apps/web/src/features/clientes/api/queries.ts` | Create | Query key factory + queryOptions |
| `apps/web/src/features/clientes/api/mutations.ts` | Create | Create/update/delete mutations |
| `apps/web/src/features/clientes/schemas/cliente.ts` | Create | Zod schemas |
| `apps/web/src/features/clientes/components/cliente-listing.tsx` | Create | Server prefetch wrapper |
| `apps/web/src/features/clientes/components/clientes-table/` | Create | DataTable + columns + filters |
| `apps/web/src/features/clientes/components/cliente-form-sheet.tsx` | Create | Create/edit sheet |
| `apps/web/src/features/clientes/components/cliente-afip-search.tsx` | Create | CUIT lookup |
| `apps/web/src/features/clientes/components/cliente-legajo/` | Create | Tab container + stubs |
| `apps/web/src/app/dashboard/clientes/page.tsx` | Create | List page |
| `apps/web/src/app/dashboard/clientes/[id]/page.tsx` | Create | Legajo page |
| `apps/web/src/config/nav-config.ts` | Modify | +Clientes nav item with `roles: ['SOCIO','COLABORADOR']` |
| `apps/web/src/components/icons.tsx` | Modify | +building, trafficCone, idCard |

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit (backend) | ClienteService, AfipService, ClienteRepository | Jest, mock deps as `{ method: jest.fn() }` |
| Unit (backend) | DTOs class-validator | Inline `validate()` calls |
| Integration (backend) | Controller + Service + DB | `Test.createTestingModule` with `DatabaseService` mock |
| Frontend | No test runner configured | Manual QA only |

## Open Questions

None — all decisions resolved in proposal/exploration.
