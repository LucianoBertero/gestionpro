import api from '@/lib/auth/axios-instance';
import type { Clave, CreateClavePayload, UpdateClavePayload } from './types';

export async function getClaves(): Promise<Clave[]> {
  const { data: envelope } = await api.get('/v1/claves');
  return envelope.data as Clave[];
}

export async function getClave(id: string): Promise<Clave> {
  const { data: envelope } = await api.get(`/v1/claves/${id}`);
  return envelope.data as Clave;
}

export async function createClave(payload: CreateClavePayload): Promise<Clave> {
  const { data: envelope } = await api.post('/v1/claves', payload);
  return envelope.data as Clave;
}

export async function updateClave(id: string, payload: UpdateClavePayload): Promise<Clave> {
  const { data: envelope } = await api.patch(`/v1/claves/${id}`, payload);
  return envelope.data as Clave;
}

export async function deleteClave(id: string): Promise<void> {
  await api.delete(`/v1/claves/${id}`);
}
