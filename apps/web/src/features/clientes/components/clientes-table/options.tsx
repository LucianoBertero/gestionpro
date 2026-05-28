import { SEMAFORO_VALUES, SEMAFORO_LABELS } from '@/constants';

export const SEMAFORO_OPTIONS = SEMAFORO_VALUES.map((value) => ({
  value,
  label: SEMAFORO_LABELS[value],
}));
