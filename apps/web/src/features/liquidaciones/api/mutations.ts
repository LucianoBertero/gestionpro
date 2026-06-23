import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createLiquidacion, updateLiquidacion, deleteLiquidacion, attachArchivoLiquidacion, detachArchivoLiquidacion } from './service';
import { liquidacionesKeys, archivosLiquidacionKeys } from './queries';
import type { CreateLiquidacionPayload, UpdateLiquidacionPayload } from './types';

export const createLiqMutation = mutationOptions({
  mutationFn: (data: CreateLiquidacionPayload) => createLiquidacion(data),
  onSuccess: () => { getQueryClient().invalidateQueries({ queryKey: liquidacionesKeys.all }); },
});
export const updateLiqMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: UpdateLiquidacionPayload }) => updateLiquidacion(id, values),
  onSuccess: () => { getQueryClient().invalidateQueries({ queryKey: liquidacionesKeys.all }); },
});
export const deleteLiqMutation = mutationOptions({
  mutationFn: (id: number) => deleteLiquidacion(id),
  onSuccess: () => { getQueryClient().invalidateQueries({ queryKey: liquidacionesKeys.all }); },
});

// ─── Archivos ────────────────────────────────────────────────────────

export const attachArchivoLiqMutation = mutationOptions({
  mutationFn: ({ liquidacionId, archivoId, orden }: { liquidacionId: number; archivoId: number; orden?: number }) =>
    attachArchivoLiquidacion(liquidacionId, archivoId, orden),
  onSuccess: (_data, variables) => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: archivosLiquidacionKeys.root });
    qc.invalidateQueries({ queryKey: liquidacionesKeys.all });
  },
});

export const detachArchivoLiqMutation = mutationOptions({
  mutationFn: ({ liquidacionId, archivoId }: { liquidacionId: number; archivoId: number }) =>
    detachArchivoLiquidacion(liquidacionId, archivoId),
  onSuccess: (_data, variables) => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: archivosLiquidacionKeys.root });
    qc.invalidateQueries({ queryKey: liquidacionesKeys.all });
  },
});
