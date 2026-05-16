import { queryOptions } from '@tanstack/react-query';
import { getNotificaciones, countNoLeidas } from './service';

export const notificacionesKeys = {
  all: ['notificaciones'] as const,
  list: (skip?: number, take?: number) =>
    [...notificacionesKeys.all, 'list', skip ?? 0, take ?? 50] as const,
  noLeidas: () => [...notificacionesKeys.all, 'no-leidas'] as const,
};

export const notificacionesQueryOptions = (skip = 0, take = 50) =>
  queryOptions({
    queryKey: notificacionesKeys.list(skip, take),
    queryFn: () => getNotificaciones(skip, take),
  });

export const noLeidasCountQueryOptions = () =>
  queryOptions({
    queryKey: notificacionesKeys.noLeidas(),
    queryFn: countNoLeidas,
    refetchInterval: 30000,
  });
