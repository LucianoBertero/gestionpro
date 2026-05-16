import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createLiquidacion, updateLiquidacion, deleteLiquidacion } from './service';
import { liquidacionesKeys } from './queries';
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
