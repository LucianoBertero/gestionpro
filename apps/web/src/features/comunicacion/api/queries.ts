import { queryOptions } from '@tanstack/react-query';
import { getComunicaciones, getComunicacion } from './service';
import type { ComunicacionFilters } from './types';

export const comunicacionKeys = {
  all: ['comunicaciones'] as const,
  list: (filters?: ComunicacionFilters) => [...comunicacionKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...comunicacionKeys.all, 'detail', id] as const,
};

export const comunicacionesQueryOptions = (filters?: ComunicacionFilters) =>
  queryOptions({
    queryKey: comunicacionKeys.list(filters),
    queryFn: () => getComunicaciones(filters),
  });

export const comunicacionQueryOptions = (id: number) =>
  queryOptions({
    queryKey: comunicacionKeys.detail(id),
    queryFn: () => getComunicacion(id),
  });
