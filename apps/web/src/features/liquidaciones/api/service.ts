import api from '@/lib/auth/axios-instance';
import type { Liquidacion, LiquidacionFilters, CreateLiquidacionPayload, UpdateLiquidacionPayload } from './types';

export async function getLiquidaciones(filters: LiquidacionFilters) {
  const { data } = await api.get('/v1/liquidaciones', { params: filters });
  return { data: data.data as Liquidacion[], total: data.data.length };
}
export async function getLiquidacion(id: number): Promise<Liquidacion> {
  const { data } = await api.get(`/v1/liquidaciones/${id}`); return data.data;
}
export async function createLiquidacion(payload: CreateLiquidacionPayload): Promise<Liquidacion> {
  const { data } = await api.post('/v1/admin/liquidaciones', payload); return data.data;
}
export async function updateLiquidacion(id: number, payload: UpdateLiquidacionPayload): Promise<Liquidacion> {
  const { data } = await api.patch(`/v1/admin/liquidaciones/${id}`, payload); return data.data;
}
export async function deleteLiquidacion(id: number): Promise<void> {
  await api.delete(`/v1/admin/liquidaciones/${id}`);
}
