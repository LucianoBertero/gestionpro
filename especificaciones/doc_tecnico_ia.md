# Contexto Técnico para IA — GestiónPro

> **Documento vivo · Versión 1.0 · Mayo 2026**
> Leer completo antes de generar cualquier código.

---

## 0. Instrucciones para la IA

Este documento es el contexto completo del proyecto. Leelo íntegro antes de escribir una sola línea de código. Cada decisión técnica ya fue tomada — **no propongas alternativas** salvo que se indique explícitamente.

- Al iniciar una sesión, usá este documento como contexto base junto con los `AGENTS.md`
- Indicá en qué módulo o tarea específica vas a trabajar
- Seguí el stack, convenciones y estructura definidos. No improvises
- Si algo no está definido acá, preguntá antes de asumir
- Al terminar una tarea, actualizá la tabla de estado del módulo correspondiente

> ⚠️ No uses librerías distintas a las definidas en este documento sin consultar primero. No cambies la estructura de carpetas. No tomes decisiones arquitectónicas por tu cuenta.

---

## 1. Descripción del Sistema

### 1.1 Qué es

Sistema de gestión interna para **Estudio BB**, un estudio contable argentino. Centraliza la administración de clientes, tareas, agenda, liquidaciones impositivas y comunicaciones del equipo. Es una aplicación web con backend API REST y frontend tipo dashboard administrativo.

### 1.2 Usuarios del sistema

| Rol | Cantidad | Acceso |
|-----|----------|--------|
| **SOCIO** | 2 (Anto y Lau) | Vista completa: todos los clientes, todos los colaboradores, métricas globales, gestión de usuarios |
| **COLABORADOR** | 3-8 (Ernesto, Jesi, etc.) | Solo sus clientes asignados, sus tareas, su agenda personal |

### 1.3 Escala actual

- 50 a 150 clientes activos
- 5 a 10 usuarios simultáneos
- Un solo tenant (un único estudio) — no es SaaS multitenant en esta versión
- El campo `estudioId` existe en todos los modelos con valor fijo `1`, preparado para multitenancy futuro

---

## 2. Stack Tecnológico — Definitivo

> Este es el stack definido. No sugerir alternativas. No agregar librerías fuera de las listadas sin aprobación explícita.

### 2.1 Frontend

Template base: `github.com/Kiranism/next-shadcn-dashboard-starter`

| Tecnología | Versión | Rol en el proyecto |
|------------|---------|-------------------|
| Next.js | 16 (App Router) | Framework principal, SSR, rutas, server components |
| TypeScript | 5.x strict mode | Tipado estricto en todo el proyecto |
| Tailwind CSS | v4 | Estilos utilitarios |
| shadcn/ui | latest | Componentes base: tablas, forms, modales, badges, selects |
| TanStack Table | v8 | Tablas con sort, filter, paginación server-side |
| TanStack Form | latest | Formularios con validación |
| React Query | v5 | Fetching, cache e invalidación de datos |
| Zod | latest | Validación de schemas, compartido con backend |
| Zustand | v5 | Estado global: usuario logueado, filtros activos |
| FullCalendar | latest | Vista de calendario semanal y de equipo (a instalar) |
| Recharts | latest | Gráficos del dashboard |
| Lucide React | latest | Iconografía consistente (via `@tabler/icons-react`) |
| Axios | latest | Cliente HTTP hacia el backend |
| date-fns + date-fns-tz | latest | Fechas y conversión a zona horaria Argentina |
| xlsx (SheetJS) | latest | Import/export de archivos Excel en el cliente |

### 2.2 Backend

Template base: `github.com/hmake98/nestjs-starter`

| Tecnología | Versión | Rol en el proyecto |
|------------|---------|-------------------|
| NestJS | 11.x | Framework principal, arquitectura modular |
| TypeScript | 6.x strict mode | Tipado estricto |
| Prisma | 7.x | ORM, migraciones, schema de DB |
| PostgreSQL | 15 | Base de datos principal (Supabase SA-East) |
| Redis | 7.x (Upstash) | Cache, sesiones, cola de jobs |
| BullMQ | latest | Jobs asincrónicos: emails, alertas, sync Telegram |
| JWT (passport-jwt + argon2) | — | Access token 15min + refresh token 7 días rotativo |
| class-validator | latest | Validación de DTOs en todos los endpoints |
| nestjs-pino | latest | Logging estructurado con correlation IDs |
| @nestjs/throttler | latest | Rate limiting por IP y por usuario |
| @nestjs/schedule | latest | Cron jobs: alertas diarias, sync Google Calendar |
| @aws-sdk/client-ses | latest | Envío de emails transaccionales (pendiente) |
| nestjs-telegraf | latest | Bot de Telegram (pendiente) |
| xlsx (SheetJS) | latest | Procesamiento de archivos Excel en el servidor |
| multer | latest | Upload de archivos (Excel, imágenes de comprobantes) |
| Swagger / OpenAPI | latest | Documentación automática de endpoints |
| Helmet | latest | Headers de seguridad HTTP |
| nestjs-i18n | latest | Internacionalización |
| Sentry | latest | Monitoreo de errores en producción |

### 2.3 Storage y servicios externos

| Servicio | Proveedor | Uso |
|----------|-----------|-----|
| Base de datos | PostgreSQL (Supabase SA-East, free) | Datos del sistema |
| Cache / Queue | Redis (Upstash, free) | Sesiones, BullMQ jobs |
| Storage de archivos | Cloudflare R2 (pendiente) | Documentos de clientes, comprobantes, exports |
| Email | AWS SES (pendiente) | Notificaciones, recordatorios, templates |
| Mensajería | Telegram Bot API | Bot de carga rápida para colaboradores |
| Calendario externo | Google Calendar API (fase futura) | Sync de eventos personales |
| AFIP Padrón | API pública AFIP | Autocompletado de datos por CUIT |
| IA / OCR | Anthropic API (pendiente) | Procesamiento de comprobantes, bot Telegram |

---

## 3. Arquitectura del Proyecto

### 3.1 Estructura de repositorio

```
gestionpro/                    ← raíz del monorepo Turborepo + pnpm
├── apps/
│   ├── api/                   ← Backend NestJS
│   └── web/                   ← Frontend Next.js
├── packages/
│   └── types/                 ← Tipos TypeScript compartidos
├── especificaciones/          ← Documentación técnica
├── .atl/                      ← SDD artifacts
└── AGENTS.md                  ← Reglas y contexto para IAs
```

### 3.2 Estructura del Backend

```
apps/api/src/
├── main.ts
├── app/
│   ├── app.module.ts          ← root module
│   └── controllers/           ← health check
├── common/                    ← Infraestructura: DB, cache, guards, response
│   ├── config/                ← registerAs() factories
│   ├── database/              ← Prisma, repositorios, interfaces
│   ├── request/               ← Guards, decorators (@AuthUser, @PublicRoute, @AllowedRoles)
│   ├── response/              ← Interceptor, filtros, DTOs de respuesta
│   ├── cache/                 ← CacheService (ioredis)
│   └── bullmq/                ← BullMQ module
├── modules/
│   ├── auth/                  ← Login, signup, refresh, logout
│   ├── user/                  ← Perfil + admin CRUD
│   ├── clientes/              ← Módulo clientes (en desarrollo)
│   └── ...                    ← Futuros módulos
└── workers/                   ← Cron schedulers
```

Ver `apps/api/AGENTS.md` para estructura detallada y patrones de código.

### 3.3 Estructura del Frontend

```
apps/web/src/
├── app/
│   ├── auth/login/            ← Login con selector de usuario
│   └── dashboard/             ← Rutas protegidas
│       ├── overview/          ← Dashboard home
│       ├── clientes/          ← CRUD clientes
│       └── ...
├── components/
│   ├── ui/                    ← shadcn/ui (NO modificar)
│   ├── layout/                ← Sidebar, header, PageContainer
│   └── icons.tsx              ← Registro central de iconos
├── features/
│   ├── auth/                  ← Login + auth store (Zustand)
│   ├── users/                 ← Gestión de usuarios
│   └── clientes/              ← CRUD clientes (en desarrollo)
├── lib/
│   └── auth/
│       └── axios-instance.ts  ← Axios con interceptor JWT
├── config/
│   └── nav-config.ts          ← Navegación con roles
├── middleware.ts              ← Protección de rutas
└── providers.tsx              ← QueryProvider + AuthProvider + ThemeProvider
```

Ver `apps/web/AGENTS.md` para estructura detallada y patrones de código.

---

## 4. Modelo de Datos — Prisma Schema Completo

> Todos los modelos tienen `estudioId` con default `1`. No se usa para filtrar hoy pero está preparado para multitenancy. Las fechas se guardan en UTC siempre.

### 4.1 Enums

```prisma
enum Rol              { SOCIO COLABORADOR }
enum TipoImpuesto     { AUTONOMOS IVA IIBB_LOCAL MUNICIPAL SUELDOS MONOTRIBUTO GANANCIAS }
enum TipoTarea        { DDJJ VEP INTERNA BALANCE OTRO }
enum Prioridad        { ALTA MEDIA BAJA }
enum EstadoTarea      { PENDIENTE EN_PROCESO COMPLETADA CANCELADA }
enum ResultadoLiq     { A_PAGAR SALDO_A_FAVOR SIN_MOVIMIENTO }
enum TipoEvento       { TAREA ESTUDIO PERSONAL }
enum OrigenEvento     { SISTEMA MANUAL GOOGLE }
enum TipoTemplate     { VENCIMIENTO LIQUIDACION RECORDATORIO GENERAL }
enum EstadoSemaforo   { VERDE AMARILLO ROJO }
enum TipoNotificacion { VENCIMIENTO TAREA SISTEMA }
enum TipoArchivo      { COMPROBANTE DDJJ CONTRATO OTRO }
```

### 4.2 Modelos principales

#### Usuario

```prisma
model Usuario {
  id             Int       @id @default(autoincrement())
  estudioId      Int       @default(1)
  nombre         String
  email          String    @unique
  password       String                    // argon2 hash
  rol            Rol       @default(COLABORADOR)
  emoji          String?                   // avatar emoji del selector
  telefono       String?
  telegramChatId String?                   // para bot Telegram
  googleTokens   Json?                     // OAuth tokens Google Calendar
  activo         Boolean   @default(true)
  creadoEn       DateTime  @default(now())

  tareas         Tarea[]   @relation("Encargado")
  agendaItems    AgendaItem[]
  notificaciones Notificacion[]
  refreshTokens  RefreshToken[]
}
```

#### Cliente

```prisma
model Cliente {
  id             Int               @id @default(autoincrement())
  estudioId      Int               @default(1)
  cuit           String            @unique
  denominacion   String
  termino        Int               @default(0)   // 0, 3, 6
  condicionIva   String
  actividades    String[]
  domicilio      String?
  telefono       String?
  email          String?
  whatsapp       String?
  encargadoId    Int
  supervisorId   Int?
  semaforo       EstadoSemaforo    @default(VERDE)
  activo         Boolean           @default(true)
  notas          String?
  creadoEn       DateTime          @default(now())

  encargado      Usuario           @relation("Encargado", fields: [encargadoId], references: [id])
  impuestos      ClienteImpuesto[]
  tareas         Tarea[]
  liquidaciones  Liquidacion[]
  archivos       Archivo[]
  comunicaciones Comunicacion[]
}
```

#### ClienteImpuesto

```prisma
model ClienteImpuesto {
  id         Int          @id @default(autoincrement())
  clienteId  Int
  tipo       TipoImpuesto
  activo     Boolean      @default(true)

  cliente    Cliente      @relation(fields: [clienteId], references: [id])
}
```

#### Tarea

```prisma
model Tarea {
  id            Int          @id @default(autoincrement())
  estudioId     Int          @default(1)
  clienteId     Int?
  encargadoId   Int
  titulo        String
  descripcion   String?
  tipo          TipoTarea
  impuesto      TipoImpuesto?
  periodo       String?                    // '2026-05'
  tiempoEstMin  Int?                       // minutos estimados
  prioridad     Prioridad    @default(MEDIA)
  estado        EstadoTarea  @default(PENDIENTE)
  vence         DateTime?
  esRecurrente  Boolean      @default(false)
  reglaRecur    Json?                      // config de recurrencia
  notas         String?
  creadoEn      DateTime     @default(now())

  cliente       Cliente?     @relation(fields: [clienteId], references: [id])
  encargado     Usuario      @relation("Encargado", fields: [encargadoId], references: [id])
  agendaItems   AgendaItem[]
}
```

#### Liquidacion

```prisma
model Liquidacion {
  id            Int           @id @default(autoincrement())
  estudioId     Int           @default(1)
  clienteId     Int
  impuesto      TipoImpuesto
  periodo       String                     // '2026-05'
  resultado     ResultadoLiq
  importe       Decimal?      @db.Decimal(12, 2)
  importeRef    Decimal?      @db.Decimal(12, 2)  // importe período anterior
  vencimiento   DateTime?
  formaPago     String?                    // VEP, débito, etc.
  comprobante   String?                    // URL en R2
  cargadoPorId  Int
  origenCarga   String        @default("MANUAL")  // MANUAL | BOT | EXCEL
  creadoEn      DateTime      @default(now())

  cliente       Cliente       @relation(fields: [clienteId], references: [id])
}
```

#### AgendaItem

```prisma
model AgendaItem {
  id             Int          @id @default(autoincrement())
  usuarioId      Int
  tareaId        Int?
  titulo         String
  descripcion    String?
  fecha          DateTime
  duracionMin    Int
  tipo           TipoEvento   @default(PERSONAL)
  origen         OrigenEvento @default(MANUAL)
  googleEventId  String?
  esEstudio      Boolean      @default(false)   // visible para todos
  creadoEn       DateTime     @default(now())

  usuario        Usuario      @relation(fields: [usuarioId], references: [id])
  tarea          Tarea?       @relation(fields: [tareaId], references: [id])
}
```

#### CalendarioVencimiento

```prisma
model CalendarioVencimiento {
  id          Int          @id @default(autoincrement())
  impuesto    TipoImpuesto
  anio        Int
  mes         Int          // 1-12
  digitoCuit  Int          // 0-9
  fechaVence  DateTime

  @@unique([impuesto, anio, mes, digitoCuit])
}
```

#### Notificacion

```prisma
model Notificacion {
  id         Int               @id @default(autoincrement())
  usuarioId  Int
  tipo       TipoNotificacion
  titulo     String
  mensaje    String
  leida      Boolean           @default(false)
  enlace     String?           // ruta interna de la app
  creadoEn   DateTime          @default(now())

  usuario    Usuario           @relation(fields: [usuarioId], references: [id])
}
```

#### EmailTemplate

```prisma
model EmailTemplate {
  id          Int            @id @default(autoincrement())
  estudioId   Int            @default(1)
  nombre      String
  tipo        TipoTemplate
  asunto      String         // soporta variables: {{cliente}}, {{impuesto}}, {{fecha}}
  cuerpo      String         // HTML con variables
  activo      Boolean        @default(true)
  creadoEn    DateTime       @default(now())
}
```

#### Comunicacion

```prisma
model Comunicacion {
  id          Int      @id @default(autoincrement())
  clienteId   Int
  usuarioId   Int
  tipo        String   // EMAIL | WHATSAPP | LLAMADA | NOTA
  asunto      String?
  contenido   String?
  creadoEn    DateTime @default(now())

  cliente     Cliente  @relation(fields: [clienteId], references: [id])
}
```

#### Archivo

```prisma
model Archivo {
  id          Int        @id @default(autoincrement())
  clienteId   Int
  nombre      String
  tipo        TipoArchivo
  periodo     String?    // '2026-05'
  url         String     // URL en Cloudflare R2
  tamanioKb   Int?
  subidoPorId Int
  creadoEn    DateTime   @default(now())

  cliente     Cliente    @relation(fields: [clienteId], references: [id])
}
```

#### RefreshToken

```prisma
model RefreshToken {
  id         Int      @id @default(autoincrement())
  usuarioId  Int
  token      String   @unique
  expira     DateTime
  revocado   Boolean  @default(false)
  creadoEn   DateTime @default(now())

  usuario    Usuario  @relation(fields: [usuarioId], references: [id])
}
```

---

## 5. Módulos por Etapa de Desarrollo

> Desarrollar en el orden exacto de esta sección. Cada módulo depende del anterior. No arrancar un módulo sin tener el anterior funcionando.

### ETAPA 0 — Fundación

**Objetivo**: el proyecto base corre localmente y en producción. Sin lógica de negocio todavía.

#### 0.1 Monorepo
- Inicializar Turborepo con `apps/api` y `apps/web`
- Clonar Kiranism en `apps/web`, limpiar features no necesarias
- Clonar hmake98 en `apps/api`
- Configurar docker-compose.yml con PostgreSQL 15 y Redis 7
- Variables de entorno: `.env.example` completo, `.env` en `.gitignore`

#### 0.2 Auth completo
- Registro de usuario (solo SOCIO puede crear usuarios)
- Login con email/password → access token 15min + refresh token 7 días
- Refresh token rotativo: cada uso genera uno nuevo, invalida el anterior
- Logout: revoca refresh token en DB
- Guard `JwtAuthGuard` en todos los endpoints protegidos
- Guard `RolesGuard` con decorator `@AllowedRoles([UserRole.SOCIO])`
- Middleware de logging: cada request loguea método, ruta, usuarioId, tiempo

#### 0.3 Selección de perfil en frontend
- Pantalla de login con selector visual de usuario (emoji-based picker)
- Al seleccionar usuario → pide password
- Token guardado en memoria (Zustand) + refresh token en cookie httpOnly
- Interceptor Axios: adjunta token en cada request, refresca si expira

> 🔑 Al terminar esta etapa: login funciona, los roles están activos, el proyecto deployado.

---

### ETAPA 1 — Core de Negocio

**Objetivo**: los módulos principales del estudio funcionando con datos reales.

#### 1.1 Módulo Clientes

**Backend — endpoints**:
- `GET /clientes` — lista paginada, filtrable por encargado/estado/semaforo
- `GET /clientes/:id` — legajo completo con impuestos, tareas recientes, liquidaciones recientes
- `POST /clientes` — crear cliente
- `PATCH /clientes/:id` — editar cliente
- `DELETE /clientes/:id` — soft delete (`activo: false`)
- `GET /clientes/afip/:cuit` — consulta padrón AFIP y devuelve datos para autocompletar

**Backend — lógica**:
- Al crear cliente: configurar `ClienteImpuesto` según impuestos seleccionados
- Semáforo: calculado en cada consulta según tareas vencidas y liquidaciones faltantes
- Solo SOCIO puede asignar/cambiar encargado y supervisor
- COLABORADOR solo ve clientes donde es encargado

**Frontend — vistas**:
- Tabla de clientes con columnas: denominación, CUIT, encargado, semáforo, impuestos activos
- Filtros: encargado, semáforo, búsqueda por nombre/CUIT
- Botón WhatsApp: `wa.me/{whatsapp}?text=...` abre en nueva pestaña
- Botón Email: `mailto:{email}?subject=...` abre cliente de correo
- Legajo del cliente: tabs Resumen / Tareas / Liquidaciones / Archivos / Comunicaciones / Notas
- Al ingresar CUIT en formulario nuevo → llama a `/clientes/afip/:cuit` → autocompleta campos

#### 1.2 Módulo Tareas

**Backend — endpoints**:
- `GET /tareas` — lista con filtros: encargado, estado, prioridad, cliente, vencimiento
- `POST /tareas` — crear tarea
- `PATCH /tareas/:id` — actualizar estado, encargado, prioridad
- `DELETE /tareas/:id` — soft delete
- `POST /tareas/:id/completar` — marca como COMPLETADA y dispara notificación

**Backend — lógica**:
- Al vencer una tarea: cron job diario actualiza prioridad a ALTA automáticamente
- Tareas recurrentes: campo `esRecurrente` + `reglaRecur` (JSON con frecuencia, día, etc.)
- Cron job mensual: crea tareas recurrentes del próximo período para todos los clientes
- Al crear tarea con vencimiento: crear `AgendaItem` automáticamente para el encargado

**Frontend — vistas**:
- Panel de Tareas: tabla con columnas cliente, tema, tipo, encargado, tiempo, prioridad, estado, vence
- Filtros combinables: encargado, estado, prioridad, cliente
- Indicador visual de vencimiento: verde > 7 días, naranja 1-7 días, rojo vencida
- Cambio de estado inline en la tabla (select directo)
- Modal de nueva tarea con todos los campos

#### 1.3 Módulo Vencimientos

**Backend — lógica**:
- Tabla `CalendarioVencimiento`: cargada manualmente una vez por año con los datos de AFIP
- Endpoint `GET /vencimientos/calcular?cuit=X&impuesto=Y&mes=Z` → devuelve fecha exacta
- Al crear liquidación: calcula automáticamente la fecha de vencimiento por CUIT y asigna
- Endpoint `GET /vencimientos/proximos?dias=7` → tareas que vencen en los próximos N días

**Frontend — vistas**:
- Vista de vencimientos: lista ordenada por fecha, agrupada por semana
- Indicador visual: días restantes, quién es el encargado
- Filtro por impuesto y encargado

#### 1.4 Módulo Liquidaciones

**Backend — endpoints**:
- `GET /liquidaciones?clienteId=X&periodo=YYYY-MM` — liquidaciones del período
- `POST /liquidaciones` — cargar liquidación manual
- `PATCH /liquidaciones/:id` — corregir liquidación existente
- `GET /liquidaciones/:clienteId/historial` — últimos 12 períodos

**Backend — lógica**:
- Al cargar liquidación: guardar `importeRef` con el importe del período anterior
- Alerta de inconsistencia: si importe > 3x el promedio de los últimos 6 meses → notificación
- Al completar todas las liquidaciones del período de un cliente → semáforo pasa a VERDE
- `origenCarga`: MANUAL | BOT | EXCEL — para auditoría

**Frontend — vistas**:
- Pantalla de carga de liquidación: tabla con una fila por impuesto activo del cliente
- Columnas: impuesto, resultado (select), importe, vencimiento (auto calculado), forma de pago
- Mostrar importe del período anterior como referencia en cada fila
- Selector de período (mes/año) en el header de la pantalla

> 🔑 Al terminar Etapa 1: el estudio puede operar completamente. Clientes, tareas, vencimientos y liquidaciones funcionando.

---

### ETAPA 2 — Agenda y Comunicaciones

**Objetivo**: agenda del equipo, notificaciones automáticas, email y comunicaciones.

#### 2.1 Módulo Agenda

**Backend — endpoints**:
- `GET /agenda?usuarioId=X&semana=YYYY-WW` — agenda semanal de un usuario
- `GET /agenda/equipo?semana=YYYY-WW` — todos los usuarios (solo SOCIO)
- `POST /agenda` — crear evento personal o del estudio
- `PATCH /agenda/:id` — editar evento
- `DELETE /agenda/:id` — eliminar evento
- `GET /agenda/:usuarioId/ical` — feed iCal para suscribir en Google/Apple Calendar

**Frontend — vistas**:
- Vista Personal: FullCalendar en modo semana, muestra tareas + eventos del estudio + personales
- Vista de Equipo (SOCIO): FullCalendar Resource View — una columna por colaborador
- Colores: tareas del sistema (según prioridad), eventos estudio (azul), personales (gris)
- Click en tarea del calendario → abre detalle de la tarea
- Drag & drop para mover eventos personales entre días
- Botón de copiar URL del feed iCal personal

#### 2.2 Módulo Notificaciones y Alertas

**Backend — jobs BullMQ**:
- Job diario 08:00hs: revisar vencimientos próximos (1, 3, 7 días) → crear Notificacion + enviar email
- Job diario 08:00hs: revisar tareas vencidas sin completar → alerta al encargado y al socio
- Job diario: detectar clientes sin actividad en los últimos 45 días → alerta al socio
- Job al cargar liquidación: detectar inconsistencias vs histórico → notificación inmediata
- Job al completar tarea: actualizar semáforo del cliente

**Frontend — vistas**:
- Centro de notificaciones: campana en header con badge de no leídas
- Panel de notificaciones: lista con tipo, mensaje, fecha y enlace directo al recurso
- Marcar como leída al hacer click
- Filtro por tipo (vencimiento, tarea, sistema)

#### 2.3 Módulo Email y Templates

**Backend — endpoints**:
- `GET /email-templates` — lista de templates del estudio
- `POST /email-templates` — crear template con variables `{{variable}}`
- `PATCH /email-templates/:id` — editar template
- `POST /email/enviar` — envía email usando template + datos del cliente
- `POST /email/enviar-masivo` — envía a múltiples clientes (con lista de clienteIds)

**Backend — lógica**:
- Variables disponibles: `{{cliente}}`, `{{cuit}}`, `{{impuesto}}`, `{{importe}}`, `{{fecha}}`, `{{encargado}}`
- Envío via AWS SES con dominio del estudio configurado
- Al enviar email: crear registro en `Comunicacion` automáticamente
- Envío masivo: procesado como job BullMQ, no bloquea el request

**Frontend — vistas**:
- Gestor de templates: lista, editor con preview en tiempo real
- Modal de envío: selector de template, preview renderizado con datos del cliente, botón enviar
- Disponible desde el legajo del cliente y desde el panel de vencimientos

#### 2.4 Módulo Gestión Documental

**Backend — endpoints**:
- `POST /archivos/upload` — sube archivo a Cloudflare R2, guarda metadata en DB
- `GET /archivos?clienteId=X` — lista de archivos del cliente
- `GET /archivos/:id/url` — genera URL firmada temporal de descarga (15 min)
- `DELETE /archivos/:id` — elimina de R2 y de DB

**Frontend — vistas**:
- Tab Archivos en legajo del cliente: lista con nombre, tipo, período, fecha, tamaño
- Upload con drag & drop o selector
- Descarga directa via URL firmada
- Filtro por tipo y período

> 🔑 Al terminar Etapa 2: agenda del equipo operativa, alertas automáticas funcionando, emails enviándose desde el sistema.

---

### ETAPA 3 — Excel y Bot Telegram

**Objetivo**: el sistema procesa archivos externos y recibe comandos por Telegram.

#### 3.1 Módulo Excel — Importación

**Backend — endpoints**:
- `POST /excel/import/comprobantes` — procesa TXT/Excel de Mis Comprobantes AFIP
- `POST /excel/import/sifere` — procesa archivo SIFERE de IIBB
- `POST /excel/import/retenciones` — procesa archivo de Mis Retenciones
- `POST /excel/import/clientes` — carga masiva de clientes desde Excel

**Backend — lógica de importación**:
- Parsear archivo con SheetJS
- Validar estructura del archivo (columnas requeridas)
- Mapear filas a objetos del dominio
- Devolver preview de lo que se va a importar (no guardar todavía)
- El usuario confirma → se guarda en DB con `origenCarga: EXCEL`
- Manejo de duplicados: si ya existe una liquidación para ese período e impuesto → mostrar conflicto

**Backend — endpoints exportación**:
- `GET /excel/export/liquidaciones?clienteId=X&periodo=YYYY-MM`
- `GET /excel/export/tareas?estado=X`
- `GET /excel/export/clientes`
- `GET /excel/export/vencimientos?mes=X`
- `GET /excel/export/honorarios`

**Frontend — vistas**:
- Botón Importar en módulos correspondientes → modal con upload + preview de datos
- Tabla de preview con columnas coloreadas: verde (nuevo), amarillo (actualiza), rojo (conflicto)
- Botón confirmar importación
- Botón Exportar en cada módulo → descarga directa del `.xlsx`

#### 3.2 Módulo Bot Telegram

**Backend — arquitectura**:
- Un bot de Telegram con número propio del estudio
- `nestjs-telegraf` maneja los handlers de mensajes
- Cada colaborador registra su Telegram en su perfil → vincula `telegramChatId`
- El bot solo responde a usuarios registrados en el sistema

**Backend — comandos**:
- `/estado` — resumen de tareas pendientes del colaborador
- `/vencimientos` — lista de vencimientos próximos de sus clientes
- `/completar [nombreTarea]` — marca tarea como completada
- Mensaje de texto libre → procesado con IA (Claude) para detectar intención
- Imagen/foto → OCR con IA para extraer datos de comprobante → pre-cargar liquidación

**Flujo de carga por texto libre**:
```
Colaborador: "IVA García mayo 45230 vence 18/06"
→ Claude interpreta: impuesto=IVA, cliente=García, periodo=2026-05, importe=45230, vencimiento=18/06/2026
→ Bot responde: "¿Confirmar carga? IVA García Mayo $45.230 vence 18/06"
→ Colaborador: "sí"
→ Sistema guarda Liquidacion con origenCarga: BOT
→ Bot responde: "✅ Liquidación cargada correctamente"
```

**Flujo de carga por imagen**:
```
Colaborador envía foto del VEP o comprobante
→ Claude Vision extrae: tipo impuesto, CUIT, importe, fecha
→ Bot muestra preview con los datos extraídos
→ Colaborador confirma o corrige
→ Sistema guarda con origenCarga: BOT
```

**Frontend — vistas**:
- Perfil de usuario: campo para vincular cuenta de Telegram (con instrucciones paso a paso)
- Panel de admin (SOCIO): lista de usuarios con estado de vinculación Telegram

> 🔑 Al terminar Etapa 3: el sistema importa y exporta Excel, y el bot de Telegram permite carga rápida desde el celular.

---

### ETAPA 4 — Dashboard, Métricas y Panel Financiero

**Objetivo**: visibilidad completa del estudio para los socios.

#### 4.1 Dashboard Home

**Backend — endpoints**:
- `GET /dashboard/metricas` — datos del header: total clientes, pendientes, urgentes, alertas
- `GET /dashboard/semaforos` — distribución verde/amarillo/rojo de la cartera
- `GET /dashboard/tareas-por-colaborador` — carga de trabajo del equipo
- `GET /dashboard/vencimientos-semana` — próximos 7 días consolidado

**Frontend — vistas**:
- Header global: clientes totales, pendientes, urgentes, alertas
- Cards con métricas: tareas por estado, distribución de semáforos
- Gráfico de carga por colaborador (barras con Recharts)
- Lista de vencimientos próximos con acceso rápido

#### 4.2 Semáforo de salud del cliente

- **VERDE**: no hay tareas vencidas, todas las liquidaciones del período cargadas
- **AMARILLO**: hay tareas próximas a vencer (menos de 5 días) o falta alguna liquidación
- **ROJO**: hay tareas vencidas sin completar o liquidaciones del período sin cargar
- Recalculado automáticamente por cron job diario y al completar/cargar cualquier tarea o liquidación

#### 4.3 Panel financiero del estudio

**Backend — endpoints**:
- `GET /financiero/honorarios?periodo=YYYY-MM` — honorarios por cliente del período
- `GET /financiero/rentabilidad` — honorario vs tiempo estimado por cliente
- `GET /financiero/proyeccion` — ingresos proyectados del mes basados en clientes activos

**Frontend — vistas**:
- Tabla de honorarios: cliente, honorario mensual, tiempo estimado, ratio
- Gráfico de rentabilidad por cliente (solo SOCIO)
- Proyección de ingresos del mes

> 🔑 Al terminar Etapa 4: el sistema está completo para uso en producción real.

---

### ETAPA 5 — Google Calendar y Portal del Cliente (Fase Futura)

#### 5.1 Sincronización Google Calendar
- OAuth2 por usuario: cada colaborador autoriza acceso a su Google Calendar
- Tokens guardados en `usuario.googleTokens` (encriptado)
- Job BullMQ cada 30 minutos: importa eventos del Google Calendar personal
- Eventos importados con origen: GOOGLE, no modificables desde el sistema
- Si el evento se elimina en Google → desaparece en el sistema
- Solo lectura: el sistema no escribe en Google Calendar

#### 5.2 Portal del Cliente
- Ruta separada: `/portal/:token` — acceso sin login del estudio
- Token único por cliente, generado y enviado por email desde el sistema
- El cliente ve: sus vencimientos próximos, historial de liquidaciones, archivos compartidos
- Botón de contacto → abre email al estudio
- Solo lectura, sin edición posible

---

## 6. Convenciones de Código

> Para convenciones exhaustivas de código, ver `AGENTS.md` (raíz), `apps/api/AGENTS.md` y `apps/web/AGENTS.md`.

### 6.1 Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos y carpetas | kebab-case | `clientes.service.ts`, `panel-tareas.tsx` |
| Clases y tipos | PascalCase | `ClienteService`, `LiquidacionDto` |
| Variables y funciones | camelCase | `obtenerClientes()`, `encargadoId` |
| Constantes | UPPER_SNAKE_CASE | `MAX_INTENTOS_LOGIN` |
| Enums Prisma | UPPER_SNAKE_CASE | `A_PAGAR`, `SALDO_A_FAVOR` |
| Rutas API | kebab-case plural | `/email-templates`, `/agenda-items` |
| Períodos | String `YYYY-MM` | `'2026-05'` |

### 6.2 Formato de respuestas API

```json
// Éxito con lista
{ "data": [...], "meta": { "total": 50, "pagina": 1, "porPagina": 20 } }

// Éxito con objeto
{ "data": { "id": 1, "nombre": "García" } }

// Error
{ "error": "CLIENTE_NO_ENCONTRADO", "mensaje": "El cliente con id 5 no existe", "status": 404 }
```

### 6.3 Manejo de fechas

- Siempre guardar en UTC en PostgreSQL
- Convertir a `America/Argentina/Buenos_Aires` solo al mostrar en frontend
- Usar `date-fns-tz`: `formatInTimeZone(fecha, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy')`
- Los períodos son siempre strings: `'2026-05'`, nunca objetos Date

### 6.4 Seguridad — checklist en cada endpoint nuevo

- [ ] ¿Tiene `@UseGuards(JwtAuthGuard)`?
- [ ] ¿Tiene `@AllowedRoles([...])` si es solo para SOCIO?
- [ ] ¿El DTO tiene `class-validator` en todos los campos?
- [ ] ¿Un COLABORADOR podría acceder a datos de otro colaborador? → filtrar por `usuarioId`
- [ ] ¿Hay rate limiting si es un endpoint sensible?

---

## 7. Variables de Entorno

```env
# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/gestionpro

# JWT
JWT_SECRET=<string aleatorio min 64 chars>
JWT_REFRESH_SECRET=<string aleatorio diferente min 64 chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
EMAIL_FROM=noreply@estudiobb.com.ar

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=gestionpro-files
R2_PUBLIC_URL=https://files.estudiobb.com.ar

# Telegram
TELEGRAM_BOT_TOKEN=

# Anthropic (IA para bot y OCR)
ANTHROPIC_API_KEY=

# Google Calendar (fase futura)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Sentry
SENTRY_DSN=
```

---

## 8. Estado de Módulos

> Esta tabla es la fuente de verdad del progreso. Actualizarla al terminar cada módulo o tarea significativa.

| Etapa | Módulo | Estado | Notas |
|-------|--------|--------|-------|
| 0 | Monorepo | ✅ Completo | Turborepo + pnpm, apps/api y apps/web |
| 0 | Auth backend | ✅ Completo | JWT access 15min + refresh 7d rotativo, RBAC SOCIO/COLABORADOR |
| 0 | Login frontend | ✅ Completo | User picker con emoji, Zustand store, Axios interceptor |
| 1 | Clientes | ✅ Completo | CRUD, legajo, AFIP lookup, semáforo real (tareas vencidas/próximas) |
| 1 | Tareas | ✅ Completo | CRUD, filtros, completar, tabla interactiva frontend |
| 1 | Vencimientos | ✅ Completo | CalendarioVencimiento CRUD, cálculo por CUIT, carga admin |
| 1 | Liquidaciones | ✅ Completo | CRUD, historial, auto-cálculo importeRef, tabla frontend básica |
| 2 | Agenda | ✅ Completo | CRUD, vista personal + equipo admin |
| 2 | Notificaciones | ✅ Completo | CRUD, no leídas, marcar todas |
| 2 | Email/Templates | ✅ Completo | CRUD templates con variables {{cliente}} |
| 2 | Documentos | ✅ Completo | Modelo Archivo CRUD, upload local (sin R2 — externo) |
| 3 | Excel Import | ✅ Completo | Import clientes, comprobantes vía SheetJS + multer |
| 3 | Excel Export | ✅ Completo | Export clientes, tareas, liquidaciones, vencimientos a .xlsx |
| 3 | Bot Telegram | ⬛ Bloqueado | Sin conexiones externas por ahora |
| 4 | Dashboard | ✅ Completo | Métricas, semáforos (pie), carga colaborador (bar), vencimientos 7d |
| 4 | Semáforo | ✅ Completo | Lógica real: VERDE/AMARILLO/ROJO según tareas vencidas |
| 4 | Panel Financiero | ✅ Completo | Honorarios, rentabilidad, proyección (SOCIO only) |
| 5 | Google Calendar | ⬜ Futuro | — |
| 5 | Portal Cliente | ⬜ Futuro | — |

Leyenda: ⬜ Pendiente · 🔄 En desarrollo · ✅ Completo · 🔁 En revisión · ⬛ Bloqueado

---

## 9. Bloque de Contexto — Pegar al Inicio de Cada Sesión

```
=== CONTEXTO DEL PROYECTO ===
Sistema: Gestión interna para Estudio BB (estudio contable argentino)
Stack frontend: Next.js 16 + TypeScript + shadcn/ui + TanStack + Zustand + FullCalendar
Stack backend: NestJS 11 + TypeScript + Prisma + PostgreSQL + Redis + BullMQ
Storage: Cloudflare R2 para archivos, AWS SES para emails
Auth: JWT propio (access 15min + refresh 7d rotativo), RBAC con roles SOCIO/COLABORADOR
Tenant: un único estudio (estudioId=1 fijo), sin multitenancy activo
Convenciones: kebab-case archivos, PascalCase clases, camelCase vars, fechas en UTC
Respuestas API: { data, meta } éxito — { error, mensaje, status } error
Períodos: string 'YYYY-MM' siempre

=== ESTADO ACTUAL ===
Módulos completos: [listar]
Módulo en desarrollo: [indicar cuál]

=== TAREA DE ESTA SESIÓN ===
[Describir exactamente qué hay que hacer]

=== RESTRICCIONES ===
- No usar librerías fuera del stack definido
- No cambiar estructura de carpetas
- No tomar decisiones arquitectónicas sin consultar
- Seguir convenciones de nomenclatura exactas
- Todos los endpoints nuevos con JwtAuthGuard y validación DTO
```

---

*Documento vivo · Versión 1.0 · Mayo 2026 · Actualizar con cada módulo completado*
