import { queryOptions } from '@tanstack/react-query';
import { getLiquidaciones, getLiquidacion } from './service';
import type { LiquidacionFilters } from './types';

export const liquidacionesKeys = {
  all: ['liquidaciones'] as const,
  list: (f?: LiquidacionFilters) => [...liquidacionesKeys.all, 'list', f ?? {}] as const,
};

export const liquidacionesQueryOptions = (filters?: LiquidacionFilters) =>
  queryOptions({ queryKey: liquidacionesKeys.list(filters), queryFn: () => getLiquidaciones(filters ?? {}) });
