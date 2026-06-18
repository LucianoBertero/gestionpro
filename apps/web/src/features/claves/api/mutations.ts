import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createClave, updateClave, deleteClave } from './service';
import { claveKeys } from './queries';
import type { CreateClavePayload, UpdateClavePayload } from './types';

export const createClaveMutation = mutationOptions({
  mutationFn: (data: CreateClavePayload) => createClave(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: claveKeys.all });
  },
});

export const updateClaveMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateClavePayload }) =>
    updateClave(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: claveKeys.all });
  },
});

export const deleteClaveMutation = mutationOptions({
  mutationFn: (id: string) => deleteClave(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: claveKeys.all });
  },
});
