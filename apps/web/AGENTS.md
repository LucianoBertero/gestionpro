# AGENTS.md — Frontend Next.js (GestiónPro)

> **Template base**: Kiranism/next-shadcn-dashboard-starter. Adaptado a JWT propio, sin Clerk. Este es el archivo canónico para IAs.

## Stack Real — GestiónPro

| Tecnología | Rol |
|------------|-----|
| Next.js 16 (App Router) + TypeScript | Framework |
| Tailwind CSS v4 + shadcn/ui (New York) | Estilos + componentes base |
| Zustand v5 | Estado global (auth store, UI state) |
| Axios | Cliente HTTP al backend NestJS |
| TanStack React Query v5 | Fetching, cache, invalidación |
| TanStack Table v8 | Tablas con sort/filter/pagination |
| TanStack Form + Zod | Formularios con validación |
| Nuqs | URL search params state management |
| Recharts | Gráficos del dashboard |
| FullCalendar | Vista de calendario (a instalar) |

**Ya NO usa**: Clerk (auth), mock APIs, `api-client.ts` fetch wrapper.

## Auth — JWT + Zustand + Axios

### Arquitectura
```
Login page (user selector) → API /v1/auth/login → accessToken (15min) + refreshToken (7d, httpOnly cookie)
                                           ↓
                               Zustand authStore (accessToken en memoria)
                                           ↓
                               Axios interceptor (adjunta Bearer token a cada request)
                                           ↓
                               401 → intenta refresh → si falla → logout
```

### Zustand Auth Store (`src/features/auth/store.ts`)
```typescript
interface AuthState {
  user: Usuario | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### Axios Instance (`src/lib/auth/axios-instance.ts`)
```typescript
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

// Request interceptor: adjunta Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: 401 → intenta refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await useAuthStore.getState().refresh();
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Route Protection (`src/middleware.ts`)
- `/dashboard/*` → requiere autenticación
- `/auth/*` → público
- Sin token → redirect a `/auth/login`

### Roles
- **SOCIO**: acceso total a todos los features
- **COLABORADOR**: solo ve sus clientes/tareas asignados (el backend filtra por `usuarioId`)

## Data Fetching — API Real

### Service Layer Pattern (igual que el template, pero con Axios)

```
src/features/<name>/api/
  types.ts      ← Tipos (response shapes, filters, payloads)
  service.ts    ← Funciones que llaman a la API via axios-instance
  queries.ts    ← React Query options + key factories
  mutations.ts  ← Mutation options (create/update/delete)
```

**`service.ts` — llamadas reales al backend NestJS**:
```typescript
import api from '@/lib/auth/axios-instance'; // NO usar fetch, NO mock data
import type { Cliente, ClienteFilters } from './types';

export async function getClientes(filters: ClienteFilters): Promise<{ data: Cliente[]; meta: PaginationMeta }> {
  const { data } = await api.get('/v1/clientes', { params: filters });
  return data; // ya viene con el envelope { data: [...], meta: {...} }
}

export async function getCliente(id: string): Promise<Cliente> {
  const { data } = await api.get(`/v1/clientes/${id}`);
  return data.data; // el backend envuelve en { data: {...} }
}

export async function createCliente(payload: CreateClientePayload): Promise<Cliente> {
  const { data } = await api.post('/v1/clientes', payload);
  return data.data;
}
```

**Rutas API backend**: siempre `/v1/<recurso>` (kebab-case plural). Ver `apps/api/AGENTS.md` para endpoints disponibles.

### React Query (mismo patrón del template)

- Server: `void queryClient.prefetchQuery(options)` + `HydrationBoundary` + `dehydrate`
- Client: `useSuspenseQuery(options)` + `<Suspense fallback={...}>`
- Mutations: `useMutation({ mutationFn, onSuccess: invalidateQueries })`
- Query key factories con invalidación jerárquica

### URL State (nuqs)

- `searchParamsCache` en server components
- `useQueryState` + `shallow: true` en client components
- Tablas: `page`, `perPage`, `sort`, filtros en URL

## Project Structure (actual)

```
src/
├── app/
│   ├── auth/
│   │   └── login/          ← Login page con user selector
│   └── dashboard/
│       ├── overview/       ← Dashboard con métricas
│       ├── clientes/       ← CRUD clientes (Etapa 1)
│       └── ...
├── components/
│   ├── ui/                 ← shadcn/ui (NO modificar)
│   ├── layout/             ← Sidebar, header, PageContainer
│   ├── icons.tsx           ← Registro central de iconos (Tabler)
│   └── ...
├── features/
│   ├── auth/               ← Login + auth store
│   ├── users/              ← Gestión de usuarios (React Query + nuqs)
│   │   ├── api/{types, service, queries, mutations}
│   │   └── components/     ← Table, form, cell-action
│   ├── clientes/           ← CRUD clientes (en desarrollo)
│   │   └── api/{types, service, queries, mutations}
│   └── ...
├── config/
│   └── nav-config.ts       ← Navegación con roles
├── hooks/
│   ├── use-nav.ts          ← Filtrado de nav por rol (SOCIO/COLABORADOR)
│   └── use-data-table.ts   ← Estado de tabla
├── lib/
│   ├── auth/
│   │   └── axios-instance.ts  ← Axios con interceptor JWT
│   ├── utils.ts            ← cn(), formatters
│   └── searchparams.ts     ← Search param utilities
├── middleware.ts            ← Protección de rutas
└── providers.tsx            ← QueryProvider + AuthProvider + ThemeProvider
```

## Navegación y RBAC

`nav-config.ts` usa `roles` array (no Clerk access properties):

```typescript
export const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { title: 'Dashboard', url: '/dashboard/overview', icon: 'dashboard', roles: ['SOCIO', 'COLABORADOR'] },
      { title: 'Clientes', url: '/dashboard/clientes', icon: 'users', roles: ['SOCIO', 'COLABORADOR'] },
      { title: 'Usuarios', url: '/dashboard/users',   icon: 'user',  roles: ['SOCIO'] }, // solo SOCIO
    ]
  }
];
```

`use-nav.ts` filtra según `authStore.user.role`. Sin rol → hidden. Esto es UX; la seguridad real está en el backend.

## Convenciones Específicas del Frontend

### Iconos
- **Siempre** `import { Icons } from '@/components/icons'`
- **Nunca** `import { IconX } from '@tabler/icons-react'` directo
- Para agregar: registrar en `icons.tsx` → usar `Icons.keyName`

### Formularios
- `useAppForm` de `@/components/ui/tanstack-form` + Zod schemas en `features/<name>/schemas/`
- Submit buttons: usar `SubmitButton` (maneja `isSubmitting` automático)
- **Nunca** usar `useState` dentro de `AppField` render props

### Tablas
- Column definitions en `features/<name>/components/<name>-tables/columns.tsx`
- `DataTable` de `@/components/ui/table/data-table.tsx`
- Filtros via nuqs search params, no estado local

### Page Headers
- Usar props de `PageContainer`: `pageTitle`, `pageDescription`, `pageHeaderAction`
- **Nunca** importar `<Heading>` manualmente

### Estilos
- `cn()` para class merging, nunca concatenación manual
- `'use client'` solo cuando se usan hooks/browser APIs
- Server components por defecto

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1    # URL del backend NestJS
NEXT_PUBLIC_SENTRY_DSN=...                       # Opcional
NEXT_PUBLIC_SENTRY_DISABLED="true"               # Deshabilitar en dev
```

**Ya NO usa**: `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`.

## Build & Development

```bash
pnpm dev            # desde raíz del monorepo (Turborepo)
pnpm build          # build completo
pnpm lint           # ESLint
# O desde apps/web directamente:
bun run dev         # Next.js dev server en :3000
bun run build
```

## Testing

**NO escribir tests a menos que el usuario lo pida explícitamente.** Cuando se pidan: Vitest recomendado.

## Reglas para el Agente IA (frontend)

1. **Nunca importar de `@/constants/mock-api*`** — todo va por `axios-instance` al backend real
2. **Nunca referenciar Clerk** — no existe en el proyecto
3. **Nunca importar iconos directo** de `@tabler/icons-react`
4. **Nunca modificar `src/components/ui/`** — extender, no modificar
5. **Seguir el patrón de service layer**: types → service → queries → mutations → components
6. **Leer `apps/api/AGENTS.md`** para conocer los endpoints disponibles antes de crear un service
7. **Un feature a la vez**: no tocar múltiples features sin pedirlo
8. **Nuevos features** van en `src/features/<name>/`, páginas en `src/app/dashboard/<name>/`
9. **Navegación** se registra en `src/config/nav-config.ts` con `roles: ['SOCIO']` o `['SOCIO', 'COLABORADOR']`
10. **Variables de entorno**: `NEXT_PUBLIC_` para client-side, sin prefijo para server-side

## Errores Comunes (Pitfalls)

1. Usar `fetch()` en vez de `axios-instance` → no tiene interceptor JWT, no maneja refresh
2. Importar de `@/constants/mock-api*` → son datos falsos del template, el backend es real
3. Asumir que Clerk existe → no hay `useAuth()`, `useUser()`, `@clerk/nextjs`
4. Usar `useQuery` en vez de `useSuspenseQuery` → rompe el patrón de streaming SSR
5. No poner `@Expose()` en DTOs del backend → el frontend recibe campos vacíos
6. Olvidar el prefijo `/v1/` en las llamadas a la API
7. Formato de respuesta: el backend envía `{ data: T, meta?: PaginationMeta }` — siempre destructurar `{ data }`
