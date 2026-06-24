import { queryOptions } from '@tanstack/react-query';
import { getArchivos, getArchivo } from './service';
import type { ArchivoListFilters } from './types';

export const archivosKeys = {
  all: ['archivos'] as const,
  list: (filters?: ArchivoListFilters) =>
    [...archivosKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...archivosKeys.all, 'detail', id] as const,
};

export const archivosQueryOptions = (filters: ArchivoListFilters) =>
  queryOptions({
    queryKey: archivosKeys.list(filters),
    queryFn: () => getArchivos(filters),
  });

export const archivoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: archivosKeys.detail(id),
    queryFn: () => getArchivo(id),
  });
