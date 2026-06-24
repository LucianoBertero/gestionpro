import api from '@/lib/auth/axios-instance';
import type {
  Archivo,
  ArchivoListFilters,
  ArchivoListResponse,
  ArchivoParent,
  TipoArchivo,
} from './types';

/**
 * Upload a file via multipart/form-data POST to /v1/archivos.
 */
export async function uploadArchivo(
  file: File,
  parent: ArchivoParent,
  tipo?: TipoArchivo,
  periodo?: string,
): Promise<Archivo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('parent', JSON.stringify(parent));
  if (tipo) formData.append('tipo', tipo);
  if (periodo) formData.append('periodo', periodo);

  const { data } = await api.post('/v1/archivos', formData);
  return data.data;
}

/**
 * Global file browser with filters.
 */
export async function getArchivos(
  filters: ArchivoListFilters,
): Promise<ArchivoListResponse> {
  const params: Record<string, unknown> = {};
  if (filters.search) params.search = filters.search;
  if (filters.tipo && filters.tipo !== 'all') params.tipo = filters.tipo;
  if (filters.parentType && filters.parentType !== 'all')
    params.parentType = filters.parentType;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const { data } = await api.get('/v1/archivos', { params });
  // Backend returns { data: items[], total, page, limit } wrapped in NestJS envelope
  return data.data as ArchivoListResponse;
}

export async function getArchivo(id: number): Promise<Archivo> {
  const { data } = await api.get(`/v1/archivos/${id}`);
  return data.data;
}

export async function deleteArchivo(id: number): Promise<void> {
  await api.delete(`/v1/archivos/${id}`);
}
