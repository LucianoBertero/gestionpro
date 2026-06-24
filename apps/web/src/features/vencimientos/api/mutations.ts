import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  importExcel,
  createVencimiento,
  createVencimientosBatch,
  duplicateVencimientosYear,
} from './service';
import { vencimientosKeys } from './queries';
import type {
  CalendarioVencimientoRow,
  CreateVencimientoPayload,
  DuplicateYearPayload,
} from './types';

export const importExcelMutation = mutationOptions({
  mutationFn: (rows: CalendarioVencimientoRow[]) => importExcel(rows),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: vencimientosKeys.all });
  },
});

export const createVencimientoMutation = mutationOptions({
  mutationFn: (data: CreateVencimientoPayload) => createVencimiento(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: vencimientosKeys.all });
  },
});

export const createVencimientosBatchMutation = mutationOptions({
  mutationFn: (data: CreateVencimientoPayload[]) => createVencimientosBatch(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: vencimientosKeys.all });
  },
});

export const duplicateVencimientosYearMutation = mutationOptions({
  mutationFn: (data: DuplicateYearPayload) => duplicateVencimientosYear(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: vencimientosKeys.all });
  },
});
