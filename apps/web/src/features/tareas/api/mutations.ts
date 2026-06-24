import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createTarea, updateTarea, completarTarea, deleteTarea, attachArchivoTarea, detachArchivoTarea } from './service';
import { tareasKeys, archivosTareaKeys } from './queries';
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

// ─── Archivos ────────────────────────────────────────────────────────

export const attachArchivoTareaMutation = mutationOptions({
  mutationFn: ({ tareaId, archivoId, orden }: { tareaId: number; archivoId: number; orden?: number }) =>
    attachArchivoTarea(tareaId, archivoId, orden),
  onSuccess: (_data, variables) => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: archivosTareaKeys.root });
    qc.invalidateQueries({ queryKey: tareasKeys.detail(variables.tareaId) });
  },
});

export const detachArchivoTareaMutation = mutationOptions({
  mutationFn: ({ tareaId, archivoId }: { tareaId: number; archivoId: number }) =>
    detachArchivoTarea(tareaId, archivoId),
  onSuccess: (_data, variables) => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: archivosTareaKeys.root });
    qc.invalidateQueries({ queryKey: tareasKeys.detail(variables.tareaId) });
  },
});
