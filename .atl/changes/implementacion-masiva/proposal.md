# Proposal: Implementación Masiva — GestiónPro

## Intent

Llevar GestiónPro de un estado parcial (5 módulos backend sin frontend, 4 stubs placeholder, template leftovers, dualidad de API clients) a un dashboard completo donde cada módulo backend tiene su contraparte frontend funcional. Cerrar la brecha entre lo que existe en backend y lo que expone la UI.

## Scope

### In Scope
- **Backend**: Módulos Comunicación (CRUD + filtros) y Archivo (CRUD metadatos + upload)
- **Frontend**: 7 features nuevas — Agenda (FullCalendar), Vencimientos, Notificaciones, Email Templates, Financiero (Recharts), Comunicación, Archivo
- **Limpieza**: Eliminar `/product`, `/products`, `/about`, `/privacy`, `/terms`
- **Unificación**: Migrar auth y users de openapi-fetch a axios-instance; eliminar `client.ts`
- **i18n**: i18next + react-i18next con locale `es-AR`, migrar todos los strings hardcodeados

### Out of Scope
- Tests de ningún tipo (según AGENTS.md)
- Portal cliente, Google Calendar sync, bot Telegram (Etapa 5)
- Upload real a Cloudflare R2 (sin infraestructura)
- Cambios en modelos Prisma o migraciones
- Modificaciones a módulos backend existentes (clientes, tareas, auth, etc.)

## Capabilities

### New Capabilities
- `comunicacion-api`: Backend CRUD de comunicaciones con filtros por cliente/tipo
- `archivo-api`: Backend CRUD de metadatos de archivos + endpoint de upload
- `agenda-frontend`: Vista semanal/mensual con FullCalendar, CRUD eventos, drag & drop
- `vencimientos-frontend`: Tabla de vencimientos con carga masiva Excel (solo SOCIO)
- `notificaciones-frontend`: Campanita con badge en header, dropdown, página historial, marcar leídas
- `email-templates-frontend`: CRUD con editor, preview y variables (solo SOCIO)
- `financiero-frontend`: Dashboard financiero con Recharts (honorarios, rentabilidad, proyección)
- `comunicacion-frontend`: Tabla CRUD de comunicaciones con filtros por cliente y tipo
- `archivo-frontend`: Upload, listado, download, eliminación de archivos
- `routing`: Registro de nuevas rutas en nav-config con control de roles
- `api-client-unification`: Cliente único axios con interceptores JWT + refresh unificados
- `i18n`: Configuración i18next + traducciones es-AR + migración de strings en componentes existentes y nuevos

### Modified Capabilities
- `auth-frontend`: Solo implementativo — migración interna de openapi-fetch a axios (sin cambio de comportamiento)
- `users-frontend`: Solo implementativo — migración interna de openapi-fetch a axios (sin cambio de comportamiento)

## Approach

**Secuencial por feature**, 11 fases atómicas:

| Fase | Qué | Build-check |
|------|-----|-------------|
| 0 | Backend: Comunicación + Archivo modules | `pnpm build --filter=@gestionpro/api` |
| 1 | Limpieza: eliminar products, about, privacy, terms | `pnpm build --filter=@gestionpro/web` |
| 2 | Agenda frontend (FullCalendar) | ✅ |
| 3 | Vencimientos frontend | ✅ |
| 4 | Notificaciones frontend | ✅ |
| 5 | Email Templates frontend | ✅ |
| 6 | Financiero frontend | ✅ |
| 7 | Comunicación frontend | ✅ |
| 8 | Archivo frontend | ✅ |
| 9 | Unificar API client (axios) | ✅ |
| 10 | i18n global (i18next) | ✅ |

**Delivery**: Chained PRs — cada fase = 1 commit atómico. Fase 0 y 1 pueden ir juntas si cada una <400 líneas.

## Affected Areas

| Área | Impacto | Archivos clave |
|------|---------|----------------|
| `apps/api/src/modules/comunicacion/` | Nuevo | controller, service, DTOs, module |
| `apps/api/src/modules/archivo/` | Nuevo | controller, service, DTOs, module |
| `apps/api/src/app/app.module.ts` | Modificado | Registrar 2 nuevos módulos |
| `apps/web/src/features/{agenda,vencimientos,notificaciones,email-templates,financiero,comunicacion,archivo}/` | Nuevo (7) | api/ + components/ + pages |
| `apps/web/src/app/dashboard/{agenda,vencimientos,notificaciones,email-templates,financiero,comunicacion,archivo}/` | Nuevo/Modificado | Page components |
| `apps/web/src/config/nav-config.ts` | Modificado | Nuevas rutas + roles |
| `apps/web/src/components/layout/header.tsx` | Modificado | Campanita notificaciones |
| `apps/web/src/features/{products,product,about,privacy,terms}/` | Eliminado | Template leftovers |
| `apps/web/src/lib/api/client.ts` | Eliminado | openapi-fetch legacy |
| `apps/web/src/features/{auth,users}/api/service.ts` | Modificado | Migrar a axios |
| `apps/web/src/locales/es-AR/` | Nuevo | Traducciones i18n |
| `apps/web/src/**/*.tsx` | Modificado | Migración strings a `t()` |

## Risks

| Riesgo | Prob | Mitigación |
|--------|------|------------|
| FullCalendar incompatible con React 19/Next.js 16 | Med | Testear renderizado básico antes de feature completa; tener alternativa (BigCalendar) |
| Migración API client rompe auth store | Med | Fase 9 aislada; test manual de login completo antes de seguir |
| i18n al final requiere re-tocar todos los archivos | Alta | i18n wrapper hook desde fase 2 para nuevos features; solo migrar legacy al final |
| Build breaks entre fases | Med | `pnpm build` después de cada fase; commit atómico permite `git revert` |
| Upload de archivos sin infraestructura S3/R2 | Baja | Implementar solo metadatos + endpoint upload (sin storage real); guardar path |

## Rollback Plan

- Cada fase es un commit atómico con mensaje Conventional Commit
- Revertir fase individual: `git revert <commit-hash>`
- Rollback completo: `git revert HEAD~11..HEAD`
- Las migraciones de Prisma no se tocan → no hay riesgo de pérdida de datos
- Dependencias nuevas (FullCalendar, i18next) son aditivas; no rompen nada si se revierten

## Dependencies

- `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` (fase 2)
- `i18next`, `react-i18next`, `i18next-browser-languagedetector` (fase 10)
- Backend corriendo en `localhost:3001` para desarrollo frontend

## Success Criteria

- [ ] `pnpm build` pasa en raíz del monorepo después de cada fase
- [ ] 7 páginas nuevas renderizan datos reales del backend (no stubs ni mock data)
- [ ] Ningún archivo de `products/`, `about/`, `privacy/`, `terms/` existe en el repo
- [ ] Un solo cliente HTTP en uso (`axios-instance`); `client.ts` eliminado
- [ ] Todos los strings visibles al usuario usan `t('key')` con traducción `es-AR`
- [ ] Campanita de notificaciones muestra badge con conteo no leídas
- [ ] Agenda muestra eventos en vista semanal y mensual con interacción drag & drop
- [ ] Nav lateral incluye todas las nuevas páginas con control de roles correcto
