# Skill Registry — GestiónPro

> Generado: 2026-05-15 · Actualizar con `/skill-registry` al agregar/quitar skills

## User Skills (aplicables al proyecto)

| Skill | Trigger | Aplicabilidad |
|-------|---------|---------------|
| `branch-pr` | Crear PR, abrir PR, preparar cambios para review | ✅ Todo el proyecto |
| `issue-creation` | Crear issue, reportar bug, solicitar feature | ✅ Todo el proyecto |
| `judgment-day` | "judgment day", "doble review", "que lo juzguen" | ✅ Revisiones de código |
| `skill-creator` | Crear nuevo skill, documentar patrones para IA | ✅ Extender tooling |
| `customize-opencode` | Editar config de opencode | ⚠️ Solo metadata del proyecto |

## Skills NO aplicables

| Skill | Razón |
|-------|-------|
| `go-testing` | Proyecto TypeScript, no Go |
| `sdd-*` (todos) | Skills de orquestación SDD, no de uso directo |

## Project Convention Files

| Archivo | Ubicación | Rol |
|---------|-----------|-----|
| `apps/api/CLAUDE.md` | Backend | Convenciones NestJS, patrones, comandos, estructura |
| `apps/web/CLAUDE.md` | Frontend | Convenciones Next.js (vacío/por completar) |
| `apps/web/AGENTS.md` | Frontend | Guía completa del template: stack, patrones, componentes |
| `.atl/skill-registry.md` | Raíz | Este archivo |
| `especificaciones/doc_tecnico_ia.js` | Raíz | Documento técnico completo del sistema |

## Template Skills (apps/web/.claude/skills/)

| Skill | Descripción |
|-------|-------------|
| `vercel-react-best-practices` | Patrones React/Next.js recomendados por Vercel |
| `vercel-composition-patterns` | Patrones de composición en Next.js App Router |

## Convenciones Clave del Proyecto

- **Lenguaje**: TypeScript strict mode en ambos apps
- **Naming**: kebab-case archivos, PascalCase clases, camelCase vars, UPPER_SNAKE_CASE constantes
- **API**: NestJS REST con prefijo `/v1/`, respuestas `{ statusCode, message, timestamp, data }`
- **Frontend**: Feature-based (`src/features/<name>/api/{types,service,queries}.ts`)
- **Auth**: JWT propio (access 15min + refresh 7d rotativo), roles SOCIO/COLABORADOR
- **DB**: Prisma 7 con PostgreSQL 15, `estudioId=1` fijo, fechas en UTC
- **Testing backend**: Jest con 100% coverage, `test/` espeja `src/`
- **Commits**: Conventional commits (`feat:`, `fix:`, etc.)
