## Exploration: Implementación Masiva — GestiónPro

### Current State

Proyecto GestiónPro, un sistema de gestión interna para Estudio BB (estudio contable argentino). Monorepo con Turborepo + pnpm, backend NestJS 11 + Prisma 7 + PostgreSQL, frontend Next.js 16 + Tailwind v4 + shadcn/ui.

#### Backend — Estado actual

**Módulos existentes (completos con controllers + services):**
| Módulo | Status | Endpoints |
|--------|--------|-----------|
| Auth | ✅ Completo | login, signup, refresh-token, logout, users |
| User | ✅ Completo | profile, admin CRUD |
| Clientes | ✅ Completo | CRUD, AFIP, legajo |
| Tareas | ✅ Completo | CRUD, completar |
| Liquidaciones | ✅ Existe | — |
| Vencimientos | ✅ Completo | list, calcular, admin upsert |
| Agenda | ✅ Completo | CRUD, equipo view |
| Notificaciones | ✅ Completo | list, count-no-leidas, marcar-leida, marcar-todas |
| Email Templates | ✅ Completo | CRUD (solo SOCIO) |
| Dashboard | ✅ Existe | — |
| Financiero | ✅ Completo | honorarios, rentabilidad, proyección |
| Excel | ✅ Existe | — |

**Módulos faltantes:**
| Módulo | Repository | Controller | Service | Module |
|--------|-----------|-----------|---------|--------|
| Comunicación | ✅ existe en `database.module.ts` | ❌ falta | ❌ falta | ❌ falta |
| Archivo | ✅ existe en `database.module.ts` | ❌ falta | ❌ falta | ❌ falta |

**AppModule** (`src/app/app.module.ts`) no importa `ComunicacionModule` ni `ArchivoModule`.

**Patrones backend identificados:**
- Todos los módulos importan `DatabaseModule` (nunca `CommonModule`)
- Controllers usan split `public`/`admin` donde aplica (agenda, vencimientos) o unificados (email-templates)
- `@ApiEndpoint()` decorator para documentación Swagger
- `@AllowedRoles([UserRole.SOCIO])` para endpoints admin
- Repositories inyectan `DatabaseService`, services inyectan repositories
- DTOs usan `class-validator` + `@Expose()` + `@ApiProperty()`

#### Frontend — Estado actual

**Features existentes (src/features/):**
| Feature | API Layer | Componentes | Status |
|---------|-----------|-------------|--------|
| auth | openapi-fetch | login-form, login-page, user-picker | ✅ |
| clientes | axios-instance | table, form, legajo | ✅ |
| tareas | axios-instance | table, form | ✅ |
| users | openapi-fetch | table, form | ✅ |
| dashboard | exists | — | partial |
| overview | — | charts components | partial |
| products | — | — | ❌ template leftover |
| excel | — | — | partial |
| liquidaciones | — | — | partial |

**Dashboard pages (src/app/dashboard/):**
| Page | Status | Notas |
|------|--------|-------|
| overview/ | ✅ Complete | Parallel routes for charts |
| clientes/ | ✅ Complete | Full CRUD |
| tareas/ | ✅ Complete | Full CRUD |
| users/ | ✅ Complete | Full CRUD |
| liquidaciones/ | ✅ Exists | — |
| agenda/ | ⚠️ Stub | Solo placeholder text |
| notificaciones/ | ⚠️ Stub | Solo placeholder text |
| vencimientos/ | ⚠️ Stub | Solo placeholder text |
| product/ | ❌ Leftover | Template page — debe ocultarse/eliminarse |

**API Client — dualidad:**
- `src/lib/api/client.ts` usa **openapi-fetch** — usado por auth y users
- `src/lib/auth/axios-instance.ts` usa **axios** — usado por clientes y tareas
- Ambos tienen lógica de refresh token duplicada

**Template leftovers a limpiar:**
- `src/features/products/` — feature completa con API, componentes, schemas
- `src/app/dashboard/product/` — página de producto
- `src/app/about/` — página about
- `src/app/privacy-policy/` — página privacidad
- `src/app/terms-of-service/` — página términos

**i18n:**
- No existe `i18next` ni `react-i18next` en dependencias
- No existe directorio `/locales/`
- Todos los strings están hardcodeados en JSX

### Affected Areas

#### Backend Files
- `apps/api/src/modules/comunicacion/` — **crear** module, controller, service, DTOs
- `apps/api/src/modules/archivo/` — **crear** module, controller, service, DTOs
- `apps/api/src/app/app.module.ts` — **agregar** ComunicacionModule y ArchivoModule

#### Frontend Files
- `apps/web/src/features/agenda/` — **crear** feature completo (api, components, pages)
- `apps/web/src/features/vencimientos/` — **crear** feature completo
- `apps/web/src/features/notificaciones/` — **crear** feature completo
- `apps/web/src/features/email-templates/` — **crear** feature completo
- `apps/web/src/features/financiero/` — **crear** feature completo
- `apps/web/src/features/comunicacion/` — **crear** feature completo
- `apps/web/src/features/archivo/` — **crear** feature completo
- `apps/web/src/app/dashboard/agenda/page.tsx` — **reemplazar** stub
- `apps/web/src/app/dashboard/notificaciones/page.tsx` — **reemplazar** stub
- `apps/web/src/app/dashboard/vencimientos/page.tsx` — **reemplazar** stub
- `apps/web/src/app/dashboard/email-templates/` — **crear** página
- `apps/web/src/app/dashboard/financiero/` — **crear** página
- `apps/web/src/app/dashboard/comunicacion/` — **crear** página
- `apps/web/src/app/dashboard/archivo/` — **crear** página
- `apps/web/src/config/nav-config.ts` — **agregar** nuevas rutas (email-templates, financiero, comunicacion, archivo)
- `apps/web/src/components/layout/header.tsx` — **agregar** campanita de notificaciones
- `apps/web/package.json` — **agregar** dependencias FullCalendar, i18next, react-i18next
- `apps/web/src/lib/api/client.ts` — **migrar** auth y users a axios-instance; **eliminar**
- `apps/web/src/features/auth/api/service.ts` — **migrar** a axios-instance
- `apps/web/src/features/auth/store/auth.store.ts` — **migrar** a axios-instance
- `apps/web/src/features/users/api/service.ts` — **migrar** a axios-instance
- `apps/web/src/app/about/` — **eliminar**
- `apps/web/src/app/privacy-policy/` — **eliminar**
- `apps/web/src/app/terms-of-service/` — **eliminar**
- `apps/web/src/app/dashboard/product/` — **eliminar**
- `apps/web/src/features/products/` — **eliminar**
- `apps/web/src/locales/es-AR/` — **crear** archivos i18n
- Múltiples archivos .tsx — **migrar** strings a `t('key')`

### Approaches

1. **Implementación secuencial por feature (recomendada)**
   - Completar backend faltante (Comunicación + Archivo)
   - Implementar frontend feature por feature (Agenda → Vencimientos → Notificaciones → Email Templates → Financiero → Comunicación → Archivo)
   - Refactorizar (API client unificado, cleanup template, i18n)
   - Pros: Orden lógico, cada feature se prueba antes de pasar al siguiente
   - Cons: Largo proceso secuencial, puede haber conflictos al final
   - Effort: High

2. **Todo en paralelo**
   - Dividir el trabajo en streams independientes
   - Pros: Máxima velocidad teórica
   - Cons: Altísimo riesgo de conflictos, dependencias cruzadas, difícil de coordinar
   - Effort: Very High (riesgo)

3. **Backend first, frontend después (seleccionada)**
   - Primero todo el backend (Comunicación + Archivo)
   - Luego todo el frontend
   - Refactorización al final (API client, cleanup, i18n)
   - Pros: Backend completo primero asegura que el frontend tenga endpoints. Clara separación.
   - Cons: El frontend queda para el final
   - Effort: High

### Recommendation

**Approach 1 - Secuencial por feature**, con el siguiente orden:

1. **Fase 0 — Backend faltante**: Crear módulos Comunicación y Archivo (controller + service + DTOs). Registrar en AppModule.
2. **Fase 1 — Limpieza template**: Eliminar productos, about, privacy, terms. Despachar rutas eliminadas.
3. **Fase 2 — Agenda frontend**: FullCalendar vista semanal + mensual, CRUD eventos, drag & drop, filtros.
4. **Fase 3 — Vencimientos frontend**: Tabla vencimientos, carga masiva Excel (SOCIO).
5. **Fase 4 — Notificaciones frontend**: Campanita en header, dropdown, página historial, marcar leídas.
6. **Fase 5 — Email Templates frontend**: CRUD con editor + preview + variables.
7. **Fase 6 — Financiero frontend**: Dashboard con Recharts (honorarios, rentabilidad, proyección).
8. **Fase 7 — Comunicación frontend**: CRUD + filtros por cliente/tipo.
9. **Fase 8 — Archivo frontend**: Upload, listado, download, delete.
10. **Fase 9 — Unificar API client**: Migrar auth/users de openapi-fetch a axios-instance. Eliminar client.ts.
11. **Fase 10 — i18n global**: Configurar i18next + react-i18next, migrar todos los strings.

### Delivery Strategy

Dado el tamaño masivo del cambio (>400 líneas por fase), se recomienda **chained PRs**:
- Cada fase = un commit atómico independiente
- Fases 0 (backend) + 1 (cleanup) pueden ir juntos
- i18n (fase 10) debe ir al final para evitar doble trabajo de migración de strings

**400-line budget risk**: High — cada fase individual puede exceder 400 líneas. Las fases frontend (agenda, financiero) probablemente excedan las 1000 líneas.

### Risks

- **Dependencia de paquetes externos**: FullCalendar puede tener problemas de compatibilidad con React 19/Next.js 16
- **i18n tardío**: Migrar strings al final puede ser tedioso si quedan muchos archivos
- **openapi-fetch → axios migration**: auth store usa ambos clientes actualmente, hay que coordinar el cambio sin romper el login
- **Drag & drop en FullCalendar**: React 19 puede tener issues con el event system de FullCalendar
- **Upload de archivos**: El frontend existente tiene `react-dropzone` pero el backend Archivo no tiene endpoint de upload real (solo CRUD de metadatos)
- **Carga masiva Excel**: El módulo Excel existe en backend pero hay que verificar si está integrado con vencimientos
- **Build breaks**: Con tantos cambios simultáneos, el riesgo de que el build falle es alto; se necesita verificar después de cada fase

### Ready for Proposal

Yes — la exploración está completa. El siguiente paso es crear el **proposal** con el alcance detallado, la estrategia de entrega y el plan de rollback.
