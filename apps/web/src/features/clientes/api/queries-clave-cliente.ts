import { queryOptions, useQuery } from '@tanstack/react-query';
import { getClavesCliente } from './service-clave-cliente';

export const clavesClienteKeys = {
  all: ['claves-cliente'] as const,
  byCliente: (clienteId: number) => [...clavesClienteKeys.all, { clienteId }] as const,
};

export const clavesClienteOptions = (clienteId: number) =>
  queryOptions({
    queryKey: clavesClienteKeys.byCliente(clienteId),
    queryFn: () => getClavesCliente(clienteId),
  });

export function useClavesCliente(clienteId: number) {
  return useQuery(clavesClienteOptions(clienteId));
}
