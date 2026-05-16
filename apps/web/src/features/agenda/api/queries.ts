import { queryOptions } from '@tanstack/react-query';
import { getAgendaItems, getAgendaItem } from './service';
import type { AgendaFilters } from './types';

export const agendaKeys = {
  all: ['agenda'] as const,
  list: (filters?: AgendaFilters) => [...agendaKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number) => [...agendaKeys.all, 'detail', id] as const,
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
