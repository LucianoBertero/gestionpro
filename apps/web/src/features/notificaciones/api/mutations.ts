import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { marcarLeida, marcarTodasLeidas } from './service';
import { notificacionesKeys } from './queries';

export const marcarLeidaMutation = mutationOptions({
  mutationFn: (id: number) => marcarLeida(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: notificacionesKeys.all });
  },
});

export const marcarTodasLeidasMutation = mutationOptions({
  mutationFn: () => marcarTodasLeidas(),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: notificacionesKeys.all });
  },
});
