import api from '@/lib/auth/axios-instance';
import type { DashboardMetricas, SemaforosData, TareaColaborador, VencimientoSemana } from './types';

export async function getMetricas(): Promise<DashboardMetricas> {
  const { data } = await api.get('/v1/dashboard/metricas');
  return data.data;
}
export async function getSemaforos(): Promise<SemaforosData> {
  const { data } = await api.get('/v1/dashboard/semaforos');
  return data.data;
}
export async function getTareasPorColaborador(): Promise<TareaColaborador[]> {
  const { data } = await api.get('/v1/dashboard/tareas-por-colaborador');
  return data.data;
}
export async function getVencimientosSemana(): Promise<VencimientoSemana[]> {
  const { data } = await api.get('/v1/dashboard/vencimientos-semana');
  return data.data;
}
