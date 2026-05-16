import api from '@/lib/auth/axios-instance';
import type { FinancieroResumen } from './types';

export async function getFinancieroResumen(): Promise<FinancieroResumen> {
  const { data } = await api.get('/v1/financiero/resumen');
  return data.data;
}

export async function getHonorarios(periodoDesde?: string, periodoHasta?: string): Promise<FinancieroResumen['honorarios']> {
  const { data } = await api.get('/v1/financiero/honorarios', { params: { periodoDesde, periodoHasta } });
  return data.data;
}

export async function getRentabilidad(periodoDesde?: string, periodoHasta?: string): Promise<FinancieroResumen['rentabilidad']> {
  const { data } = await api.get('/v1/financiero/rentabilidad', { params: { periodoDesde, periodoHasta } });
  return data.data;
}

export async function getProyeccion(): Promise<FinancieroResumen['proyeccion']> {
  const { data } = await api.get('/v1/financiero/proyeccion');
  return data.data;
}
