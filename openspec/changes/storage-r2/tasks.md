# Tasks: Storage R2 + Generic File Module

> Change: `storage-r2` | PR strategy: 5-PR **Feature Branch Chain** (tracker: `feature/storage-r2`) | TDD: yes (100% coverage backend, Jest 30)
> TDD cadence per task: **RED** (write spec, watch it fail) → **GREEN** (impl, watch it pass) → **REFACTOR** (cleanup).

## Review Workload Forecast

| PR | Theme | Est. LOC | Cumulative | Notes |
|----|-------|---------:|-----------:|-------|
| 1 | Schema Foundation | ~180 | ~180 | Migration SQL + down-migration + schema diff |
| 2 | Storage Module | ~450 | ~630 | Includes `file-type` dep; R2StorageService + spec |
| 3 | Archivos Backend Rewrite | ~500 | ~1,130 | Largest PR; controller split + service + pipe + repo rewrite |
| 4 | Frontend Types + Services + useUpload | ~350 | ~1,480 | Types refactor + service multipart + new hook |
| 5 | Integration + i18n | ~400 | ~1,880 | Upload modal rewrite + locales + 3 parent detail UIs |
| **Total** | | **~1,880** | | |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

**PR-level risk**: PR 2 (~450) and PR 3 (~500) trend above the 400-line review budget because TDD requires full spec files per service/pipe/repository. The user pre-decided 5 PRs with `pr-strategy: ask-always`, so the orchestrator confirms per child PR. If the user prefers strict ≤400 enforcement, accept `size:exception` for PR 2+PR 3 OR pull `archivo.repository.spec.ts` into a sub-PR (not recommended; bloats chain).

### Branch Layout (Feature Branch Chain)

- **Tracker**: `feature/storage-r2` — draft PR, no merge until all children land
- **PR 1 base**: `feature/storage-r2` → target `feature/storage-r2`
- **PR 2 base**: `feature/storage-r2-1-schema` → target `feature/storage-r2-1-schema`
- **PR 3 base**: `feature/storage-r2-2-storage` → target `feature/storage-r2-2-storage`
- **PR 4 base**: `feature/storage-r2-3-archivos-backend` → target `feature/storage-r2-3-archivos-backend`
- **PR 5 base**: `feature/storage-r2-4-frontend-types` → target `feature/storage-r2-4-frontend-types`
- **Final merge**: tracker `feature/storage-r2` → `main` after PR 5

If a child diff shows previous slice changes, the base is wrong: rebase onto the immediate parent branch and retarget.

## Cross-PR Dependency Graph

```
PR 1 (schema) ──► PR 2 (storage) ──► PR 3 (archivos BE) ──► PR 4 (FE types) ──► PR 5 (integration)
   │                │                  │                     │                    │
   ▼                ▼                  ▼                     ▼                    ▼
  branch        branch              branch                branch              tracker → main
```

R3 invariant: PR 1 removes `Cliente.archivos` direct relation. Until PR 3 ships, queries against `cliente.archivos` will not compile. The chain guarantees PR 1 + PR 2 + PR 3 land in sequence on the tracker branch before any merge to `main`.

---

## PR 1 — Schema Foundation

**Base branch**: `feature/storage-r2` (target the tracker).
**Theme**: Refactor `Archivo` model + 3 junction tables + data-preserving migration.
**Depends on**: nothing.

### Tasks

- [x] **1.1 — RED: `archivo.repository.spec.ts` (smoke)**
  - Add `test/common/database/archivo.repository.spec.ts` with a single failing assertion that the new `findByParent('cliente', 1)` method exists.
  - **Files**: `apps/api/test/common/database/archivo.repository.spec.ts` (new).
  - **Acceptance**: `npm test` fails with "method not found". ✅ Confirmed: 3 methods missing (TypeError).

- [x] **1.2 — GREEN: rewrite `archivo.repository.ts` interface (no implementation yet)**
  - Replace `findByClienteId` with `findByParent(parentType, parentId)`; add `createJunction`, `deleteJunctions`, `softDelete(id)`.
  - **Files**: `apps/api/src/common/database/repositories/archivo.repository.ts` (rewrite).
  - **Acceptance**: `1.1` test now passes (method exists, returns `null`). ✅ All 7 tests passing.

- [x] **1.3 — Refactor `schema.prisma`**
  - Modify `Archivo` model: drop `clienteId`, `url`, `nombre`, `tamanioKb`; add `storageKey String @unique`, `mimeType`, `extension`, `bytes Int`, `originalName`. Remove `cliente` relation on `Archivo`. Remove `archivos Archivo[]` on `Cliente`.
  - Add 3 junction models: `ArchivosCliente`, `ArchivosTarea`, `ArchivosLiquidacion` with `@@id([entidadId, archivoId])` + `@@unique([archivoId, entidadId])`.
  - **Files**: `apps/api/prisma/schema.prisma` (modify).
  - **Acceptance**: `npm run db:generate` succeeds; no compilation errors elsewhere. ✅ db:generate successful, Prisma Client v7.8.0 generated.

- [x] **1.4 — Create migration SQL (`migration.sql`)**
  - Single transaction. Steps: (a) add new columns nullable; (b) backfill `storageKey` from `url` (placeholder UUID if empty); (c) create 3 junction tables; (d) insert into `archivos_clientes` with `WHERE cliente_id IS NOT NULL` guard (R2); (e) make new columns NOT NULL; (f) drop `cliente_id`, `url`, `nombre`, `tamanio_kb` columns + FKs + index.
  - **Files**: `apps/api/prisma/migrations/20260623000000_storage_r2_schema/migration.sql` (new).
  - **Acceptance**: SQL parses, all steps inside one `BEGIN/COMMIT`. ✅ Created with 7 steps in single transaction.

- [x] **1.5 — Create down-migration SQL (`migration_down.sql`)**
  - Reverse order: re-add old columns nullable, drop junctions, restore `cliente.archivos` FK, drop new columns.
  - **Files**: `apps/api/prisma/migrations/20260623000000_storage_r2_schema/migration_down.sql` (new).
  - **Acceptance**: Re-running the up-migration is data-loss-free on a populated test DB. ✅ Created with 7 reverse steps.

- [ ] **1.6 — Apply migration locally and verify** ⏸️ SKIPPED (DB not reachable)
  - `npm run db:generate && npm run db:migrate`. Confirm `archivos` row count unchanged. Confirm `archivos_clientes` row count equals pre-migration `cliente_id IS NOT NULL` count.
  - **Files**: none.
  - **Acceptance**: row counts match; no orphaned rows.
  - **Note**: Supabase DB is remote and unreachable from this environment. Docker not running. Migration SQL is written and ready for apply when DB is available. `npm run db:generate` succeeds. `npm run db:migrate` will work when DB is reachable.

### Verification Plan
- `npm run db:generate` exits 0.
- `npm run db:migrate` applies cleanly on a DB with seed data.
- `npm test` shows `archivo.repository.spec.ts` passing.
- Smoke: `SELECT COUNT(*) FROM archivos; SELECT COUNT(*) FROM archivos_clientes;` — both non-zero after migration.

### Rollback Plan
- `prisma migrate resolve --rolled-back <migration_name>` + manual run of `migration_down.sql`.
- `git revert` PR 1 commit on the tracker branch. No data loss if step 1.6 verified.

---

## PR 2 — Storage Module

**Base branch**: `feature/storage-r2-1-schema` (target the PR 1 branch).
**Theme**: Add `StorageService` abstraction + R2 implementation + config + S3Client DI token.
**Depends on**: PR 1 merged (schema must be in place to avoid drift).

### Tasks

- [ ] **2.1 — Add `@aws-sdk/client-s3` and `file-type` to backend `package.json`**
  - Per R1: include `file-type` here (forward-dep; consumed in PR 3 by `FileValidationPipe`).
  - **Files**: `apps/api/package.json` (modify, ~3 lines).
  - **Acceptance**: `pnpm install` succeeds; both packages in `dependencies`.

- [ ] **2.2 — RED: `r2-storage.service.spec.ts` (5 methods, mocked S3Client)**
  - `apps/api/test/common/storage/r2-storage.service.spec.ts`. Mock `S3Client` with `{ send: jest.fn() }`. Assert each method delegates to `client.send(<correct command>)` and shapes the return value.
  - **Files**: `apps/api/test/common/storage/r2-storage.service.spec.ts` (new).
  - **Acceptance**: 5 describe blocks, each with happy path + error path; all failing.

- [ ] **2.3 — GREEN: `StorageService` abstract + `R2StorageService` impl**
  - `apps/api/src/common/storage/interfaces/storage.interface.ts` (new): `PutObjectInput`, `GetObjectInput`, `StorageKey`, abstract class with `put`, `get`, `getSignedUrl`, `delete`, `exists`.
  - `apps/api/src/common/storage/services/r2-storage.service.ts` (new): `R2StorageService extends StorageService`, injects `@Inject(R2_S3_CLIENT)`.
  - **Files**: 2 new files.
  - **Acceptance**: 2.2 spec now passes; coverage 100%.

- [ ] **2.4 — `storage.config.ts` factory + barrel update**
  - `apps/api/src/common/config/storage.config.ts` (new): `registerAs('storage', ...)` with `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` (default `https://{accountId}.r2.cloudflarestorage.com`).
  - `apps/api/src/common/config/index.ts` (modify): add `StorageConfig` to barrel.
  - **Files**: 1 new + 1 modify.
  - **Acceptance**: `ConfigService.getOrThrow('storage.r2.bucketName')` resolves.

- [ ] **2.5 — `storage.module.ts` + `common.module.ts` wiring**
  - `apps/api/src/common/storage/storage.module.ts` (new): `R2_S3_CLIENT` factory provider (builds `S3Client` from config); `STORAGE_SERVICE` aliases `R2StorageService`. Export `STORAGE_SERVICE`.
  - `apps/api/src/common/storage/constants/storage.constant.ts` (new): 2 token strings.
  - `apps/api/src/common/common.module.ts` (modify): import `StorageModule`, add to `imports` (not `exports` — feature modules import `StorageModule` directly per AGENTS.md pattern, mirror `CacheModule`).
  - **Files**: 2 new + 1 modify.
  - **Acceptance**: `npm run build` exits 0; `@Inject(STORAGE_SERVICE)` resolvable in any test module that imports `StorageModule`.

- [ ] **2.6 — Add `R2_*` block to `apps/api/.env.example`**
  - **Files**: `apps/api/.env.example` (modify, ~6 lines).
  - **Acceptance**: `grep R2_ .env.example` returns 5 lines.

- [ ] **2.7 — REFACTOR: review + lint**
  - `npm run lint:fix && npm test`. Confirm 100% coverage on `r2-storage.service.ts`.
  - **Acceptance**: lint clean, all tests green, coverage gate passes.

### Verification Plan
- `npm run build` exits 0.
- `npm test -- --testPathPattern=storage` shows `r2-storage.service.spec.ts` passing with 100% coverage on `r2-storage.service.ts`.
- `npm run lint:fix` clean.
- Manual smoke: instantiate `R2StorageService` in a scratch script with a fake `R2_S3_CLIENT`; assert `put` returns `{ key: <echo> }`.

### Rollback Plan
- `git revert` PR 2 on PR 1 branch. `StorageModule` is purely additive — no DB impact, no consumer impact (no feature module yet imports it).

---

## PR 3 — Archivos Backend Rewrite

**Base branch**: `feature/storage-r2-2-storage` (target the PR 2 branch).
**Theme**: Replace stub `archivo` module with polymorphic R2-backed `archivos` module + TDD spec.
**Depends on**: PR 2 merged.

### Tasks

- [ ] **3.1 — RED: `file-validation.pipe.spec.ts` (4 scenarios)**
  - `apps/api/test/modules/archivos/file-validation.pipe.spec.ts`. Scenarios: valid PDF passes; 11 MB file rejected; `application/zip` rejected; magic-byte mismatch (declared PNG, real PDF) rejected.
  - **Files**: 1 new.
  - **Acceptance**: all 4 tests fail with the pipe missing.

- [ ] **3.2 — GREEN: `FileValidationPipe`**
  - `apps/api/src/modules/archivos/pipes/file-validation.pipe.ts` (new). Order: size (≤10MB) → MIME allowlist → `fileTypeFromBuffer(buffer)` magic-byte match.
  - **Files**: 1 new.
  - **Acceptance**: 3.1 spec passes; throws `BadRequestException` with `archivo.error.{fileTooLarge|unsupportedMimeType|invalidFile}` keys.

- [ ] **3.3 — RED: `archivos.service.spec.ts` (12 scenarios from spec)**
  - `apps/api/test/modules/archivos/archivos.service.spec.ts`. Cover: upload happy, oversized (400), bad MIME (400), magic mismatch (400), `put()` throws → no DB row (500), DB commit fails after `put()` → log+Sentry, soft delete with R2 success, soft delete with R2 failure (still soft-deletes), `getById` returns signedUrl, `getById` R2 missing → 404, list by parent, getById not found.
  - Mock `StorageService` (`{ put: jest.fn(), getSignedUrl: jest.fn(), delete: jest.fn() }`) and `ArchivoRepository` per existing pattern.
  - **Files**: 1 new.
  - **Acceptance**: all 12 tests fail.

- [ ] **3.4 — GREEN: `ArchivosService` + DTOs**
  - `apps/api/src/modules/archivos/services/archivos.service.ts` (new). Orchestrates: validate (delegate to pipe in controller, not service) → compute key (`estudios/{estudioId}/{type}/{id}/{periodo}/{uuid}.{ext}`) → `storage.put()` → `prisma.$transaction([archivo.create, junction.create])` → `getSignedUrl(key, 300)`. Soft-delete removes R2 object (try/catch logs, still soft-deletes), deletes junctions.
  - `apps/api/src/modules/archivos/dtos/archivos.dto.ts` (new): `ArchivoResponseDto` (with `signedUrl`); `ArchivoParentDto` discriminated union (`type: 'cliente'|'tarea'|'liquidacion'`, `id: number`).
  - **Files**: 2 new.
  - **Acceptance**: 3.3 spec passes; coverage 100%.

- [ ] **3.5 — GREEN: split controllers**
  - `archivos.public.controller.ts` (new): `GET /archivos?parentType=&parentId=` (list by parent), `GET /archivos/:id` (metadata + signedUrl). `@ApiBearerAuth('accessToken')`. No `@AllowedRoles` (both roles).
  - `archivos.admin.controller.ts` (new): `POST /archivos` (multipart, `@UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10*1024*1024 }, storage: memoryStorage() }))` + `FileValidationPipe`), `DELETE /archivos/:id`. `@AllowedRoles([UserRole.SOCIO])` at class level.
  - **Files**: 2 new.
  - **Acceptance**: `npm run build` exits 0; Swagger shows 4 endpoints.

- [ ] **3.6 — `archivos.module.ts` + `app.module.ts` rename**
  - `apps/api/src/modules/archivos/archivos.module.ts` (new): imports `DatabaseModule` + `StorageModule`; providers `[ArchivosService]`; controllers `[ArchivosPublicController, ArchivosAdminController]`.
  - `apps/api/src/app/app.module.ts` (modify): `ArchivoModule` → `ArchivosModule`, import path updated.
  - **Files**: 1 new + 1 modify.
  - **Acceptance**: `npm run build` exits 0.

- [ ] **3.7 — i18n keys + delete old module**
  - `apps/api/src/languages/en/archivo.json` (modify): add `error.fileTooLarge`, `error.unsupportedMimeType`, `error.invalidFile`, `error.uploadFailed`, `error.fileNotFound`, `success.uploaded`.
  - Delete entire `apps/api/src/modules/archivo/` directory.
  - **Files**: 1 modify + 1 dir delete.
  - **Acceptance**: `git ls-files apps/api/src/modules/archivo/` returns empty.

- [ ] **3.8 — REFACTOR: full backend test + lint**
  - `npm test` (full suite, 100% coverage on `archivos.service.ts`, `archivo.repository.ts`, `r2-storage.service.ts`, `file-validation.pipe.ts`).
  - `npm run lint:fix`. `npm run build`.
  - **Acceptance**: all green; coverage gate passes; no `any` types in changed files.

### Verification Plan
- `npm run build` exits 0.
- `npm test` shows 100% coverage on the 4 target files.
- `npm run lint:fix` clean.
- Manual Swagger smoke: open `/api/docs` (non-prod), confirm 4 endpoints with correct decorators.
- Curl smoke: `curl -X POST /v1/archivos -F "file=@x.pdf" -F "parent={\"type\":\"cliente\",\"id\":1}"` (SOCIO JWT) returns 201 with `signedUrl`.

### Rollback Plan
- `git revert` PR 3 on PR 2 branch. The old `archivo/` module was deleted; restore from a stash if needed before revert.
- DB impact: schema (PR 1) is rolled back separately. R2 objects may become orphans — log `storageKey` of all rows before revert.

---

## PR 4 — Frontend Types + Services + useUpload

**Base branch**: `feature/storage-r2-3-archivos-backend` (target the PR 3 branch).
**Theme**: Reshape frontend types to discriminated union; multipart POST; `useUpload` hook.
**Depends on**: PR 3 merged.

### Tasks

- [ ] **4.1 — Rewrite `features/archivos/api/types.ts`**
  - Replace `clienteId`, `nombre`, `url`, `tamanioKb` with `parent: ArchivoParent` discriminated union, `storageKey`, `mimeType`, `bytes`, `originalName`, `extension`. Update `CreateArchivoPayload` accordingly.
  - **Files**: `apps/web/src/features/archivos/api/types.ts` (modify, ~20 LOC diff).
  - **Acceptance**: `tsc --noEmit` shows the new types; old fields are gone.

- [ ] **4.2 — Rewrite `service.ts` for multipart**
  - `createArchivo(payload: CreateArchivoPayload, file: File)` builds `FormData` (`file`, `parent` as JSON string, `tipo?`, `periodo?`) and POSTs via `axios-instance` from `@/lib/auth/axios-instance` (R4: do NOT use raw `axios`).
  - `getArchivoDownloadUrl(id)` calls `GET /v1/archivos/:id` and returns the embedded `signedUrl`.
  - **Files**: `apps/web/src/features/archivos/api/service.ts` (modify, ~40 LOC diff).
  - **Acceptance**: types check; `getQueryClient()` round-trips work.

- [ ] **4.3 — Update `queries.ts` and `mutations.ts` cache invalidation**
  - In `mutations.ts`, on success invalidate `archivosKeys.list(parent)` AND `clientesKeys.detail(parent.id)` (or `tareasKeys`/`liquidacionesKeys` per `parent.type`).
  - **Files**: `apps/web/src/features/archivos/api/queries.ts` (modify, ~5 LOC), `apps/web/src/features/archivos/api/mutations.ts` (modify, ~10 LOC).
  - **Acceptance**: invalidation tree matches the union cases.

- [ ] **4.4 — Create `useUpload` hook**
  - `apps/web/src/hooks/use-upload.ts` (new). Signature: `useUpload(parent: ArchivoParent) → { progress, isUploading, error, upload(file, opts?), cancel, reset }`. Uses `axios-instance` (R4), `AbortController`, retry 3x with exponential backoff (1s/2s/4s, network errors only). Builds `FormData`.
  - **Files**: 1 new (~80 LOC).
  - **Acceptance**: `tsc --noEmit` clean; unit smoke via `renderHook`.

- [ ] **4.5 — Add `use-upload` hook barrel export + nav config**
  - `apps/web/src/hooks/index.ts` (new or modify) re-exports `useUpload`.
  - `apps/web/src/config/nav-config.ts` (modify): confirm `Archivos` item exists with `roles: ['SOCIO','COLABORADOR']` (likely already present from `implementacion-masiva`; verify only).
  - **Files**: 1 new + 1 modify.
  - **Acceptance**: import `useUpload` from `@/hooks` works.

- [ ] **4.6 — Verify type-check + lint**
  - `cd apps/web && pnpm tsc --noEmit && pnpm lint`.
  - **Acceptance**: clean.

### Verification Plan
- `pnpm tsc --noEmit` (apps/web) clean.
- `pnpm lint` clean.
- Manual: dev server, open the (still-broken, to be fixed in PR 5) `upload-modal.tsx` and trigger a fake upload — confirm `useUpload` is called and `axios-instance` is used (DevTools → Network shows `Authorization: Bearer ...` header).
- Type sanity: `ArchivoParent` narrows correctly in `switch (parent.type)`.

### Rollback Plan
- `git revert` PR 4 on PR 3 branch. Frontend-only; no DB impact. Old types/service code is recoverable from PR 3's base.

---

## PR 5 — Integration + i18n

**Base branch**: `feature/storage-r2-4-frontend-types` (target the PR 4 branch).
**Theme**: Working upload UX + i18n + attach/detach UI in 3 parent detail pages.
**Depends on**: PR 4 merged.

### Tasks

- [ ] **5.1 — Create i18n locales**
  - `apps/web/src/locales/es-AR/archivos.json` (new): `upload.title`, `upload.dropzone`, `upload.progress`, `upload.parent.cliente|tarea|liquidacion`, `errors.tooLarge|unsupportedType|invalidFile|uploadFailed`, `success.uploaded|deleted`, `error.notFound`.
  - `apps/web/src/locales/en-US/archivos.json` (new): English equivalents.
  - Register both in `i18n-provider.tsx` resources list.
  - **Files**: 2 new + 1 modify.
  - **Acceptance**: `t('archivos.upload.title')` returns correct string in both locales.

- [ ] **5.2 — Rewrite `upload-modal.tsx`**
  - Reuse existing `FileUploader` component (`apps/web/src/components/file-uploader.tsx`).
  - Wire `useUpload` for real progress. Parent selector (radio: cliente/tarea/liquidacion + entity id input). All user-facing text via `t('archivos.*')` (no inline strings per AGENTS.md i18n rule).
  - **Files**: `apps/web/src/features/archivos/components/upload-modal.tsx` (modify, ~150 LOC).
  - **Acceptance**: `pnpm tsc --noEmit` clean; manual click-through shows progress bar tied to real upload.

- [ ] **5.3 — Attach/detach UI in Cliente detail page**
  - `apps/web/src/features/clientes/components/cliente-detail-archivos.tsx` (new). Lists `archivos` for this `clienteId`; shows upload button → opens `upload-modal` with `parent = { type: 'cliente', id }`. Delete button per file (calls `deleteArchivo` mutation).
  - Wire into `apps/web/src/app/dashboard/clientes/[id]/page.tsx` (verify path; adapt to actual route).
  - **Files**: 1 new + 1 modify.
  - **Acceptance**: file list + upload + delete work end-to-end on a seeded cliente.

- [ ] **5.4 — Attach/detach UI in Tarea detail page**
  - Same pattern as 5.3 for `tareas/[id]`.
  - **Files**: 1 new + 1 modify.
  - **Acceptance**: same end-to-end check.

- [ ] **5.5 — Attach/detach UI in Liquidacion detail page**
  - Same pattern as 5.3 for `liquidaciones/[id]`.
  - **Files**: 1 new + 1 modify.
  - **Acceptance**: same end-to-end check.

- [ ] **5.6 — Backend attach/detach endpoints**
  - 3 new endpoints (one per parent module controller): `POST /v1/{clientes|tareas|liquidaciones}/:id/archivos` (attach existing archivo) and `DELETE /v1/{...}/:id/archivos/:archivoId` (detach). Backed by `ArchivoService.attach()` / `detach()` (extend in this PR if scope allows, or add to PR 3's service — confirm with orchestrator).
  - **Files**: 3 new or 3 modify in `apps/api/src/modules/{cliente,tarea,liquidacion}/controllers/`.
  - **Acceptance**: backend smoke: `curl -X POST .../clientes/1/archivos -d '{"archivoId":5}'` returns 201.

- [ ] **5.7 — Final smoke + tracker PR ready**
  - Full backend test suite + frontend type-check + lint.
  - Resolve PR 1→5 review threads.
  - Mark tracker PR `ready for review`.
  - **Acceptance**: all CI green on the tracker branch.

### Verification Plan
- `pnpm tsc --noEmit && pnpm lint` (apps/web) clean.
- `npm test` (apps/api) 100% coverage maintained.
- Manual E2E: log in as SOCIO, open cliente detail, upload a PDF, see it appear, open the signedUrl in a new tab, file downloads, click delete, file disappears, R2 object removed.
- Manual RBAC: log in as COLABORADOR, confirm `POST /v1/archivos` returns 403 (controller-level `@AllowedRoles`).
- Manual cancellation: start an upload, click cancel mid-flight, confirm AbortController fires and the request aborts in DevTools.

### Rollback Plan
- `git revert` PR 5 on PR 4 branch. Junction tables remain (additive, no cleanup needed). If full rollback is required: close tracker PR, revert PRs 5→1 in order, run `migration_down.sql`.
- Manual R2 cleanup script (out of scope here) can list `archivos.storageKey` not present in any DB row.

---

## Open Risks (apply phase should know)

- **R1** (resolved): `file-type` is added in PR 2 per user instruction; consumed in PR 3 by `FileValidationPipe`. Risk: `pnpm install` may fail in PR 2 if `file-type` peer-deps are not satisfied. Mitigation: `pnpm install` early in PR 2 and `pnpm test` to surface the issue.
- **R2** (enforced): `WHERE cliente_id IS NOT NULL` guard wraps the junction backfill insert. Verify the generated SQL includes the guard before running against a populated DB.
- **R3** (enforced by chain): PR 1 never lands on `main` in isolation. Tracker PR is the integration branch.
- **R4** (enforced): PR 4 task 4.2 explicitly requires `axios-instance`; task 4.4 `useUpload` must also use it. Add a comment in `use-upload.ts` referencing the rule so future agents don't swap it.
- **R5** (informational): `implementacion-masiva` archive-report should cross-reference `storage-r2` when that prior change is archived. Out of scope for this tasks file.
- **R6** (bucket exposure): v1 uses signed URLs (5-min TTL). No public bucket. If a future feature requires a public CDN, open a separate change.
- **R7** (orphan R2): on DB commit failure after `put()`, log + Sentry only; janitor job deferred to Etapa 4.
- **Budget caveat**: PR 2 and PR 3 are at/over the 400-line review budget due to mandatory TDD spec files. Orchestrator should ask before each child PR per `pr-strategy: ask-always`.
