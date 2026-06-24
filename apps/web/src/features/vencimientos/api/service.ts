import api from '@/lib/auth/axios-instance';
import type {
  Vencimiento,
  VencimientoFilters,
  VencimientosListResponse,
  CalendarioVencimientoRow,
  ImportResult,
  CreateVencimientoPayload,
  DuplicateYearPayload,
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

export async function createVencimiento(
  payload: CreateVencimientoPayload,
): Promise<Vencimiento> {
  const { data } = await api.post('/v1/admin/vencimientos', payload);
  return data.data;
}

export async function createVencimientosBatch(
  payloads: CreateVencimientoPayload[],
): Promise<{ created: number }> {
  const { data } = await api.post('/v1/admin/vencimientos/batch', { rows: payloads });
  return data.data ?? { created: payloads.length };
}

export async function duplicateVencimientosYear(
  payload: DuplicateYearPayload,
): Promise<{ created: number }> {
  const { data } = await api.post('/v1/admin/vencimientos/duplicate', payload);
  return data.data ?? { created: 0 };
}
