import api from '@/lib/auth/axios-instance';
import type {
  Tarea,
  TareaFilters,
  CreateTareaPayload,
  UpdateTareaPayload,
} from './types';

export async function getTareas(
  filters: TareaFilters
): Promise<{ data: Tarea[]; total: number }> {
  const { data } = await api.get('/v1/tareas', { params: filters });
  return { data: data.data, total: data.data.length };
}

export async function getTarea(id: number): Promise<Tarea> {
  const { data } = await api.get(`/v1/tareas/${id}`);
  return data.data;
}

export async function createTarea(payload: CreateTareaPayload): Promise<Tarea> {
  const { data } = await api.post('/v1/admin/tareas', payload);
  return data.data;
}

export async function updateTarea(
  id: number,
  payload: UpdateTareaPayload
): Promise<Tarea> {
  const { data } = await api.patch(`/v1/admin/tareas/${id}`, payload);
  return data.data;
}

export async function completarTarea(id: number): Promise<Tarea> {
  const { data } = await api.post(`/v1/admin/tareas/${id}/completar`);
  return data.data;
}

export async function deleteTarea(id: number): Promise<void> {
  await api.delete(`/v1/admin/tareas/${id}`);
}
