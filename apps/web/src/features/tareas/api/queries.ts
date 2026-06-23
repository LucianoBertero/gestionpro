import { queryOptions } from '@tanstack/react-query';
import { getTareas, getTarea, getArchivosTarea } from './service';
import type { Tarea, TareaFilters } from './types';

export type { Tarea };

export const tareasKeys = {
  all: ['tareas'] as const,
  list: (filters?: TareaFilters) =>
    [...tareasKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...tareasKeys.all, 'detail', id] as const,
};

export const tareasQueryOptions = (filters?: TareaFilters) =>
  queryOptions({
    queryKey: tareasKeys.list(filters),
    queryFn: async () => {
      const tareas = await getTareas(filters ?? {});
      return { data: tareas, total: tareas.length };
    },
    // 60s — la lista de tareas cambia con moderación, y la cache se
    // invalida explícitamente con las mutaciones de CRUD.
    staleTime: 60 * 1000,
  });

export const tareaQueryOptions = (id: number) =>
  queryOptions({
    queryKey: tareasKeys.detail(id),
    queryFn: () => getTarea(id),
    enabled: !!id,
  });

// ─── Archivos ──────────────────────────────────────────────────────

export const archivosTareaKeys = {
  root: ['tareas', 'archivos'] as const,
  byTarea: (tareaId: number) => [...archivosTareaKeys.root, tareaId] as const,
};

export const archivosTareaQueryOptions = (tareaId: number) =>
  queryOptions({
    queryKey: archivosTareaKeys.byTarea(tareaId),
    queryFn: () => getArchivosTarea(tareaId),
    enabled: !!tareaId,
  });
