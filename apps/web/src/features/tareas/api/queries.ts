import { queryOptions } from '@tanstack/react-query';
import { getTareas, getTarea } from './service';
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
  });

export const tareaQueryOptions = (id: number) =>
  queryOptions({
    queryKey: tareasKeys.detail(id),
    queryFn: () => getTarea(id),
    enabled: !!id,
  });
