import { queryOptions } from '@tanstack/react-query';
import { getLiquidaciones, getLiquidacion, getArchivosLiquidacion } from './service';
import type { LiquidacionFilters } from './types';

export const liquidacionesKeys = {
  all: ['liquidaciones'] as const,
  list: (f?: LiquidacionFilters) => [...liquidacionesKeys.all, 'list', f ?? {}] as const,
};

export const liquidacionesQueryOptions = (filters?: LiquidacionFilters) =>
  queryOptions({ queryKey: liquidacionesKeys.list(filters), queryFn: () => getLiquidaciones(filters ?? {}) });

// ─── Archivos ──────────────────────────────────────────────────────

export const archivosLiquidacionKeys = {
  root: ['liquidaciones', 'archivos'] as const,
  byLiquidacion: (liquidacionId: number) => [...archivosLiquidacionKeys.root, liquidacionId] as const,
};

export const archivosLiquidacionQueryOptions = (liquidacionId: number) =>
  queryOptions({
    queryKey: archivosLiquidacionKeys.byLiquidacion(liquidacionId),
    queryFn: () => getArchivosLiquidacion(liquidacionId),
    enabled: !!liquidacionId,
  });
