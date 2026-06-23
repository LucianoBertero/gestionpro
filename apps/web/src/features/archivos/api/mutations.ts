import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { uploadArchivo, deleteArchivo } from './service';
import { archivosKeys } from './queries';
import type { ArchivoParent, TipoArchivo } from './types';

export const uploadArchivoMutation = mutationOptions({
  mutationFn: ({
    file,
    parent,
    tipo,
    periodo,
  }: {
    file: File;
    parent: ArchivoParent;
    tipo?: TipoArchivo;
    periodo?: string;
  }) => uploadArchivo(file, parent, tipo, periodo),
  onSuccess: (_data, variables) => {
    const queryClient = getQueryClient();
    // Invalidate the archivos list so any parent-filtered query refetches
    queryClient.invalidateQueries({ queryKey: archivosKeys.all });

    // Also invalidate the parent entity's detail cache so file lists update
    const { parent } = variables;
    if (parent.type === 'cliente') {
      queryClient.invalidateQueries({ queryKey: ['clientes', 'detail', parent.id] });
    } else if (parent.type === 'tarea') {
      queryClient.invalidateQueries({ queryKey: ['tareas', 'detail', parent.id] });
    } else if (parent.type === 'liquidacion') {
      queryClient.invalidateQueries({ queryKey: ['liquidaciones', 'detail', parent.id] });
    }
  },
});

export const deleteArchivoMutation = mutationOptions({
  mutationFn: (id: number) => deleteArchivo(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: archivosKeys.all });
  },
});
