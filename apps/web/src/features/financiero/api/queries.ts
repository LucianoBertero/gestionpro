import { queryOptions } from '@tanstack/react-query';
import { getFinancieroResumen, getHonorarios, getRentabilidad, getProyeccion } from './service';

export const financieroKeys = {
  all: ['financiero'] as const,
  resumen: () => [...financieroKeys.all, 'resumen'] as const,
  honorarios: () => [...financieroKeys.all, 'honorarios'] as const,
  rentabilidad: () => [...financieroKeys.all, 'rentabilidad'] as const,
  proyeccion: () => [...financieroKeys.all, 'proyeccion'] as const,
};

export const financieroResumenQueryOptions = () =>
  queryOptions({
    queryKey: financieroKeys.resumen(),
    queryFn: getFinancieroResumen,
    staleTime: 5 * 60 * 1000,
  });

export const honorariosQueryOptions = () =>
  queryOptions({
    queryKey: financieroKeys.honorarios(),
    queryFn: () => getHonorarios(),
    staleTime: 5 * 60 * 1000,
  });

export const rentabilidadQueryOptions = () =>
  queryOptions({
    queryKey: financieroKeys.rentabilidad(),
    queryFn: () => getRentabilidad(),
    staleTime: 5 * 60 * 1000,
  });

export const proyeccionQueryOptions = () =>
  queryOptions({
    queryKey: financieroKeys.proyeccion(),
    queryFn: getProyeccion,
    staleTime: 5 * 60 * 1000,
  });
