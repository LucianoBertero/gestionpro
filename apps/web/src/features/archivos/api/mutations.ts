import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createArchivo, deleteArchivo } from './service';
import { archivosKeys } from './queries';
import type { CreateArchivoPayload } from './types';

export const createArchivoMutation = mutationOptions({
  mutationFn: (data: CreateArchivoPayload) => createArchivo(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: archivosKeys.all });
  },
});

export const deleteArchivoMutation = mutationOptions({
  mutationFn: (id: number) => deleteArchivo(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: archivosKeys.all });
  },
});
