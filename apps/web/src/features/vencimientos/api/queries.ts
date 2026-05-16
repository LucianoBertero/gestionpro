import { queryOptions } from '@tanstack/react-query';
import { getVencimientos, getVencimiento } from './service';
import type { VencimientoFilters } from './types';

export const vencimientosKeys = {
  all: ['vencimientos'] as const,
  list: (filters?: VencimientoFilters) => [...vencimientosKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...vencimientosKeys.all, 'detail', id] as const,
};

export const vencimientosQueryOptions = (filters?: VencimientoFilters) =>
  queryOptions({
    queryKey: vencimientosKeys.list(filters),
    queryFn: () => getVencimientos(filters),
  });

export const vencimientoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: vencimientosKeys.detail(id),
    queryFn: () => getVencimiento(id),
  });
