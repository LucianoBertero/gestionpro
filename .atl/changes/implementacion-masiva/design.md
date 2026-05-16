# Design: Implementación Masiva GestiónPro

## Technical Approach

Implementación de 12 capabilities organizadas en **11 fases atómicas**, cada una como commit independiente. El approach prioriza:

1. **Estabilizar la base** (cleanup + i18n foundation)
2. **Unificar API client** (axios-only, eliminar openapi-fetch)
3. **Backend primero** (archivos + comunicaciones)
4. **Frontend masivo** (7 features en paralelo estructurado)
5. **Integración final** (nav + header)

## Architecture Decisions

### Decision 1: FullCalendar + React 19 Compatibility

| Option | Tradeoff | Decision |
|--------|----------|----------|
| FullCalendar React wrapper directo | React 19 peer dep conflict | ❌ |
| Dynamic import + 'use client' wrapper | Aisla el componente, carga lazy | ✅ |
| FullCalendar vanilla JS | Más código custom | ❌ |

**Approach**: Crear `FullCalendarWrapper` componente cliente que hace `dynamic(() => import('@fullcalendar/react'), { ssr: false })`. Esto evita hydration mismatch y permite usar FullCalendar 6.x con React 19.

### Decision 2: i18n Architecture

| Option | Tradeoff | Decision |
|--------|----------|----------|
| i18next + react-i18next | Estándar, plugins disponibles | ✅ |
| next-intl | Mejor integración Next.js, más peso | ❌ |
| react-i18n-lite | Menos features, overhead menor | ❌ |

**Approach**:
- Configurar i18next en `src/lib/i18n/config.ts`
- Locale por defecto: `es-AR`
- Resources en `src/locales/{locale}/{namespace}.json`
- **Wrapper `t()`**: Crear `useTranslations()` hook desde fase 2 para no re-tocar archivos después
- Migración progresiva: los features nuevos usan `t()` desde el inicio

### Decision 3: Upload de Archivos (Sin R2 Real)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| R2 real + presigned URLs | Requiere infra adicional | ❌ |
| Local filesystem (dev only) | No escala a producción | ❌ |
| **Metadata-only + stub endpoint** | Desacopla upload real, permite iterar UI | ✅ |

**Approach**:
- Frontend: drag & drop + validación de tipo/tamaño funcional
- Backend: recibe metadata, guarda en DB, responde 201
- Stub endpoint: loguea "upload recibido" pero no persiste archivo físico
- URL: campo string libre (placeholder para futuro R2)

### Decision 4: API Client Unification

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Mantener openapi-fetch para auth/users | Dos clients, inconsistencia | ❌ |
| Migrar todo a axios | Unificado, interceptors simples | ✅ |
| Migrar todo a openapi-fetch | Tipado perfecto, más complejo | ❌ |

**Approach**:
- Eliminar `/lib/api/client.ts` y dependencia `openapi-fetch`
- Migrar `auth/service.ts` y `users/service.ts` a `axios-instance.ts`
- Mantener `unwrap()` helper para compatibilidad con envelope NestJS

### Decision 5: Nav Config - Roles RBAC

| Role | Acceso |
|------|--------|
| SOCIO | Todos los items |
| COLABORADOR | Clientes, Tareas, Liquidaciones, Agenda, Notificaciones, Comunicaciones |

**Items a agregar** (7 nuevos):
1. `Comunicaciones` - SOCIO + COLABORADOR
2. `Archivos` - SOCIO + COLABORADOR  
3. `Email Templates` - SOCIO only
4. `Financiero` - SOCIO only

### Decision 6: Header Update - Campanita

**Approach**:
- Componente `NotificationsDropdown` en `components/layout/notifications-dropdown.tsx`
- Badge con número de no leídas (polling cada 30s)
- Dropdown con últimas 5 notificaciones
- Click marca como leída + navega si tiene URL

## File Changes

### Fase 1: Template Cleanup
| File | Action | Description |
|------|--------|-------------|
| `src/features/products/` | Delete | Directorio completo del template |
| `src/app/(dashboard)/about/page.tsx` | Delete | Página about |
| `src/app/(dashboard)/privacy/page.tsx` | Delete | Página privacy |
| `src/app/(dashboard)/terms/page.tsx` | Delete | Página terms |
| `src/config/nav-config.ts` | Modify | Eliminar links a productos/about/privacy/terms |

### Fase 2: i18n Foundation
| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Agregar `i18next`, `react-i18next`, `i18next-browser-languagedetector` |
| `src/lib/i18n/config.ts` | Create | Configuración i18next con es-AR default |
| `src/lib/i18n/client.ts` | Create | Provider para 'use client' components |
| `src/locales/es-AR/common.json` | Create | Traducciones base (UI labels, botones) |
| `src/locales/en-US/common.json` | Create | Traducciones inglés |
| `src/components/language-switcher.tsx` | Create | Switcher es-AR ↔ en-US |

### Fase 3: API Client Unification
| File | Action | Description |
|------|--------|-------------|
| `src/lib/api/client.ts` | Delete | Eliminar openapi-fetch client |
| `package.json` | Modify | Eliminar `openapi-fetch`, `openapi-typescript` |
| `src/features/auth/api/service.ts` | Modify | Migrar a axios-instance |
| `src/features/users/api/service.ts` | Modify | Migrar a axios-instance |
| `src/features/auth/store/auth.store.ts` | Modify | Actualizar configureApiAuth → configureAuthInterceptors |

### Fase 4: Backend - Archivo Module
| File | Action | Description |
|------|--------|-------------|
| `apps/api/prisma/schema.prisma` | Modify | Agregar modelo `Archivo` |
| `apps/api/src/modules/archivo/` | Create | Controller, Service, DTOs, Module |
| `apps/api/src/app.module.ts` | Modify | Import ArchivoModule |

### Fase 5: Backend - Comunicacion Module
| File | Action | Description |
|------|--------|-------------|
| `apps/api/prisma/schema.prisma` | Modify | Agregar modelo `Comunicacion` |
| `apps/api/src/modules/comunicacion/` | Create | Controller, Service, DTOs, Module |
| `apps/api/src/app.module.ts` | Modify | Import ComunicacionModule |

### Fase 6: Frontend - Agenda (FullCalendar)
| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Agregar `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` |
| `src/features/agenda/components/full-calendar-wrapper.tsx` | Create | Wrapper cliente con dynamic import |
| `src/features/agenda/api/types.ts` | Create | Tipos para agenda items |
| `src/features/agenda/api/service.ts` | Create | CRUD agenda items |
| `src/features/agenda/api/queries.ts` | Create | React Query hooks |
| `src/features/agenda/api/mutations.ts` | Create | Mutations create/update/delete |
| `src/app/dashboard/agenda/page.tsx` | Modify | Integrar FullCalendar |

### Fase 7: Frontend - Notificaciones + Header
| File | Action | Description |
|------|--------|-------------|
| `src/features/notificaciones/api/types.ts` | Create | Tipos notificaciones |
| `src/features/notificaciones/api/service.ts` | Create | Get notificaciones, mark read |
| `src/features/notificaciones/api/queries.ts` | Create | Query hooks |
| `src/features/notificaciones/api/mutations.ts` | Create | Mutations mark read/all read |
| `src/components/layout/notifications-dropdown.tsx` | Create | Campanita + dropdown |
| `src/components/layout/header.tsx` | Modify | Integrar NotificationsDropdown |
| `src/app/dashboard/notificaciones/page.tsx` | Modify | Página historial completo |

### Fase 8: Frontend - Vencimientos + Excel Import
| File | Action | Description |
|------|--------|-------------|
| `src/features/vencimientos/api/types.ts` | Create | Tipos vencimientos |
| `src/features/vencimientos/api/service.ts` | Create | CRUD + import Excel |
| `src/features/vencimientos/components/excel-import-modal.tsx` | Create | Modal drag & drop Excel |
| `src/features/vencimientos/components/vencimientos-table/` | Create | Tabla con columns, cell-action |
| `src/app/dashboard/vencimientos/page.tsx` | Modify | Página con tabla + import (SOCIO only) |

### Fase 9: Frontend - Archivos
| File | Action | Description |
|------|--------|-------------|
| `src/features/archivos/api/types.ts` | Create | Tipos archivos |
| `src/features/archivos/api/service.ts` | Create | CRUD archivos (metadata only) |
| `src/features/archivos/components/upload-modal.tsx` | Create | Modal drag & drop upload |
| `src/features/archivos/components/archivos-table/` | Create | Tabla con columns, cell-action |
| `src/app/dashboard/archivos/page.tsx` | Create | Página archivos |

### Fase 10: Frontend - Comunicaciones
| File | Action | Description |
|------|--------|-------------|
| `src/features/comunicaciones/api/types.ts` | Create | Tipos comunicaciones |
| `src/features/comunicaciones/api/service.ts` | Create | CRUD comunicaciones |
| `src/features/comunicaciones/components/comunicacion-form-modal.tsx` | Create | Form create/edit |
| `src/features/comunicaciones/components/comunicaciones-table/` | Create | Tabla con columns, cell-action |
| `src/app/dashboard/comunicaciones/page.tsx` | Create | Página comunicaciones |

### Fase 11: Frontend - Email Templates + Financiero + Nav Update
| File | Action | Description |
|------|--------|-------------|
| `src/features/email-templates/api/types.ts` | Create | Tipos templates |
| `src/features/email-templates/api/service.ts` | Create | CRUD templates |
| `src/features/email-templates/components/template-editor.tsx` | Create | Editor con preview |
| `src/app/dashboard/email-templates/page.tsx` | Create | Página templates (SOCIO only) |
| `src/features/financiero/components/honorarios-section.tsx` | Create | Gráfico barras + KPIs |
| `src/features/financiero/components/rentabilidad-section.tsx` | Create | Gráfico línea con filtros |
| `src/features/financiero/components/proyeccion-section.tsx` | Create | Gráfico área real vs proyectado |
| `src/app/dashboard/financiero/page.tsx` | Create | Página con tabs |
| `src/config/nav-config.ts` | Modify | Agregar 7 items con roles |

## Data Flow

### Agenda (FullCalendar)
```
User clicks date
    ↓
Modal opens (create/edit)
    ↓
POST/PUT /v1/agenda-items
    ↓
Invalidate queries
    ↓
FullCalendar refetchEvents
```

### Notificaciones
```
Header mounts
    ↓
GET /v1/notificaciones?limit=5 (polling 30s)
    ↓
Update badge count
    ↓
User clicks campanita
    ↓
Show dropdown with last 5
    ↓
Click notificación
    ↓
PATCH /v1/notificaciones/:id/read
    ↓
Navigate to url
```

### Upload Archivo
```
User drops file
    ↓
Validate type/size (frontend)
    ↓
POST /v1/archivos (metadata only)
    ↓
Backend saves metadata
    ↓
Return 201 with archivo record
    ↓
Table refetch
```

## Integration Points

### Con auth existente
- `useAuthStore` ya tiene token management
- Los nuevos services usan `axios-instance.ts` automáticamente

### Con React Query existente
- Mismo patrón: `service.ts` → `queries.ts` → `mutations.ts`
- Query key factories para invalidación jerárquica

### Con nav-config existente
- Agregar `roles` array a cada item nuevo
- `use-nav.ts` filtra automáticamente según rol del usuario

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Service functions | Mock axios, test data transformation |
| Unit | Component rendering | React Testing Library, mock queries |
| Integration | API endpoints | Test with supertest (backend) |
| E2E | Full user flows | Playwright: login → crear tarea → ver en agenda |

## Migration / Rollout

### Backend migrations
- Prisma migrations para `Archivo` y `Comunicacion`
- Run `npx prisma migrate dev` en cada fase backend

### Frontend rollout
- No breaking changes
- Features nuevas son aditivas
- Nav items ocultos por roles hasta que se necesiten

## Dependencies a Agregar

```json
{
  "dependencies": {
    "i18next": "^23.x",
    "react-i18next": "^14.x",
    "i18next-browser-languagedetector": "^7.x",
    "@fullcalendar/react": "^6.x",
    "@fullcalendar/daygrid": "^6.x",
    "@fullcalendar/timegrid": "^6.x",
    "@fullcalendar/interaction": "^6.x",
    "xlsx": "^0.18.x"
  }
}
```

## Dependencies a Eliminar

```json
{
  "dependencies": {
    "openapi-fetch": "^0.17.0"
  },
  "devDependencies": {
    "openapi-typescript": "^7.13.0"
  }
}
```

## Open Questions

- [ ] FullCalendar license: ¿open source o necesita comprar?
- [ ] Excel import: ¿usar `xlsx` o `@zip.js/zip.js` para archivos grandes?
- [ ] Notificaciones real-time: ¿polling cada 30s o SSE/WebSocket?

## Commit Strategy

| Commit | Fase | Scope | Líneas Estimadas |
|--------|------|-------|------------------|
| 1 | Template Cleanup | `chore(template)` | ~100 |
| 2 | i18n Foundation | `feat(i18n)` | ~200 |
| 3 | API Client Unification | `refactor(api)` | ~150 |
| 4 | Backend Archivo | `feat(api): archivo module` | ~300 |
| 5 | Backend Comunicacion | `feat(api): comunicacion module` | ~300 |
| 6 | Frontend Agenda | `feat(agenda)` | ~400 |
| 7 | Frontend Notificaciones | `feat(notificaciones)` | ~350 |
| 8 | Frontend Vencimientos | `feat(vencimientos)` | ~450 |
| 9 | Frontend Archivos | `feat(archivos)` | ~400 |
| 10 | Frontend Comunicaciones | `feat(comunicaciones)` | ~350 |
| 11 | Frontend Email+Financiero+Nav | `feat(email,financiero,nav)` | ~500 |

**Total estimado**: ~3,500 líneas (split en 11 commits atómicos)
