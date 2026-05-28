import { queryOptions } from '@tanstack/react-query';
import { getAgendaItems, getAgendaItem, getEquipoItems, getAgendaUsuarios } from './service';
import type { AgendaFilters, AgendaUsuario } from './types';

export { type AgendaUsuario };

export const agendaKeys = {
  all: ['agenda'] as const,
  list: (filters?: AgendaFilters) => [...agendaKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...agendaKeys.all, 'detail', id] as const,
};

export const agendaEquipoKeys = {
  all: ['agenda-equipo'] as const,
  list: (filters?: { fechaDesde?: string; fechaHasta?: string; usuarioId?: string }) =>
    [...agendaEquipoKeys.all, 'list', filters ?? {}] as const,
};

export const agendaItemsQueryOptions = (filters?: AgendaFilters) =>
  queryOptions({
    queryKey: agendaKeys.list(filters),
    queryFn: () => getAgendaItems(filters),
  });

export const agendaItemQueryOptions = (id: number) =>
  queryOptions({
    queryKey: agendaKeys.detail(id),
    queryFn: () => getAgendaItem(id),
  });

export const equipoAgendaQueryOptions = (filters?: {
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: string;
}) =>
  queryOptions({
    queryKey: agendaEquipoKeys.list(filters),
    queryFn: () => getEquipoItems(filters),
  });

export const agendaUsuariosQueryOptions = () =>
  queryOptions({
    queryKey: ['agenda-usuarios'] as const,
    queryFn: () => getAgendaUsuarios(),
  });
