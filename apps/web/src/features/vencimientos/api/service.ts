import api from '@/lib/auth/axios-instance';
import type {
  Vencimiento,
  VencimientoFilters,
  VencimientosListResponse,
  CalendarioVencimientoRow,
  ImportResult,
} from './types';

export async function getVencimientos(
  filters?: VencimientoFilters,
): Promise<VencimientosListResponse> {
  const { data } = await api.get('/v1/vencimientos', { params: filters });
  // Response interceptor wraps: { data, meta: { total, skip, take } }
  return {
    data: data.data,
    total: data.meta?.total ?? 0,
    skip: data.meta?.skip ?? 0,
    take: data.meta?.take ?? 50,
  };
}

export async function importExcel(
  rows: CalendarioVencimientoRow[],
): Promise<ImportResult> {
  const { data } = await api.post('/v1/admin/vencimientos/import', { rows });
  return data.data;
}

export async function getVencimiento(id: number): Promise<Vencimiento> {
  const { data } = await api.get(`/v1/vencimientos/${id}`);
  return data.data;
}
