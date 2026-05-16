# Tasks: Implementación Masiva GestiónPro

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Feature Branch Chain (11 commits → tracker PR) |
| Delivery strategy | ask-on-risk |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

---

## Phase 0: Template Cleanup

- [ ] 0.1 Delete `src/features/products/` directory
- [ ] 0.2 Delete `src/features/product/` directory (singular if exists)
- [ ] 0.3 Delete `src/app/(dashboard)/about/page.tsx`
- [ ] 0.4 Delete `src/app/(dashboard)/privacy/page.tsx`
- [ ] 0.5 Delete `src/app/(dashboard)/terms/page.tsx`
- [ ] 0.6 Remove products/about/privacy/terms nav items from `src/config/nav-config.ts`

## Phase 1: i18n Foundation

- [ ] 1.1 Add dependencies: `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [ ] 1.2 Create `src/lib/i18n/config.ts` — i18next configuration with es-AR default
- [ ] 1.3 Create `src/lib/i18n/client.ts` — client-side provider wrapper
- [ ] 1.4 Create `src/locales/es-AR/common.json` — base UI translations
- [ ] 1.5 Create `src/locales/en-US/common.json` — English translations
- [ ] 1.6 Create `src/components/language-switcher.tsx` — es-AR ↔ en-US switcher

## Phase 2: API Client Unification

- [ ] 2.1 Delete `src/lib/api/client.ts` (openapi-fetch)
- [ ] 2.2 Remove `openapi-fetch` and `openapi-typescript` from package.json
- [ ] 2.3 Migrate `src/features/auth/api/service.ts` to axios-instance
- [ ] 2.4 Migrate `src/features/users/api/service.ts` to axios-instance
- [ ] 2.5 Update `src/features/auth/store/auth.store.ts` configureApiAuth → configureAuthInterceptors

## Phase 3: Backend Archivo Module

- [ ] 3.1 Add `Archivo` model to `apps/api/prisma/schema.prisma`
- [ ] 3.2 Create `apps/api/src/modules/archivo/archivo.controller.ts`
- [ ] 3.3 Create `apps/api/src/modules/archivo/archivo.service.ts`
- [ ] 3.4 Create `apps/api/src/modules/archivo/dto/` (CreateArchivoDto, UpdateArchivoDto)
- [ ] 3.5 Create `apps/api/src/modules/archivo/archivo.module.ts`
- [ ] 3.6 Import ArchivoModule in `apps/api/src/app.module.ts`
- [ ] 3.7 Run `npx prisma migrate dev` for Archivo model

## Phase 4: Backend Comunicación Module

- [ ] 4.1 Add `Comunicacion` model to `apps/api/prisma/schema.prisma`
- [ ] 4.2 Create `apps/api/src/modules/comunicacion/comunicacion.controller.ts`
- [ ] 4.3 Create `apps/api/src/modules/comunicacion/comunicacion.service.ts`
- [ ] 4.4 Create `apps/api/src/modules/comunicacion/dto/` (CreateComunicacionDto, UpdateComunicacionDto)
- [ ] 4.5 Create `apps/api/src/modules/comunicacion/comunicacion.module.ts`
- [ ] 4.6 Import ComunicacionModule in `apps/api/src/app.module.ts`
- [ ] 4.7 Run `npx prisma migrate dev` for Comunicacion model

## Phase 5: Frontend Agenda (FullCalendar)

- [ ] 5.1 Add dependencies: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`
- [ ] 5.2 Create `src/features/agenda/api/types.ts`
- [ ] 5.3 Create `src/features/agenda/api/service.ts` — CRUD agenda items via axios
- [ ] 5.4 Create `src/features/agenda/api/queries.ts` — React Query hooks
- [ ] 5.5 Create `src/features/agenda/api/mutations.ts` — create/update/delete mutations
- [ ] 5.6 Create `src/features/agenda/components/full-calendar-wrapper.tsx` — dynamic import wrapper
- [ ] 5.7 Create `src/features/agenda/components/agenda-item-modal.tsx` — create/edit modal
- [ ] 5.8 Create `src/app/dashboard/agenda/page.tsx` — integrate FullCalendar with filters

## Phase 6: Frontend Notificaciones + Header

- [ ] 6.1 Create `src/features/notificaciones/api/types.ts`
- [ ] 6.2 Create `src/features/notificaciones/api/service.ts` — get notificaciones, mark read
- [ ] 6.3 Create `src/features/notificaciones/api/queries.ts`
- [ ] 6.4 Create `src/features/notificaciones/api/mutations.ts`
- [ ] 6.5 Create `src/components/layout/notifications-dropdown.tsx` — campanita badge + dropdown
- [ ] 6.6 Modify `src/components/layout/header.tsx` — integrate NotificationsDropdown
- [ ] 6.7 Create `src/app/dashboard/notificaciones/page.tsx` — full history with DataTable

## Phase 7: Frontend Vencimientos

- [ ] 7.1 Create `src/features/vencimientos/api/types.ts`
- [ ] 7.2 Create `src/features/vencimientos/api/service.ts` — CRUD + import Excel
- [ ] 7.3 Create `src/features/vencimientos/api/queries.ts`
- [ ] 7.4 Create `src/features/vencimientos/api/mutations.ts`
- [ ] 7.5 Create `src/features/vencimientos/components/excel-import-modal.tsx` — drag & drop + xlsx parsing
- [ ] 7.6 Create `src/features/venimientos/components/vencimiento-columns.tsx`
- [ ] 7.7 Create `src/features/vencimientos/components/vencimiento-cell-action.tsx`
- [ ] 7.8 Create `src/app/dashboard/vencimientos/page.tsx` — DataTable + import (SOCIO only)

## Phase 8: Frontend Archivos

- [ ] 8.1 Create `src/features/archivos/api/types.ts`
- [ ] 8.2 Create `src/features/archivos/api/service.ts` — metadata-only CRUD
- [ ] 8.3 Create `src/features/archivos/api/queries.ts`
- [ ] 8.4 Create `src/features/archivos/api/mutations.ts`
- [ ] 8.5 Create `src/features/archivos/components/upload-modal.tsx` — drag & drop with validation
- [ ] 8.6 Create `src/features/archivos/components/archivo-columns.tsx`
- [ ] 8.7 Create `src/features/archivos/components/archivo-cell-action.tsx`
- [ ] 8.8 Create `src/app/dashboard/archivos/page.tsx` — files table with upload

## Phase 9: Frontend Comunicaciones

- [ ] 9.1 Create `src/features/comunicaciones/api/types.ts`
- [ ] 9.2 Create `src/features/comunicaciones/api/service.ts`
- [ ] 9.3 Create `src/features/comunicaciones/api/queries.ts`
- [ ] 9.4 Create `src/features/comunicaciones/api/mutations.ts`
- [ ] 9.5 Create `src/features/comunicaciones/components/comunicacion-form-modal.tsx`
- [ ] 9.6 Create `src/features/comunicaciones/components/comunicacion-columns.tsx`
- [ ] 9.7 Create `src/features/comunicaciones/components/comunicacion-cell-action.tsx`
- [ ] 9.8 Create `src/app/dashboard/comunicaciones/page.tsx`

## Phase 10: Frontend Email Templates + Financiero + Nav Update

- [ ] 10.1 Create `src/features/email-templates/api/types.ts`
- [ ] 10.2 Create `src/features/email-templates/api/service.ts`
- [ ] 10.3 Create `src/features/email-templates/api/queries.ts`
- [ ] 10.4 Create `src/features/email-templates/api/mutations.ts`
- [ ] 10.5 Create `src/features/email-templates/components/template-editor.tsx` — with live preview
- [ ] 10.6 Create `src/app/dashboard/email-templates/page.tsx` — SOCIO only
- [ ] 10.7 Create `src/features/financiero/components/honorarios-section.tsx` — bar chart + KPIs
- [ ] 10.8 Create `src/features/financiero/components/rentabilidad-section.tsx` — line chart with filters
- [ ] 10.9 Create `src/features/financiero/components/proyeccion-section.tsx` — area chart
- [ ] 10.10 Create `src/app/dashboard/financiero/page.tsx` — tabs layout
- [ ] 10.11 Update `src/config/nav-config.ts` — add 7 new nav items with roles

---

## Implementation Order

1. **Phase 0** (cleanup) → Prereq for everything else
2. **Phase 1** (i18n) → Foundation for UI text
3. **Phase 2** (API client) → Unify HTTP layer before new features
4. **Phase 3** (Backend Archivo) → Database model first
5. **Phase 4** (Backend Comunicación) → Database model second
6. **Phase 5-10** (Frontend features) → Independent, can run sequentially
7. **Phase 10** includes Nav update to wire all features

## Verification Per Phase

| Phase | Verification |
|-------|--------------|
| 0 | `grep -r "products" src/features/` returns nothing |
| 1 | Switch language → UI updates without reload |
| 2 | Auth login/logout works via axios |
| 3 | `POST /v1/archivos` returns 201, `GET /v1/archivos` filters by clienteId |
| 4 | `POST /v1/comunicaciones` returns 201, filters work |
| 5 | FullCalendar renders, click date → modal, CRUD events |
| 6 | Campanita badge shows count, dropdown lists 5, mark read works |
| 7 | Upload Excel → vencimientos created with validation report |
| 8 | Drag file → validate → upload → table shows record |
| 9 | Create/edit/delete comunicación → table updates |
| 10 | Email templates CRUD with preview, Financiero charts render, nav items appear |

## Next Step

Ready for sdd-apply. Recommend Feature Branch Chain with tracker PR to keep 11 commits organized. User should confirm chain strategy before apply.