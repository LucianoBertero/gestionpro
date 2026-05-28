/**
 * Semáforo domain constants.
 */

export const SEMAFORO_VALUES = ['VERDE', 'AMARILLO', 'ROJO'] as const;
export type EstadoSemaforo = (typeof SEMAFORO_VALUES)[number];

export const SEMAFORO_LABELS: Record<EstadoSemaforo, string> = {
  VERDE: 'Verde',
  AMARILLO: 'Amarillo',
  ROJO: 'Rojo',
};
