import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createComunicacion, updateComunicacion, deleteComunicacion } from './service';
import { comunicacionKeys } from './queries';
import type { CreateComunicacionPayload, UpdateComunicacionPayload } from './types';

export const createComunicacionMutation = mutationOptions({
  mutationFn: (data: CreateComunicacionPayload) => createComunicacion(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: comunicacionKeys.all });
  },
});

export const updateComunicacionMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: UpdateComunicacionPayload }) =>
    updateComunicacion(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: comunicacionKeys.all });
  },
});

export const deleteComunicacionMutation = mutationOptions({
  mutationFn: (id: number) => deleteComunicacion(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: comunicacionKeys.all });
  },
});
