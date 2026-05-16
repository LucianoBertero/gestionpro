import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { importExcel } from './service';
import { vencimientosKeys } from './queries';
import type { CalendarioVencimientoRow } from './types';

export const importExcelMutation = mutationOptions({
  mutationFn: (rows: CalendarioVencimientoRow[]) => importExcel(rows),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: vencimientosKeys.all });
  },
});
