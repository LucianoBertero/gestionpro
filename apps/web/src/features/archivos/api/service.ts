import api from '@/lib/auth/axios-instance';
import type { Archivo, ArchivoFilters, ArchivoParent, TipoArchivo } from './types';

/**
 * Upload a file via multipart/form-data POST to /v1/archivos.
 *
 * Uses `api` (JWT-aware axios-instance) so the auth interceptor attaches
 * the Bearer token and the refresh interceptor handles 401s automatically.
 *
 * The `Content-Type` header is intentionally NOT set — the browser sets
 * the correct multipart boundary for FormData.
 */
export async function uploadArchivo(
  file: File,
  parent: ArchivoParent,
  tipo?: TipoArchivo,
  periodo?: string
): Promise<Archivo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('parent', JSON.stringify(parent));
  if (tipo) formData.append('tipo', tipo);
  if (periodo) formData.append('periodo', periodo);

  const { data } = await api.post('/v1/archivos', formData);
  return data.data;
}

export async function getArchivos(filters?: ArchivoFilters): Promise<Archivo[]> {
  const { data } = await api.get('/v1/archivos', { params: filters });
  return data.data;
}

export async function getArchivo(id: number): Promise<Archivo> {
  const { data } = await api.get(`/v1/archivos/${id}`);
  return data.data;
}

export async function deleteArchivo(id: number): Promise<void> {
  await api.delete(`/v1/archivos/${id}`);
}
