import api from '@/lib/auth/axios-instance';
import type { Vencimiento, VencimientoFilters, CalendarioVencimientoRow, ImportResult } from './types';

export async function getVencimientos(filters?: VencimientoFilters): Promise<Vencimiento[]> {
  const { data } = await api.get('/v1/vencimientos', { params: filters });
  return data.data;
}

export async function importExcel(
  rows: CalendarioVencimientoRow[]
): Promise<ImportResult> {
  const { data } = await api.post('/v1/admin/vencimientos/import', { rows });
  return data.data;
}

export async function getVencimiento(id: number): Promise<Vencimiento> {
  const { data } = await api.get(`/v1/vencimientos/${id}`);
  return data.data;
}
