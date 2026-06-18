import { queryOptions } from '@tanstack/react-query';
import { getClaves, getClave } from './service';
import type { Clave } from './types';

export type { Clave };

export const claveKeys = {
  all: ['claves'] as const,
  list: () => [...claveKeys.all, 'list'] as const,
  detail: (id: string) => [...claveKeys.all, 'detail', id] as const,
};

export const clavesQueryOptions = () =>
  queryOptions({
    queryKey: claveKeys.list(),
    queryFn: getClaves,
  });

export const claveQueryOptions = (id: string) =>
  queryOptions({
    queryKey: claveKeys.detail(id),
    queryFn: () => getClave(id),
  });
