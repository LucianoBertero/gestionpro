import api from '@/lib/auth/axios-instance';
import type { Comunicacion, ComunicacionFilters, CreateComunicacionPayload, UpdateComunicacionPayload } from './types';

export async function getComunicaciones(filters?: ComunicacionFilters): Promise<Comunicacion[]> {
  const { data } = await api.get('/v1/comunicaciones', { params: filters });
  return data.data;
}

export async function getComunicacion(id: number): Promise<Comunicacion> {
  const { data } = await api.get(`/v1/comunicaciones/${id}`);
  return data.data;
}

export async function createComunicacion(payload: CreateComunicacionPayload): Promise<Comunicacion> {
  const { data } = await api.post('/v1/comunicaciones', payload);
  return data.data;
}

export async function updateComunicacion(id: number, payload: UpdateComunicacionPayload): Promise<Comunicacion> {
  const { data } = await api.patch(`/v1/comunicaciones/${id}`, payload);
  return data.data;
}

export async function deleteComunicacion(id: number): Promise<void> {
  await api.delete(`/v1/comunicaciones/${id}`);
}
