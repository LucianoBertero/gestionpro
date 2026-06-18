import { queryOptions } from '@tanstack/react-query';
import {
  getHistorialImpuesto,
  getImpuestosConEstado,
  marcarImpuestoPresentado,
} from './service-impuestos-estado';

export const impuestosEstadoKeys = {
  all: ['impuestos-estado'] as const,
  byCliente: (clienteId: number) =>
    [...impuestosEstadoKeys.all, 'cliente', clienteId] as const,
  historial: (clienteId: number, clienteImpuestoId: number) =>
    [
      ...impuestosEstadoKeys.byCliente(clienteId),
      'historial',
      clienteImpuestoId,
    ] as const,
};

export const impuestosConEstadoQueryOptions = (clienteId: number) =>
  queryOptions({
    queryKey: impuestosEstadoKeys.byCliente(clienteId),
    queryFn: () => getImpuestosConEstado(clienteId),
    staleTime: 30 * 1000,
  });

export const historialImpuestoQueryOptions = (
  clienteId: number,
  clienteImpuestoId: number
) =>
  queryOptions({
    queryKey: impuestosEstadoKeys.historial(clienteId, clienteImpuestoId),
    queryFn: () => getHistorialImpuesto(clienteId, clienteImpuestoId),
    enabled: clienteImpuestoId > 0,
  });

export { marcarImpuestoPresentado };
