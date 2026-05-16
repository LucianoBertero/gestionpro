import api from '@/lib/auth/axios-instance';
import type { Archivo, ArchivoFilters, CreateArchivoPayload } from './types';

export async function getArchivos(filters?: ArchivoFilters): Promise<Archivo[]> {
  const { data } = await api.get('/v1/archivos', { params: filters });
  return data.data;
}

export async function getArchivo(id: number): Promise<Archivo> {
  const { data } = await api.get(`/v1/archivos/${id}`);
  return data.data;
}

export async function createArchivo(payload: CreateArchivoPayload): Promise<Archivo> {
  const { data } = await api.post('/v1/archivos', payload);
  return data.data;
}

export async function deleteArchivo(id: number): Promise<void> {
  await api.delete(`/v1/archivos/${id}`);
}
