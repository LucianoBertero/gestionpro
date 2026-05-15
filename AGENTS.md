# AGENTS.md — GestiónPro

> **LEER PRIMERO** antes de generar cualquier código. Este archivo es la fuente de verdad para cualquier IA que trabaje en este proyecto.

## Qué es

Sistema de gestión interna para **Estudio BB**, un estudio contable argentino. Aplicación web con backend NestJS y frontend Next.js tipo dashboard administrativo.

- **50-150 clientes** activos, **5-10 usuarios** simultáneos
- **Un solo tenant** (`estudioId=1` fijo), preparado para multitenancy futuro
- **Roles**: SOCIO (acceso total) y COLABORADOR (solo sus clientes/tareas)

## Estructura del proyecto

```
gestionpro/                      ← Monorepo Turborepo + pnpm
├── apps/
│   ├── api/                     ← Backend NestJS 11 (hmake98/nestjs-starter)
│   │   ├── src/modules/         ← Feature modules (auth, user, etc.)
│   │   ├── src/common/          ← Infra: DB, cache, guards, response
│   │   └── prisma/              ← Schema + migrations
│   └── web/                     ← Frontend Next.js 16 (Kiranism/next-shadcn-dashboard-starter)
│       ├── src/features/        ← Feature-based modules
│       └── src/components/ui/   ← shadcn/ui (NO modificar)
├── packages/types/              ← Tipos TypeScript compartidos
├── especificaciones/            ← Documentación técnica
└── .atl/                        ← SDD artifacts + skill registry
```

## Stack Tecnológico — DEFINITIVO

### Backend (apps/api)
| Tecnología | Rol |
|------------|-----|
| NestJS 11 + TypeScript | Framework, arquitectura modular |
| Prisma 7 | ORM, migraciones |
| PostgreSQL (Supabase SA-East) | Base de datos |
| Redis (Upstash) | Cache, sesiones, BullMQ |
| BullMQ | Jobs asincrónicos |
| JWT (passport-jwt + argon2) | Auth: access 15min + refresh 7d rotativo |
| nestjs-pino | Logging estructurado con correlation IDs |
| Swagger/OpenAPI | Documentación de endpoints |
| Sentry | Monitoreo de errores |

### Frontend (apps/web)
| Tecnología | Rol |
|------------|-----|
| Next.js 16 (App Router) + TypeScript | Framework |
| Tailwind CSS v4 + shadcn/ui | Estilos + componentes base |
| TanStack Table v8 + Form | Tablas con sort/filter + formularios |
| React Query v5 | Fetching, cache, invalidación |
| Zustand v5 | Estado global |
| FullCalendar | Vista de calendario (a instalar) |
| Recharts | Gráficos del dashboard (ya incluido) |
| Axios | Cliente HTTP al backend |

### Infraestructura Cloud
| Servicio | Proveedor | Uso |
|----------|-----------|-----|
| PostgreSQL | Supabase (SA-East, free) | Base de datos principal |
| Redis | Upstash (free) | Cache + BullMQ |
| Storage | Cloudflare R2 (pendiente) | Archivos, comprobantes |
| Email | AWS SES (pendiente) | Notificaciones |
| IA/OCR | Anthropic API (pendiente) | Bot Telegram, comprobantes |

## Modelo de Datos — RESUMEN

**12 modelos, 10 enums.** Ver detalle completo en `especificaciones/doc_tecnico_ia.js` Sección 4.

Modelos principales:
- **Usuario**: SOCIO/COLABORADOR, JWT auth, vinculación Telegram
- **Cliente**: CUIT único, encargado, semáforo (VERDE/AMARILLO/ROJO), impuestos
- **Tarea**: tipo (DDJJ/VEP/INTERNA/BALANCE), prioridad, estado, recurrencia
- **Liquidación**: impuesto, período, resultado (A_PAGAR/SALDO_A_FAVOR/SIN_MOVIMIENTO)
- **AgendaItem**: eventos personales, del estudio, importados de Google
- **Notificación**, **EmailTemplate**, **Comunicación**, **Archivo**
- **CalendarioVencimiento**, **RefreshToken**, **ClienteImpuesto**

**Enums clave**: Rol, TipoImpuesto, TipoTarea, Prioridad, EstadoTarea, ResultadoLiq, TipoEvento, OrigenEvento, TipoTemplate, EstadoSemaforo, TipoNotificacion, TipoArchivo

## Convenciones de Código — OBLIGATORIAS

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos/carpetas | kebab-case | `clientes.service.ts`, `panel-tareas.tsx` |
| Clases/tipos | PascalCase | `ClienteService`, `LiquidacionDto` |
| Variables/funciones | camelCase | `obtenerClientes()`, `encargadoId` |
| Constantes | UPPER_SNAKE_CASE | `MAX_INTENTOS_LOGIN` |
| Enums Prisma | UPPER_SNAKE_CASE | `A_PAGAR`, `SALDO_A_FAVOR` |
| Rutas API | kebab-case plural | `/email-templates`, `/agenda-items` |
| Períodos | String 'YYYY-MM' | `'2026-05'` |

### Fechas
- **Siempre UTC en PostgreSQL**
- Convertir a `America/Argentina/Buenos_Aires` con `date-fns-tz` solo al mostrar

### Formato de respuestas API
```json
// Éxito con lista
{ "data": [...], "meta": { "total": 50, "pagina": 1, "porPagina": 20 } }
// Error
{ "error": "CLIENTE_NO_ENCONTRADO", "mensaje": "El cliente con id 5 no existe", "status": 404 }
```

## Seguridad — Checklist por endpoint

- [ ] `@UseGuards(JwtAuthGuard)` en todos los endpoints protegidos
- [ ] `@Roles()` si es solo para SOCIO
- [ ] DTO con `class-validator` en todos los campos
- [ ] COLABORADOR solo ve sus datos → filtrar por `usuarioId`
- [ ] Rate limiting en endpoints sensibles

## Testing

### Backend (apps/api)
- **Jest 30** con 100% coverage requerido (statements, branches, functions, lines)
- Comando: `npm test` (desde apps/api)
- Tests en `test/` espejando `src/`
- Mock deps: `{ method: jest.fn() }`, nunca `jest.createMockFromModule`
- `clearMocks: true` global — nunca llamar `jest.clearAllMocks()` manualmente

### Frontend (apps/web)
- **Sin test runner** — necesita configuración (Vitest recomendado)

## Etapas de Desarrollo

| Etapa | Módulos | Estado |
|-------|---------|--------|
| 0 | Monorepo, Auth, Login | ⬜ Fundación |
| 1 | Clientes, Tareas, Vencimientos, Liquidaciones | ⬜ Core |
| 2 | Agenda, Notificaciones, Email, Documentos | ⬜ Comunicaciones |
| 3 | Excel Import/Export, Bot Telegram | ⬜ Integraciones |
| 4 | Dashboard, Métricas, Panel Financiero | ⬜ Visibilidad |
| 5 | Google Calendar, Portal Cliente | ⬜ Futuro |

## Reglas para IAs

1. **NO usar librerías fuera del stack definido** sin consultar
2. **NO cambiar la estructura de carpetas**
3. **NO tomar decisiones arquitectónicas** sin consultar
4. **Seguir convenciones de nomenclatura exactas**
5. **Todo endpoint nuevo con JwtAuthGuard y validación DTO**
6. **Leer `especificaciones/doc_tecnico_ia.js`** para contexto completo antes de empezar
7. **Backend: importar `DatabaseModule`, nunca `CommonModule`** en feature modules
8. **Frontend: usar `Icons.keyName` desde `@/components/icons`, nunca importar iconos directo**
9. **Prisma: `@map("snake_case")` y `@@map("plural_snake_case")`** en todos los campos y tablas
10. **Fechas siempre UTC en DB**, convertir solo en frontend

## Archivos de contexto IA

| Archivo | Qué contiene |
|---------|-------------|
| `AGENTS.md` (este) | Visión general del proyecto |
| `apps/api/CLAUDE.md` | Convenciones NestJS detalladas |
| `apps/web/AGENTS.md` | Convenciones Next.js + patrones del template |
| `especificaciones/doc_tecnico_ia.js` | Documento técnico completo (1141 líneas) |
| `.atl/skill-registry.md` | Skills disponibles y su aplicabilidad |
