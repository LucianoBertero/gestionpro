import { queryOptions } from '@tanstack/react-query';
import { getMetricas, getSemaforos, getTareasPorColaborador, getVencimientosSemana } from './service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metricas: () => [...dashboardKeys.all, 'metricas'] as const,
  semaforos: () => [...dashboardKeys.all, 'semaforos'] as const,
  tareasColaborador: () => [...dashboardKeys.all, 'tareas-colaborador'] as const,
  vencimientosSemana: () => [...dashboardKeys.all, 'vencimientos-semana'] as const,
};

export const metricasQueryOptions = () =>
  queryOptions({ queryKey: dashboardKeys.metricas(), queryFn: getMetricas, staleTime: 60_000 });
export const semaforosQueryOptions = () =>
  queryOptions({ queryKey: dashboardKeys.semaforos(), queryFn: getSemaforos, staleTime: 60_000 });
export const tareasColaboradorQueryOptions = () =>
  queryOptions({ queryKey: dashboardKeys.tareasColaborador(), queryFn: getTareasPorColaborador, staleTime: 60_000 });
export const vencimientosSemanaQueryOptions = () =>
  queryOptions({ queryKey: dashboardKeys.vencimientosSemana(), queryFn: getVencimientosSemana, staleTime: 60_000 });
