import api from '@/lib/auth/axios-instance';
import type { Notificacion } from './types';

export async function getNotificaciones(
  skip = 0,
  take = 50
): Promise<{ data: Notificacion[]; meta: { total: number; noLeidas: number } }> {
  const { data } = await api.get('/v1/notificaciones', { params: { skip, take } });
  return data;
}

export async function getNoLeidas(): Promise<{ data: Notificacion[] }> {
  const { data } = await api.get('/v1/notificaciones/no-leidas');
  return data;
}

export async function countNoLeidas(): Promise<number> {
  const { data } = await api.get('/v1/notificaciones/no-leidas');
  return data.data ?? 0;
}

export async function marcarLeida(id: number): Promise<void> {
  await api.post(`/v1/notificaciones/${id}/leer`);
}

export async function marcarTodasLeidas(): Promise<void> {
  await api.post('/v1/notificaciones/leer-todas');
}
