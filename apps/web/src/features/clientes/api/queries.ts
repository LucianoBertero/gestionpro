import { queryOptions } from '@tanstack/react-query';
import { getClientes, getCliente, getLegajo, getNotas } from './service';
import { getActiveUsers } from '@/features/auth/api/service';
import type { Cliente, ClienteFilters, ClienteLegajo } from './types';

export type { Cliente, ClienteLegajo };

export const clientesKeys = {
  all: ['clientes'] as const,
  list: (filters?: ClienteFilters) =>
    [...clientesKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...clientesKeys.all, 'detail', id] as const,
  legajo: (id: number) => [...clientesKeys.all, 'legajo', id] as const,
};

export const clientesQueryOptions = (filters?: ClienteFilters) =>
  queryOptions({
    queryKey: clientesKeys.list(filters),
    queryFn: () => getClientes(filters ?? {}),
  });

export const clienteQueryOptions = (id: number) =>
  queryOptions({
    queryKey: clientesKeys.detail(id),
    queryFn: () => getCliente(id),
  });

export const legajoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: clientesKeys.legajo(id),
    queryFn: () => getLegajo(id),
    // 60s — cambios a un cliente son poco frecuentes y la cache se
    // invalida explícitamente con las mutaciones de update.
    staleTime: 60 * 1000,
  });

export const notasKeys = {
  all: ['notas'] as const,
  byCliente: (clienteId: number) => [...notasKeys.all, 'cliente', clienteId] as const,
};

export const notasQueryOptions = (clienteId: number) =>
  queryOptions({
    queryKey: notasKeys.byCliente(clienteId),
    queryFn: () => getNotas(clienteId),
    // 60s — las notas cambian con poca frecuencia, y la cache se
    // invalida explícitamente cuando se crea/edita/elimina.
    staleTime: 60 * 1000,
  });

export const activeUsersQueryOptions = () =>
  queryOptions({
    queryKey: ['users', 'active'],
    queryFn: getActiveUsers,
    staleTime: 5 * 60 * 1000,
  });
