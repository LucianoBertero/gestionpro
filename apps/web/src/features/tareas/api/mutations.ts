import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createTarea, updateTarea, completarTarea, deleteTarea } from './service';
import { tareasKeys } from './queries';
import type { CreateTareaPayload, UpdateTareaPayload } from './types';

export const createTareaMutation = mutationOptions({
  mutationFn: (data: CreateTareaPayload) => createTarea(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: tareasKeys.all, refetchType: 'active' });
  },
});

export const updateTareaMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: number;
    values: UpdateTareaPayload;
  }) => updateTarea(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: tareasKeys.all, refetchType: 'active' });
  },
});

export const completarTareaMutation = mutationOptions({
  mutationFn: (id: number) => completarTarea(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: tareasKeys.all, refetchType: 'active' });
  },
});

export const deleteTareaMutation = mutationOptions({
  mutationFn: (id: number) => deleteTarea(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: tareasKeys.all, refetchType: 'active' });
  },
});
