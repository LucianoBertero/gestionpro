const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const BLUE = "1E3A5F";
const ACCENT = "2E75B6";
const GREEN = "1A6B3C";
const ORANGE = "C45C00";
const WHITE = "FFFFFF";
const GRAY = "F5F5F5";
const CODE_BG = "F0F4F8";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 1 } },
    children: [new TextRun({ text, font: "Arial", size: 34, bold: true, color: BLUE })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: ACCENT })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: "333333" })]
  });
}

function h4(text) {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 20, bold: true, color: GREEN })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: "333333", ...opts })]
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 560 },
    shading: { fill: CODE_BG, type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Courier New", size: 17, color: "1A1A1A" })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 50, after: 50 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: "333333", bold })]
  });
}

function subbullet(text) {
  return new Paragraph({
    numbering: { reference: "subbullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 19, color: "555555" })]
  });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun("")] })
  );
}

function note(text, color = "1E3A5F", bg = "EAF4FB", borderColor = ACCENT) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 14, color: borderColor, space: 10 } },
    shading: { fill: bg, type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Arial", size: 19, color, italics: true })]
  });
}

function warn(text) {
  return note(`⚠️  ${text}`, "7A3F00", "FFF3E0", "CC6600");
}

function important(text) {
  return note(`🔑 ${text}`, GREEN, "E8F5E9", GREEN);
}

function tag(text) {
  return new TextRun({ text: ` [${text}] `, font: "Arial", size: 18, bold: true, color: WHITE,
    shading: { fill: ACCENT, type: ShadingType.CLEAR } });
}

function headerRow(cells, widths) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text, i) =>
      new TableCell({
        borders, width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: WHITE })]
        })]
      })
    )
  });
}

function dataRow(cells, widths, shade = false) {
  return new TableRow({
    children: cells.map((text, i) =>
      new TableCell({
        borders, width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: shade ? GRAY : WHITE, type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 140, right: 140 },
        children: [new Paragraph({
          children: [new TextRun({ text: String(text), font: "Arial", size: 18, color: "333333" })]
        })]
      })
    )
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD", space: 1 } },
    children: [new TextRun("")]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── DOCUMENT ───────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "subbullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "◦",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 34, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1300, right: 1300, bottom: 1300, left: 1300 }
      }
    },
    children: [

      // ── PORTADA ──────────────────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 1800, after: 200 },
        children: [new TextRun({ text: "CONTEXTO TÉCNICO PARA IA", font: "Arial", size: 56, bold: true, color: BLUE })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: "Sistema de Gestión — Estudio BB", font: "Arial", size: 28, color: ACCENT })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 600, after: 100 },
        children: [new TextRun({ text: "Documento vivo · Versión 1.0 · Mayo 2026", font: "Arial", size: 20, color: "888888", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 60 },
        children: [new TextRun({ text: "Leer completo antes de generar cualquier código", font: "Arial", size: 20, bold: true, color: ORANGE })]
      }),
      pageBreak(),

      // ── SECCIÓN 0: INSTRUCCIONES PARA LA IA ─────────────────────────────
      h1("0. Instrucciones para la IA"),
      note("Este documento es el contexto completo del proyecto. Leelo íntegro antes de escribir una sola línea de código. Cada decisión técnica ya fue tomada — no propongas alternativas salvo que se indique explícitamente."),
      ...spacer(1),
      p("Cómo usar este documento en cada sesión de trabajo:", { bold: true }),
      bullet("Al iniciar una sesión, pegá este documento completo como contexto"),
      bullet("Indicá en qué módulo o tarea específica vas a trabajar"),
      bullet("Seguí el stack, convenciones y estructura definidos. No improvises"),
      bullet("Si algo no está definido acá, preguntá antes de asumir"),
      bullet("Al terminar una tarea, actualizá la tabla de estado del módulo correspondiente"),
      ...spacer(1),
      warn("No uses librerías distintas a las definidas en este documento sin consultar primero. No cambies la estructura de carpetas. No tomes decisiones arquitectónicas por tu cuenta."),

      ...spacer(2),

      // ── SECCIÓN 1: DESCRIPCIÓN DEL SISTEMA ──────────────────────────────
      h1("1. Descripción del Sistema"),
      h2("1.1 Qué es"),
      p("Sistema de gestión interna para Estudio BB, un estudio contable argentino. Centraliza la administración de clientes, tareas, agenda, liquidaciones impositivas y comunicaciones del equipo. Es una aplicación web con backend API REST y frontend tipo dashboard administrativo."),
      ...spacer(1),
      h2("1.2 Usuarios del sistema"),
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [2000, 2500, 4860],
        rows: [
          headerRow(["Rol", "Cantidad", "Acceso"], [2000, 2500, 4860]),
          dataRow(["SOCIO", "2 (Anto y Lau)", "Vista completa: todos los clientes, todos los colaboradores, métricas globales, gestión de usuarios"], [2000, 2500, 4860], false),
          dataRow(["COLABORADOR", "3-8 (Ernesto, Jesi, etc.)", "Solo sus clientes asignados, sus tareas, su agenda personal"], [2000, 2500, 4860], true),
        ]
      }),
      ...spacer(1),
      h2("1.3 Escala actual"),
      bullet("50 a 150 clientes activos"),
      bullet("5 a 10 usuarios simultáneos"),
      bullet("Un solo tenant (un único estudio) — no es SaaS multitenant en esta versión"),
      bullet("El campo estudioId existe en todos los modelos con valor fijo 1, preparado para multitenancy futuro"),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 2: STACK TECNOLÓGICO ─────────────────────────────────────
      h1("2. Stack Tecnológico — Definitivo y No Negociable"),
      note("Este es el stack definido. No sugerir alternativas. No agregar librerías fuera de las listadas sin aprobación explícita."),
      ...spacer(1),

      h2("2.1 Frontend"),
      p("Template base: github.com/Kiranism/next-shadcn-dashboard-starter", { bold: true }),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [2400, 2000, 4960],
        rows: [
          headerRow(["Tecnología", "Versión", "Rol en el proyecto"], [2400, 2000, 4960]),
          dataRow(["Next.js", "16 (App Router)", "Framework principal, SSR, rutas, server components"], [2400, 2000, 4960], false),
          dataRow(["TypeScript", "5.x strict mode", "Tipado estricto en todo el proyecto"], [2400, 2000, 4960], true),
          dataRow(["Tailwind CSS", "v4", "Estilos utilitarios"], [2400, 2000, 4960], false),
          dataRow(["shadcn/ui", "latest", "Componentes base: tablas, forms, modales, badges, selects"], [2400, 2000, 4960], true),
          dataRow(["TanStack Table", "v8", "Tablas con sort, filter, paginación server-side"], [2400, 2000, 4960], false),
          dataRow(["TanStack Form", "latest", "Formularios con validación"], [2400, 2000, 4960], true),
          dataRow(["React Query", "v5", "Fetching, cache e invalidación de datos"], [2400, 2000, 4960], false),
          dataRow(["Zod", "latest", "Validación de schemas, compartido con backend"], [2400, 2000, 4960], true),
          dataRow(["Zustand", "latest", "Estado global: usuario logueado, filtros activos"], [2400, 2000, 4960], false),
          dataRow(["FullCalendar", "latest", "Vista de calendario semanal y de equipo"], [2400, 2000, 4960], true),
          dataRow(["Recharts", "latest", "Gráficos del dashboard"], [2400, 2000, 4960], false),
          dataRow(["Lucide React", "latest", "Iconografía consistente"], [2400, 2000, 4960], true),
          dataRow(["Axios", "latest", "Cliente HTTP hacia el backend"], [2400, 2000, 4960], false),
          dataRow(["date-fns + date-fns-tz", "latest", "Fechas y conversión a zona horaria Argentina"], [2400, 2000, 4960], true),
          dataRow(["xlsx (SheetJS)", "latest", "Import/export de archivos Excel en el cliente"], [2400, 2000, 4960], false),
        ]
      }),
      ...spacer(1),

      h2("2.2 Backend"),
      p("Template base: github.com/hmake98/nestjs-starter", { bold: true }),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [2400, 2000, 4960],
        rows: [
          headerRow(["Tecnología", "Versión", "Rol en el proyecto"], [2400, 2000, 4960]),
          dataRow(["NestJS", "11.x", "Framework principal, arquitectura modular"], [2400, 2000, 4960], false),
          dataRow(["TypeScript", "5.x strict mode", "Tipado estricto"], [2400, 2000, 4960], true),
          dataRow(["Prisma", "7.x", "ORM, migraciones, schema de DB"], [2400, 2000, 4960], false),
          dataRow(["PostgreSQL", "15", "Base de datos principal"], [2400, 2000, 4960], true),
          dataRow(["Redis", "7.x", "Cache, sesiones, cola de jobs"], [2400, 2000, 4960], false),
          dataRow(["BullMQ", "latest", "Jobs asincrónicos: emails, alertas, sync Telegram"], [2400, 2000, 4960], true),
          dataRow(["JWT propio", "—", "Access token 15min + refresh token 7 días rotativo"], [2400, 2000, 4960], false),
          dataRow(["argon2", "latest", "Hash de contraseñas"], [2400, 2000, 4960], true),
          dataRow(["class-validator", "latest", "Validación de DTOs en todos los endpoints"], [2400, 2000, 4960], false),
          dataRow(["nestjs-pino", "latest", "Logging estructurado con correlation IDs"], [2400, 2000, 4960], true),
          dataRow(["@nestjs/throttler", "latest", "Rate limiting por IP y por usuario"], [2400, 2000, 4960], false),
          dataRow(["@nestjs/schedule", "latest", "Cron jobs: alertas diarias, sync Google Calendar"], [2400, 2000, 4960], true),
          dataRow(["@aws-sdk/client-ses", "latest", "Envío de emails transaccionales"], [2400, 2000, 4960], false),
          dataRow(["nestjs-telegraf", "latest", "Bot de Telegram"], [2400, 2000, 4960], true),
          dataRow(["xlsx (SheetJS)", "latest", "Procesamiento de archivos Excel en el servidor"], [2400, 2000, 4960], false),
          dataRow(["multer", "latest", "Upload de archivos (Excel, imágenes de comprobantes)"], [2400, 2000, 4960], true),
          dataRow(["Swagger / OpenAPI", "latest", "Documentación automática de endpoints"], [2400, 2000, 4960], false),
          dataRow(["Helmet", "latest", "Headers de seguridad HTTP"], [2400, 2000, 4960], true),
          dataRow(["Sentry", "latest", "Monitoreo de errores en producción"], [2400, 2000, 4960], false),
        ]
      }),
      ...spacer(1),

      h2("2.3 Storage y servicios externos"),
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [2400, 2400, 4560],
        rows: [
          headerRow(["Servicio", "Proveedor", "Uso"], [2400, 2400, 4560]),
          dataRow(["Base de datos", "PostgreSQL (Railway)", "Datos del sistema"], [2400, 2400, 4560], false),
          dataRow(["Cache / Queue", "Redis (Railway)", "Sesiones, BullMQ jobs"], [2400, 2400, 4560], true),
          dataRow(["Storage de archivos", "Cloudflare R2", "Documentos de clientes, comprobantes, exports"], [2400, 2400, 4560], false),
          dataRow(["Email", "AWS SES", "Notificaciones, recordatorios, templates"], [2400, 2400, 4560], true),
          dataRow(["Mensajería", "Telegram Bot API", "Bot de carga rápida para colaboradores"], [2400, 2400, 4560], false),
          dataRow(["Calendario externo", "Google Calendar API", "Sync de eventos personales (fase 2)"], [2400, 2400, 4560], true),
          dataRow(["AFIP Padrón", "API pública AFIP", "Autocompletado de datos por CUIT"], [2400, 2400, 4560], false),
          dataRow(["IA / OCR", "Anthropic API (claude-sonnet-4-20250514)", "Procesamiento de comprobantes, bot Telegram"], [2400, 2400, 4560], true),
        ]
      }),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 3: ARQUITECTURA ───────────────────────────────────────────
      h1("3. Arquitectura del Proyecto"),

      h2("3.1 Estructura de repositorio"),
      code("gestionpro/                    ← raíz del monorepo"),
      code("├── apps/"),
      code("│   ├── api/                   ← Backend NestJS (hmake98 como base)"),
      code("│   └── web/                   ← Frontend Next.js (Kiranism como base)"),
      code("├── packages/"),
      code("│   └── types/                 ← Tipos TypeScript compartidos frontend/backend"),
      code("├── docker-compose.yml         ← PostgreSQL + Redis en desarrollo local"),
      code("├── turbo.json"),
      code("└── package.json"),
      ...spacer(1),

      h2("3.2 Estructura del Backend"),
      code("apps/api/src/"),
      code("├── main.ts"),
      code("├── app.module.ts"),
      code("├── prisma/                    ← PrismaService"),
      code("├── auth/                      ← JWT, guards, decorators"),
      code("├── usuarios/"),
      code("├── clientes/"),
      code("├── tareas/"),
      code("├── agenda/"),
      code("├── liquidaciones/"),
      code("├── vencimientos/"),
      code("├── notificaciones/            ← Email + in-app"),
      code("├── telegram/                  ← Bot handler"),
      code("├── excel/                     ← Import/export"),
      code("├── storage/                   ← Cloudflare R2"),
      code("├── afip/                      ← Padrón + calendario vencimientos"),
      code("└── workers/                   ← BullMQ jobs"),
      ...spacer(1),

      h2("3.3 Estructura del Frontend"),
      code("apps/web/src/"),
      code("├── app/"),
      code("│   ├── (auth)/login/"),
      code("│   └── (dashboard)/"),
      code("│       ├── layout.tsx         ← Sidebar + Header global"),
      code("│       ├── page.tsx           ← Dashboard home con métricas"),
      code("│       ├── clientes/"),
      code("│       ├── tareas/"),
      code("│       ├── agenda/"),
      code("│       ├── liquidaciones/"),
      code("│       ├── vencimientos/"),
      code("│       └── alertas/"),
      code("├── components/"),
      code("│   ├── ui/                    ← shadcn/ui (no modificar)"),
      code("│   └── shared/                ← Componentes propios reutilizables"),
      code("├── lib/"),
      code("│   ├── api.ts                 ← Cliente axios con interceptors JWT"),
      code("│   └── auth.ts                ← Helpers de sesión"),
      code("└── types/                     ← Re-exporta desde packages/types"),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 4: MODELO DE DATOS ────────────────────────────────────────
      h1("4. Modelo de Datos — Prisma Schema Completo"),
      note("Todos los modelos tienen estudioId con default 1. No se usa para filtrar hoy pero está preparado para multitenancy. Las fechas se guardan en UTC siempre."),
      ...spacer(1),

      h2("4.1 Enums"),
      code("enum Rol              { SOCIO COLABORADOR }"),
      code("enum TipoImpuesto     { AUTONOMOS IVA IIBB_LOCAL MUNICIPAL SUELDOS MONOTRIBUTO GANANCIAS }"),
      code("enum TipoTarea        { DDJJ VEP INTERNA BALANCE OTRO }"),
      code("enum Prioridad        { ALTA MEDIA BAJA }"),
      code("enum EstadoTarea      { PENDIENTE EN_PROCESO COMPLETADA CANCELADA }"),
      code("enum ResultadoLiq     { A_PAGAR SALDO_A_FAVOR SIN_MOVIMIENTO }"),
      code("enum TipoEvento       { TAREA ESTUDIO PERSONAL }"),
      code("enum OrigenEvento     { SISTEMA MANUAL GOOGLE }"),
      code("enum TipoTemplate     { VENCIMIENTO LIQUIDACION RECORDATORIO GENERAL }"),
      code("enum EstadoSemaforo   { VERDE AMARILLO ROJO }"),
      code("enum TipoNotificacion { VENCIMIENTO TAREA SISTEMA }"),
      code("enum TipoArchivo      { COMPROBANTE DDJJ CONTRATO OTRO }"),
      ...spacer(1),

      h2("4.2 Modelos principales"),

      h3("Usuario"),
      code("model Usuario {"),
      code("  id             Int       @id @default(autoincrement())"),
      code("  estudioId      Int       @default(1)"),
      code("  nombre         String"),
      code("  email          String    @unique"),
      code("  password       String                    // argon2 hash"),
      code("  rol            Rol       @default(COLABORADOR)"),
      code("  emoji          String?                   // avatar emoji del selector"),
      code("  telefono       String?"),
      code("  telegramChatId String?                   // para bot Telegram"),
      code("  googleTokens   Json?                     // OAuth tokens Google Calendar"),
      code("  activo         Boolean   @default(true)"),
      code("  creadoEn       DateTime  @default(now())"),
      code("  tareas         Tarea[]   @relation('Encargado')"),
      code("  agendaItems    AgendaItem[]"),
      code("  notificaciones Notificacion[]"),
      code("  refreshTokens  RefreshToken[]"),
      code("}"),
      ...spacer(1),

      h3("Cliente"),
      code("model Cliente {"),
      code("  id             Int               @id @default(autoincrement())"),
      code("  estudioId      Int               @default(1)"),
      code("  cuit           String            @unique"),
      code("  denominacion   String"),
      code("  termino        Int               @default(0)   // 0, 3, 6"),
      code("  condicionIva   String"),
      code("  actividades    String[]"),
      code("  domicilio      String?"),
      code("  telefono       String?"),
      code("  email          String?"),
      code("  whatsapp       String?"),
      code("  encargadoId    Int"),
      code("  supervisorId   Int?"),
      code("  semaforo       EstadoSemaforo    @default(VERDE)"),
      code("  activo         Boolean           @default(true)"),
      code("  notas          String?"),
      code("  creadoEn       DateTime          @default(now())"),
      code("  encargado      Usuario           @relation('Encargado', fields: [encargadoId], references: [id])"),
      code("  impuestos      ClienteImpuesto[]"),
      code("  tareas         Tarea[]"),
      code("  liquidaciones  Liquidacion[]"),
      code("  archivos       Archivo[]"),
      code("  comunicaciones Comunicacion[]"),
      code("}"),
      ...spacer(1),

      h3("ClienteImpuesto"),
      code("model ClienteImpuesto {"),
      code("  id         Int          @id @default(autoincrement())"),
      code("  clienteId  Int"),
      code("  tipo       TipoImpuesto"),
      code("  activo     Boolean      @default(true)"),
      code("  cliente    Cliente      @relation(fields: [clienteId], references: [id])"),
      code("}"),
      ...spacer(1),

      h3("Tarea"),
      code("model Tarea {"),
      code("  id            Int          @id @default(autoincrement())"),
      code("  estudioId     Int          @default(1)"),
      code("  clienteId     Int?"),
      code("  encargadoId   Int"),
      code("  titulo        String"),
      code("  descripcion   String?"),
      code("  tipo          TipoTarea"),
      code("  impuesto      TipoImpuesto?"),
      code("  periodo       String?                    // '2026-05'"),
      code("  tiempoEstMin  Int?                       // minutos estimados"),
      code("  prioridad     Prioridad    @default(MEDIA)"),
      code("  estado        EstadoTarea  @default(PENDIENTE)"),
      code("  vence         DateTime?"),
      code("  esRecurrente  Boolean      @default(false)"),
      code("  reglaRecur    Json?                      // config de recurrencia"),
      code("  notas         String?"),
      code("  creadoEn      DateTime     @default(now())"),
      code("  cliente       Cliente?     @relation(fields: [clienteId], references: [id])"),
      code("  encargado     Usuario      @relation('Encargado', fields: [encargadoId], references: [id])"),
      code("  agendaItems   AgendaItem[]"),
      code("}"),
      ...spacer(1),

      h3("Liquidacion"),
      code("model Liquidacion {"),
      code("  id            Int           @id @default(autoincrement())"),
      code("  estudioId     Int           @default(1)"),
      code("  clienteId     Int"),
      code("  impuesto      TipoImpuesto"),
      code("  periodo       String                     // '2026-05'"),
      code("  resultado     ResultadoLiq"),
      code("  importe       Decimal?      @db.Decimal(12, 2)"),
      code("  importeRef    Decimal?      @db.Decimal(12, 2)  // importe período anterior"),
      code("  vencimiento   DateTime?"),
      code("  formaPago     String?                    // VEP, débito, etc."),
      code("  comprobante   String?                    // URL en R2"),
      code("  cargadoPorId  Int"),
      code("  origenCarga   String        @default('MANUAL')  // MANUAL | BOT | EXCEL"),
      code("  creadoEn      DateTime      @default(now())"),
      code("  cliente       Cliente       @relation(fields: [clienteId], references: [id])"),
      code("}"),
      ...spacer(1),

      h3("AgendaItem"),
      code("model AgendaItem {"),
      code("  id             Int          @id @default(autoincrement())"),
      code("  usuarioId      Int"),
      code("  tareaId        Int?"),
      code("  titulo         String"),
      code("  descripcion    String?"),
      code("  fecha          DateTime"),
      code("  duracionMin    Int"),
      code("  tipo           TipoEvento   @default(PERSONAL)"),
      code("  origen         OrigenEvento @default(MANUAL)"),
      code("  googleEventId  String?"),
      code("  esEstudio      Boolean      @default(false)   // visible para todos"),
      code("  creadoEn       DateTime     @default(now())"),
      code("  usuario        Usuario      @relation(fields: [usuarioId], references: [id])"),
      code("  tarea          Tarea?       @relation(fields: [tareaId], references: [id])"),
      code("}"),
      ...spacer(1),

      h3("CalendarioVencimiento"),
      code("model CalendarioVencimiento {"),
      code("  id          Int          @id @default(autoincrement())"),
      code("  impuesto    TipoImpuesto"),
      code("  anio        Int"),
      code("  mes         Int          // 1-12"),
      code("  digitoCuit  Int          // 0-9"),
      code("  fechaVence  DateTime"),
      code("  @@unique([impuesto, anio, mes, digitoCuit])"),
      code("}"),
      ...spacer(1),

      h3("Notificacion"),
      code("model Notificacion {"),
      code("  id         Int               @id @default(autoincrement())"),
      code("  usuarioId  Int"),
      code("  tipo       TipoNotificacion"),
      code("  titulo     String"),
      code("  mensaje    String"),
      code("  leida      Boolean           @default(false)"),
      code("  enlace     String?           // ruta interna de la app"),
      code("  creadoEn   DateTime          @default(now())"),
      code("  usuario    Usuario           @relation(fields: [usuarioId], references: [id])"),
      code("}"),
      ...spacer(1),

      h3("EmailTemplate"),
      code("model EmailTemplate {"),
      code("  id          Int            @id @default(autoincrement())"),
      code("  estudioId   Int            @default(1)"),
      code("  nombre      String"),
      code("  tipo        TipoTemplate"),
      code("  asunto      String         // soporta variables: {{cliente}}, {{impuesto}}, {{fecha}}"),
      code("  cuerpo      String         // HTML con variables"),
      code("  activo      Boolean        @default(true)"),
      code("  creadoEn    DateTime       @default(now())"),
      code("}"),
      ...spacer(1),

      h3("Comunicacion"),
      code("model Comunicacion {"),
      code("  id          Int      @id @default(autoincrement())"),
      code("  clienteId   Int"),
      code("  usuarioId   Int"),
      code("  tipo        String   // EMAIL | WHATSAPP | LLAMADA | NOTA"),
      code("  asunto      String?"),
      code("  contenido   String?"),
      code("  creadoEn    DateTime @default(now())"),
      code("  cliente     Cliente  @relation(fields: [clienteId], references: [id])"),
      code("}"),
      ...spacer(1),

      h3("Archivo"),
      code("model Archivo {"),
      code("  id          Int        @id @default(autoincrement())"),
      code("  clienteId   Int"),
      code("  nombre      String"),
      code("  tipo        TipoArchivo"),
      code("  periodo     String?    // '2026-05'"),
      code("  url         String     // URL en Cloudflare R2"),
      code("  tamanioKb   Int?"),
      code("  subidoPorId Int"),
      code("  creadoEn    DateTime   @default(now())"),
      code("  cliente     Cliente    @relation(fields: [clienteId], references: [id])"),
      code("}"),
      ...spacer(1),

      h3("RefreshToken"),
      code("model RefreshToken {"),
      code("  id         Int      @id @default(autoincrement())"),
      code("  usuarioId  Int"),
      code("  token      String   @unique"),
      code("  expira     DateTime"),
      code("  revocado   Boolean  @default(false)"),
      code("  creadoEn   DateTime @default(now())"),
      code("  usuario    Usuario  @relation(fields: [usuarioId], references: [id])"),
      code("}"),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 5: MÓDULOS POR ETAPA ─────────────────────────────────────
      h1("5. Módulos por Etapa de Desarrollo"),
      note("Desarrollar en el orden exacto de esta sección. Cada módulo depende del anterior. No arrancar un módulo sin tener el anterior funcionando y testeado."),

      ...spacer(1),
      separator(),

      // ETAPA 0
      h2("ETAPA 0 — Fundación (Semana 1)"),
      p("Objetivo: el proyecto base corre localmente y en producción. Sin lógica de negocio todavía.", { bold: true }),
      ...spacer(1),

      h3("0.1 Monorepo"),
      bullet("Inicializar Turborepo con apps/api y apps/web"),
      bullet("Clonar Kiranism en apps/web, limpiar features no necesarias (cleanup script)"),
      bullet("Clonar hmake98 en apps/api"),
      bullet("Configurar docker-compose.yml con PostgreSQL 15 y Redis 7"),
      bullet("Variables de entorno: .env.example completo, .env en .gitignore"),
      ...spacer(1),

      h3("0.2 Auth completo"),
      bullet("Registro de usuario (solo SOCIO puede crear usuarios)"),
      bullet("Login con email/password → access token 15min + refresh token 7 días"),
      bullet("Refresh token rotativo: cada uso genera uno nuevo, invalida el anterior"),
      bullet("Logout: revoca refresh token en DB"),
      bullet("Guard JwtAuthGuard en todos los endpoints protegidos"),
      bullet("Guard RolesGuard con decorator @Roles(Rol.SOCIO)"),
      bullet("Middleware de logging: cada request loguea método, ruta, usuarioId, tiempo"),
      ...spacer(1),

      h3("0.3 Selección de perfil en frontend"),
      bullet("Pantalla de login con selector visual de usuario (como en el mockup)"),
      bullet("Al seleccionar usuario → pide password"),
      bullet("Token guardado en memoria (Zustand) + refresh token en cookie httpOnly"),
      bullet("Interceptor Axios: adjunta token en cada request, refresca si expira"),
      ...spacer(1),
      important("Al terminar esta etapa: login funciona, los roles están activos, el proyecto deployado y con CI/CD básico."),

      separator(),

      // ETAPA 1
      h2("ETAPA 1 — Core de Negocio (Semanas 2 a 7)"),
      p("Objetivo: los módulos principales del estudio funcionando con datos reales.", { bold: true }),
      ...spacer(1),

      h3("1.1 Módulo Clientes"),
      h4("Backend — endpoints"),
      bullet("GET /clientes — lista paginada, filtrable por encargado/estado/semaforo"),
      bullet("GET /clientes/:id — legajo completo con impuestos, tareas recientes, liquidaciones recientes"),
      bullet("POST /clientes — crear cliente"),
      bullet("PATCH /clientes/:id — editar cliente"),
      bullet("DELETE /clientes/:id — soft delete (activo: false)"),
      bullet("GET /clientes/afip/:cuit — consulta padrón AFIP y devuelve datos para autocompletar"),
      ...spacer(1),
      h4("Backend — lógica"),
      bullet("Al crear cliente: configurar ClienteImpuesto según impuestos seleccionados"),
      bullet("Semáforo: calculado en cada consulta según tareas vencidas y liquidaciones faltantes"),
      bullet("Solo SOCIO puede asignar/cambiar encargado y supervisor"),
      bullet("COLABORADOR solo ve clientes donde es encargado"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Tabla de clientes con columnas: denominación, CUIT, encargado, semáforo, impuestos activos"),
      bullet("Filtros: encargado, semáforo, búsqueda por nombre/CUIT"),
      bullet("Botón WhatsApp: wa.me/{whatsapp}?text=... abre en nueva pestaña"),
      bullet("Botón Email: mailto:{email}?subject=... abre cliente de correo"),
      bullet("Legajo del cliente: tabs Resumen / Tareas / Liquidaciones / Archivos / Comunicaciones / Notas"),
      bullet("Al ingresar CUIT en formulario nuevo → llama a /clientes/afip/:cuit → autocompleta campos"),
      ...spacer(1),

      h3("1.2 Módulo Tareas"),
      h4("Backend — endpoints"),
      bullet("GET /tareas — lista con filtros: encargado, estado, prioridad, cliente, vencimiento"),
      bullet("POST /tareas — crear tarea"),
      bullet("PATCH /tareas/:id — actualizar estado, encargado, prioridad"),
      bullet("DELETE /tareas/:id — soft delete"),
      bullet("POST /tareas/:id/completar — marca como COMPLETADA y dispara notificación"),
      ...spacer(1),
      h4("Backend — lógica"),
      bullet("Al vencer una tarea: cron job diario actualiza prioridad a ALTA automáticamente"),
      bullet("Tareas recurrentes: campo esRecurrente + reglaRecur (JSON con frecuencia, día, etc.)"),
      bullet("Cron job mensual: crea tareas recurrentes del próximo período para todos los clientes"),
      bullet("Al crear tarea con vencimiento: crear AgendaItem automáticamente para el encargado"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Panel de Tareas: tabla con columnas cliente, tema, tipo, encargado, tiempo, prioridad, estado, vence"),
      bullet("Filtros combinables: encargado, estado, prioridad, cliente"),
      bullet("Indicador visual de vencimiento: verde > 7 días, naranja 1-7 días, rojo vencida"),
      bullet("Cambio de estado inline en la tabla (select directo)"),
      bullet("Modal de nueva tarea con todos los campos"),
      ...spacer(1),

      h3("1.3 Módulo Vencimientos"),
      h4("Backend — lógica"),
      bullet("Tabla CalendarioVencimiento: cargada manualmente una vez por año con los datos de AFIP"),
      bullet("Endpoint GET /vencimientos/calcular?cuit=X&impuesto=Y&mes=Z → devuelve fecha exacta"),
      bullet("Al crear liquidación: calcula automáticamente la fecha de vencimiento por CUIT y asigna"),
      bullet("Endpoint GET /vencimientos/proximos?dias=7 → tareas que vencen en los próximos N días"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Vista de vencimientos: lista ordenada por fecha, agrupada por semana"),
      bullet("Indicador visual: días restantes, quién es el encargado"),
      bullet("Filtro por impuesto y encargado"),
      ...spacer(1),

      h3("1.4 Módulo Liquidaciones"),
      h4("Backend — endpoints"),
      bullet("GET /liquidaciones?clienteId=X&periodo=YYYY-MM — liquidaciones del período"),
      bullet("POST /liquidaciones — cargar liquidación manual"),
      bullet("PATCH /liquidaciones/:id — corregir liquidación existente"),
      bullet("GET /liquidaciones/:clienteId/historial — últimos 12 períodos"),
      ...spacer(1),
      h4("Backend — lógica"),
      bullet("Al cargar liquidación: guardar importeRef con el importe del período anterior"),
      bullet("Alerta de inconsistencia: si importe > 3x el promedio de los últimos 6 meses → notificación"),
      bullet("Al completar todas las liquidaciones del período de un cliente → semáforo pasa a VERDE"),
      bullet("origenCarga: MANUAL | BOT | EXCEL — para auditoría"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Pantalla de carga de liquidación: tabla con una fila por impuesto activo del cliente"),
      bullet("Columnas: impuesto, resultado (select), importe, vencimiento (auto calculado), forma de pago"),
      bullet("Mostrar importe del período anterior como referencia en cada fila"),
      bullet("Selector de período (mes/año) en el header de la pantalla"),
      ...spacer(1),
      important("Al terminar Etapa 1: el estudio puede operar completamente. Clientes, tareas, vencimientos y liquidaciones funcionando."),

      separator(),

      // ETAPA 2
      h2("ETAPA 2 — Agenda y Comunicaciones (Semanas 8 a 11)"),
      p("Objetivo: agenda del equipo, notificaciones automáticas, email y comunicaciones.", { bold: true }),
      ...spacer(1),

      h3("2.1 Módulo Agenda"),
      h4("Backend — endpoints"),
      bullet("GET /agenda?usuarioId=X&semana=YYYY-WW — agenda semanal de un usuario"),
      bullet("GET /agenda/equipo?semana=YYYY-WW — todos los usuarios (solo SOCIO)"),
      bullet("POST /agenda — crear evento personal o del estudio"),
      bullet("PATCH /agenda/:id — editar evento"),
      bullet("DELETE /agenda/:id — eliminar evento"),
      bullet("GET /agenda/:usuarioId/ical — feed iCal para suscribir en Google/Apple Calendar"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Vista Personal: FullCalendar en modo semana, muestra tareas + eventos del estudio + personales"),
      bullet("Vista de Equipo (SOCIO): FullCalendar Resource View — una columna por colaborador"),
      bullet("Colores: tareas del sistema (según prioridad), eventos estudio (azul), personales (gris)"),
      bullet("Click en tarea del calendario → abre detalle de la tarea"),
      bullet("Drag & drop para mover eventos personales entre días"),
      bullet("Botón de copiar URL del feed iCal personal"),
      ...spacer(1),

      h3("2.2 Módulo Notificaciones y Alertas"),
      h4("Backend — jobs BullMQ"),
      bullet("Job diario 08:00hs: revisar vencimientos próximos (1, 3, 7 días) → crear Notificacion + enviar email"),
      bullet("Job diario 08:00hs: revisar tareas vencidas sin completar → alerta al encargado y al socio"),
      bullet("Job diario: detectar clientes sin actividad en los últimos 45 días → alerta al socio"),
      bullet("Job al cargar liquidación: detectar inconsistencias vs histórico → notificación inmediata"),
      bullet("Job al completar tarea: actualizar semáforo del cliente"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Centro de notificaciones: campana en header con badge de no leídas"),
      bullet("Panel de notificaciones: lista con tipo, mensaje, fecha y enlace directo al recurso"),
      bullet("Marcar como leída al hacer click"),
      bullet("Filtro por tipo (vencimiento, tarea, sistema)"),
      ...spacer(1),

      h3("2.3 Módulo Email y Templates"),
      h4("Backend — endpoints"),
      bullet("GET /email-templates — lista de templates del estudio"),
      bullet("POST /email-templates — crear template con variables {{variable}}"),
      bullet("PATCH /email-templates/:id — editar template"),
      bullet("POST /email/enviar — envía email usando template + datos del cliente"),
      bullet("POST /email/enviar-masivo — envía a múltiples clientes (con lista de clienteIds)"),
      ...spacer(1),
      h4("Backend — lógica"),
      bullet("Variables disponibles en templates: {{cliente}}, {{cuit}}, {{impuesto}}, {{importe}}, {{fecha}}, {{encargado}}"),
      bullet("Envío via AWS SES con dominio del estudio configurado"),
      bullet("Al enviar email: crear registro en Comunicacion automáticamente"),
      bullet("Envío masivo: procesado como job BullMQ, no bloquea el request"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Gestor de templates: lista, editor con preview en tiempo real"),
      bullet("Modal de envío: selector de template, preview renderizado con datos del cliente, botón enviar"),
      bullet("Disponible desde el legajo del cliente y desde el panel de vencimientos"),
      ...spacer(1),

      h3("2.4 Módulo Gestión Documental"),
      h4("Backend — endpoints"),
      bullet("POST /archivos/upload — sube archivo a Cloudflare R2, guarda metadata en DB"),
      bullet("GET /archivos?clienteId=X — lista de archivos del cliente"),
      bullet("GET /archivos/:id/url — genera URL firmada temporal de descarga (15 min)"),
      bullet("DELETE /archivos/:id — elimina de R2 y de DB"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Tab Archivos en legajo del cliente: lista con nombre, tipo, período, fecha, tamaño"),
      bullet("Upload con drag & drop o selector"),
      bullet("Descarga directa via URL firmada"),
      bullet("Filtro por tipo y período"),
      ...spacer(1),
      important("Al terminar Etapa 2: agenda del equipo operativa, alertas automáticas funcionando, emails enviándose desde el sistema."),

      separator(),

      // ETAPA 3
      h2("ETAPA 3 — Excel y Bot Telegram (Semanas 12 a 15)"),
      p("Objetivo: el sistema procesa archivos externos y recibe comandos por Telegram.", { bold: true }),
      ...spacer(1),

      h3("3.1 Módulo Excel — Importación"),
      h4("Backend — endpoints"),
      bullet("POST /excel/import/comprobantes — procesa TXT/Excel de Mis Comprobantes AFIP"),
      bullet("POST /excel/import/sifere — procesa archivo SIFERE de IIBB"),
      bullet("POST /excel/import/retenciones — procesa archivo de Mis Retenciones"),
      bullet("POST /excel/import/clientes — carga masiva de clientes desde Excel"),
      ...spacer(1),
      h4("Backend — lógica de importación"),
      bullet("Parsear archivo con SheetJS"),
      bullet("Validar estructura del archivo (columnas requeridas)"),
      bullet("Mapear filas a objetos del dominio"),
      bullet("Devolver preview de lo que se va a importar (no guardar todavía)"),
      bullet("El usuario confirma → se guarda en DB con origenCarga: EXCEL"),
      bullet("Manejo de duplicados: si ya existe una liquidación para ese período e impuesto → mostrar conflicto"),
      ...spacer(1),
      h4("Backend — endpoints exportación"),
      bullet("GET /excel/export/liquidaciones?clienteId=X&periodo=YYYY-MM — resumen de liquidaciones"),
      bullet("GET /excel/export/tareas?estado=X — panel de tareas actual"),
      bullet("GET /excel/export/clientes — cartera completa de clientes"),
      bullet("GET /excel/export/vencimientos?mes=X — calendario de vencimientos del mes"),
      bullet("GET /excel/export/honorarios — honorarios por cliente del período"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Botón Importar en módulos correspondientes → modal con upload + preview de datos"),
      bullet("Tabla de preview con columnas coloreadas: verde (nuevo), amarillo (actualiza), rojo (conflicto)"),
      bullet("Botón confirmar importación"),
      bullet("Botón Exportar en cada módulo → descarga directa del .xlsx"),
      ...spacer(1),

      h3("3.2 Módulo Bot Telegram"),
      h4("Backend — arquitectura"),
      bullet("Un bot de Telegram con número propio del estudio"),
      bullet("nestjs-telegraf maneja los handlers de mensajes"),
      bullet("Cada colaborador registra su Telegram en su perfil → vincula telegramChatId"),
      bullet("El bot solo responde a usuarios registrados en el sistema"),
      ...spacer(1),
      h4("Backend — comandos disponibles"),
      bullet("/estado — resumen de tareas pendientes del colaborador"),
      bullet("/vencimientos — lista de vencimientos próximos de sus clientes"),
      bullet("/completar [nombreTarea] — marca tarea como completada"),
      bullet("Mensaje de texto libre → procesado con IA (claude-sonnet-4-20250514) para detectar intención"),
      bullet("Imagen/foto → OCR con IA para extraer datos de comprobante → pre-cargar liquidación"),
      ...spacer(1),
      h4("Backend — flujo de carga por texto libre"),
      code("Colaborador: 'IVA García mayo 45230 vence 18/06'"),
      code("→ Claude interpreta: impuesto=IVA, cliente=García, periodo=2026-05,"),
      code("                     importe=45230, vencimiento=18/06/2026"),
      code("→ Bot responde: '¿Confirmar carga? IVA García Mayo $45.230 vence 18/06'"),
      code("→ Colaborador: 'sí'"),
      code("→ Sistema guarda Liquidacion con origenCarga: BOT"),
      code("→ Bot responde: '✅ Liquidación cargada correctamente'"),
      ...spacer(1),
      h4("Backend — flujo de carga por imagen"),
      code("Colaborador envía foto del VEP o comprobante"),
      code("→ Claude Vision extrae: tipo impuesto, CUIT, importe, fecha"),
      code("→ Bot muestra preview con los datos extraídos"),
      code("→ Colaborador confirma o corrige"),
      code("→ Sistema guarda con origenCarga: BOT"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Perfil de usuario: campo para vincular cuenta de Telegram (con instrucciones paso a paso)"),
      bullet("Panel de admin (SOCIO): lista de usuarios con estado de vinculación Telegram"),
      ...spacer(1),
      important("Al terminar Etapa 3: el sistema importa y exporta Excel, y el bot de Telegram permite carga rápida desde el celular."),

      separator(),

      // ETAPA 4
      h2("ETAPA 4 — Dashboard, Métricas y Panel Financiero (Semanas 16 a 18)"),
      p("Objetivo: visibilidad completa del estudio para los socios.", { bold: true }),
      ...spacer(1),

      h3("4.1 Dashboard Home"),
      h4("Backend — endpoints"),
      bullet("GET /dashboard/metricas — datos del header: total clientes, pendientes, urgentes, alertas"),
      bullet("GET /dashboard/semaforos — distribución verde/amarillo/rojo de la cartera"),
      bullet("GET /dashboard/tareas-por-colaborador — carga de trabajo del equipo"),
      bullet("GET /dashboard/vencimientos-semana — próximos 7 días consolidado"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Header global: clientes totales, pendientes, urgentes, alertas (igual al mockup)"),
      bullet("Cards con métricas: tareas por estado, distribución de semáforos"),
      bullet("Gráfico de carga por colaborador (barras con Recharts)"),
      bullet("Lista de vencimientos próximos con acceso rápido"),
      ...spacer(1),

      h3("4.2 Semáforo de salud del cliente"),
      h4("Backend — lógica de cálculo"),
      bullet("VERDE: no hay tareas vencidas, todas las liquidaciones del período cargadas"),
      bullet("AMARILLO: hay tareas próximas a vencer (menos de 5 días) o falta alguna liquidación"),
      bullet("ROJO: hay tareas vencidas sin completar o liquidaciones del período sin cargar"),
      bullet("Recalculado automáticamente por cron job diario y al completar/cargar cualquier tarea o liquidación"),
      ...spacer(1),

      h3("4.3 Panel financiero del estudio"),
      h4("Backend — endpoints"),
      bullet("GET /financiero/honorarios?periodo=YYYY-MM — honorarios por cliente del período"),
      bullet("GET /financiero/rentabilidad — honorario vs tiempo estimado por cliente"),
      bullet("GET /financiero/proyeccion — ingresos proyectados del mes basados en clientes activos"),
      ...spacer(1),
      h4("Frontend — vistas"),
      bullet("Tabla de honorarios: cliente, honorario mensual, tiempo estimado, ratio"),
      bullet("Gráfico de rentabilidad por cliente (solo SOCIO)"),
      bullet("Proyección de ingresos del mes"),
      ...spacer(1),
      important("Al terminar Etapa 4: el sistema está completo para uso en producción real."),

      separator(),

      // ETAPA 5
      h2("ETAPA 5 — Google Calendar y Portal del Cliente (Fase Futura)"),
      p("Objetivo: integraciones externas y acceso del cliente al sistema.", { bold: true }),
      ...spacer(1),

      h3("5.1 Sincronización Google Calendar"),
      bullet("OAuth2 por usuario: cada colaborador autoriza acceso a su Google Calendar"),
      bullet("Tokens guardados en usuario.googleTokens (encriptado)"),
      bullet("Job BullMQ cada 30 minutos: importa eventos del Google Calendar personal"),
      bullet("Eventos importados con origen: GOOGLE, no modificables desde el sistema"),
      bullet("Si el evento se elimina en Google → desaparece en el sistema"),
      bullet("Solo lectura: el sistema no escribe en Google Calendar"),
      ...spacer(1),

      h3("5.2 Portal del Cliente"),
      bullet("Ruta separada: /portal/:token — acceso sin login del estudio"),
      bullet("Token único por cliente, generado y enviado por email desde el sistema"),
      bullet("El cliente ve: sus vencimientos próximos, historial de liquidaciones, archivos compartidos"),
      bullet("Botón de contacto → abre email al estudio"),
      bullet("Solo lectura, sin edición posible"),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 6: CONVENCIONES ───────────────────────────────────────────
      h1("6. Convenciones de Código"),
      note("Estas convenciones aplican a todo el código del proyecto sin excepción."),
      ...spacer(1),

      h2("6.1 Nomenclatura"),
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [2500, 2500, 4360],
        rows: [
          headerRow(["Elemento", "Convención", "Ejemplo"], [2500, 2500, 4360]),
          dataRow(["Archivos y carpetas", "kebab-case", "clientes.service.ts, panel-tareas.tsx"], [2500, 2500, 4360], false),
          dataRow(["Clases y tipos", "PascalCase", "ClienteService, LiquidacionDto"], [2500, 2500, 4360], true),
          dataRow(["Variables y funciones", "camelCase", "obtenerClientes(), encargadoId"], [2500, 2500, 4360], false),
          dataRow(["Constantes", "UPPER_SNAKE_CASE", "MAX_INTENTOS_LOGIN"], [2500, 2500, 4360], true),
          dataRow(["Enums Prisma", "UPPER_SNAKE_CASE", "A_PAGAR, SALDO_A_FAVOR"], [2500, 2500, 4360], false),
          dataRow(["Rutas API", "kebab-case plural", "/email-templates, /agenda-items"], [2500, 2500, 4360], true),
          dataRow(["Períodos", "String YYYY-MM", "'2026-05'"], [2500, 2500, 4360], false),
        ]
      }),
      ...spacer(1),

      h2("6.2 Estructura de un módulo NestJS"),
      code("src/clientes/"),
      code("├── clientes.module.ts        ← importa y exporta"),
      code("├── clientes.controller.ts    ← solo recibe y delega, sin lógica"),
      code("├── clientes.service.ts       ← toda la lógica de negocio"),
      code("├── clientes.dto.ts           ← DTOs con class-validator"),
      code("└── clientes.types.ts         ← tipos específicos del módulo"),
      ...spacer(1),

      h2("6.3 Formato de respuestas API"),
      code("// Éxito con lista"),
      code('{ "data": [...], "meta": { "total": 50, "pagina": 1, "porPagina": 20 } }'),
      code(""),
      code("// Éxito con objeto"),
      code('{ "data": { "id": 1, "nombre": "García" } }'),
      code(""),
      code("// Error"),
      code('{ "error": "CLIENTE_NO_ENCONTRADO", "mensaje": "El cliente con id 5 no existe", "status": 404 }'),
      ...spacer(1),

      h2("6.4 Manejo de fechas"),
      bullet("Siempre guardar en UTC en PostgreSQL"),
      bullet("Convertir a America/Argentina/Buenos_Aires solo al mostrar en frontend"),
      bullet("Usar date-fns-tz para conversiones: formatInTimeZone(fecha, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy')"),
      bullet("Los períodos son siempre strings: '2026-05', nunca objetos Date"),
      ...spacer(1),

      h2("6.5 Seguridad — checklist en cada endpoint nuevo"),
      bullet("¿Tiene @UseGuards(JwtAuthGuard)?"),
      bullet("¿Tiene @Roles() si es solo para SOCIO?"),
      bullet("¿El DTO tiene class-validator en todos los campos?"),
      bullet("¿Un COLABORADOR podría acceder a datos de otro colaborador? → filtrar por usuarioId"),
      bullet("¿Hay rate limiting si es un endpoint sensible?"),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 7: VARIABLES DE ENTORNO ──────────────────────────────────
      h1("7. Variables de Entorno"),
      code("# App"),
      code("NODE_ENV=development"),
      code("PORT=3000"),
      code("FRONTEND_URL=http://localhost:3001"),
      code(""),
      code("# Base de datos"),
      code("DATABASE_URL=postgresql://user:pass@localhost:5432/gestionpro"),
      code(""),
      code("# JWT"),
      code("JWT_SECRET=<string aleatorio min 64 chars>"),
      code("JWT_REFRESH_SECRET=<string aleatorio diferente min 64 chars>"),
      code("JWT_EXPIRES_IN=15m"),
      code("JWT_REFRESH_EXPIRES_IN=7d"),
      code(""),
      code("# Redis"),
      code("REDIS_HOST=localhost"),
      code("REDIS_PORT=6379"),
      code(""),
      code("# AWS SES"),
      code("AWS_REGION=us-east-1"),
      code("AWS_ACCESS_KEY_ID="),
      code("AWS_SECRET_ACCESS_KEY="),
      code("EMAIL_FROM=noreply@estudiobb.com.ar"),
      code(""),
      code("# Cloudflare R2"),
      code("R2_ACCOUNT_ID="),
      code("R2_ACCESS_KEY_ID="),
      code("R2_SECRET_ACCESS_KEY="),
      code("R2_BUCKET_NAME=gestionpro-files"),
      code("R2_PUBLIC_URL=https://files.estudiobb.com.ar"),
      code(""),
      code("# Telegram"),
      code("TELEGRAM_BOT_TOKEN="),
      code(""),
      code("# Anthropic (IA para bot y OCR)"),
      code("ANTHROPIC_API_KEY="),
      code(""),
      code("# Google Calendar (fase 2)"),
      code("GOOGLE_CLIENT_ID="),
      code("GOOGLE_CLIENT_SECRET="),
      code("GOOGLE_REDIRECT_URI="),
      code(""),
      code("# Sentry"),
      code("SENTRY_DSN="),

      ...spacer(2),
      pageBreak(),

      // ── SECCIÓN 8: ESTADO DE MÓDULOS ─────────────────────────────────────
      h1("8. Estado de Módulos — Actualizar con cada sesión"),
      note("Esta tabla es la fuente de verdad del progreso. Actualizarla al terminar cada módulo o tarea significativa."),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [1400, 1800, 1600, 4560],
        rows: [
          headerRow(["Etapa", "Módulo", "Estado", "Notas / Decisiones tomadas"], [1400, 1800, 1600, 4560]),
          dataRow(["0", "Monorepo", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["0", "Auth backend", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["0", "Login frontend", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["1", "Clientes", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["1", "Tareas", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["1", "Vencimientos", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["1", "Liquidaciones", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["2", "Agenda", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["2", "Notificaciones", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["2", "Email/Templates", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["2", "Documentos", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["3", "Excel Import", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["3", "Excel Export", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["3", "Bot Telegram", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["4", "Dashboard", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["4", "Semáforo", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["4", "Panel Financiero", "⬜ Pendiente", "—"], [1400, 1800, 1600, 4560], false),
          dataRow(["5", "Google Calendar", "⬜ Futuro", "—"], [1400, 1800, 1600, 4560], true),
          dataRow(["5", "Portal Cliente", "⬜ Futuro", "—"], [1400, 1800, 1600, 4560], false),
        ]
      }),
      ...spacer(1),
      p("Leyenda: ⬜ Pendiente   🔄 En desarrollo   ✅ Completo   🔁 En revisión   ⬛ Bloqueado", { italics: true, color: "888888" }),

      ...spacer(2),

      // ── SECCIÓN 9: BLOQUE DE CONTEXTO PARA SESIONES ──────────────────────
      h1("9. Bloque de Contexto — Pegar al Inicio de Cada Sesión"),
      note("Copiar este bloque exacto al inicio de cada sesión de trabajo con la IA. Completar los campos entre corchetes."),
      ...spacer(1),
      code("=== CONTEXTO DEL PROYECTO ==="),
      code("Sistema: Gestión interna para Estudio BB (estudio contable argentino)"),
      code("Stack frontend: Next.js 16 + TypeScript + shadcn/ui + TanStack + Zustand + FullCalendar"),
      code("Stack backend: NestJS 11 + TypeScript + Prisma + PostgreSQL + Redis + BullMQ"),
      code("Storage: Cloudflare R2 para archivos, AWS SES para emails"),
      code("Auth: JWT propio (access 15min + refresh 7d rotativo), RBAC con roles SOCIO/COLABORADOR"),
      code("Tenant: un único estudio (estudioId=1 fijo), sin multitenancy activo"),
      code("Convenciones: kebab-case archivos, PascalCase clases, camelCase vars, fechas en UTC"),
      code("Respuestas API: { data, meta } éxito — { error, mensaje, status } error"),
      code("Períodos: string 'YYYY-MM' siempre"),
      code(""),
      code("=== ESTADO ACTUAL ==="),
      code("Módulos completos: [listar]"),
      code("Módulo en desarrollo: [indicar cuál]"),
      code(""),
      code("=== TAREA DE ESTA SESIÓN ==="),
      code("[Describir exactamente qué hay que hacer]"),
      code(""),
      code("=== RESTRICCIONES ==="),
      code("- No usar librerías fuera del stack definido"),
      code("- No cambiar estructura de carpetas"),
      code("- No tomar decisiones arquitectónicas sin consultar"),
      code("- Seguir convenciones de nomenclatura exactas"),
      code("- Todos los endpoints nuevos con JwtAuthGuard y validación DTO"),

      ...spacer(2),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 1 } },
        children: [new TextRun({ text: "Documento vivo · Versión 1.0 · Mayo 2026 · Actualizar con cada módulo completado", font: "Arial", size: 16, color: "999999", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const path = require('path');
  const outDir = path.join(__dirname, '..', 'especificaciones');
  const outFile = path.join(outDir, 'contexto_tecnico_ia.docx');
  fs.writeFileSync(outFile, buffer);
  console.log('Documento técnico generado OK → especificaciones/contexto_tecnico_ia.docx');
});
