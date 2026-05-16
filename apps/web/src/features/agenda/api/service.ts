import api from '@/lib/auth/axios-instance';
import type { AgendaItem, AgendaFilters, CreateAgendaPayload, UpdateAgendaPayload } from './types';

export async function getAgendaItems(filters?: AgendaFilters): Promise<AgendaItem[]> {
  const { data } = await api.get('/v1/agenda', { params: filters });
  return data.data;
}

export async function getAgendaItem(id: number): Promise<AgendaItem> {
  const { data } = await api.get(`/v1/agenda/${id}`);
  return data.data;
}

export async function createAgendaItem(payload: CreateAgendaPayload): Promise<AgendaItem> {
  const { data } = await api.post('/v1/admin/agenda', payload);
  return data.data;
}

export async function updateAgendaItem(id: number, payload: UpdateAgendaPayload): Promise<AgendaItem> {
  const { data } = await api.patch(`/v1/admin/agenda/${id}`, payload);
  return data.data;
}

export async function deleteAgendaItem(id: number): Promise<void> {
  await api.delete(`/v1/admin/agenda/${id}`);
}
