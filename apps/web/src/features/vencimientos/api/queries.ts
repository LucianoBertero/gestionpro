import { queryOptions } from '@tanstack/react-query';
import { getVencimientos, getVencimiento } from './service';
import type { VencimientoFilters } from './types';

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const vencimientosKeys = {
  all: ['vencimientos'] as const,
  list: (filters?: VencimientoFilters) =>
    [...vencimientosKeys.all, 'list', filters ?? {}] as const,
  proximos: () => [...vencimientosKeys.all, 'proximos'] as const,
  detail: (id: number) => [...vencimientosKeys.all, 'detail', id] as const,
};

export const vencimientosQueryOptions = (filters?: VencimientoFilters) =>
  queryOptions({
    queryKey: vencimientosKeys.list(filters),
    queryFn: () => getVencimientos(filters),
  });

export const proximosVencimientosQueryOptions = () =>
  queryOptions({
    queryKey: vencimientosKeys.proximos(),
    queryFn: () =>
      getVencimientos({
        dateFrom: todayISO(),
        dateTo: inDays(30),
        limit: 100,
      }),
  });

export const vencimientoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: vencimientosKeys.detail(id),
    queryFn: () => getVencimiento(id),
  });
