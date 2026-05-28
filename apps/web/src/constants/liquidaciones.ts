/**
 * Liquidaciones domain constants.
 */

export const RESULTADO_LIQUIDACION_VALUES = [
  'A_PAGAR',
  'SALDO_A_FAVOR',
  'SIN_MOVIMIENTO',
] as const;

export type ResultadoLiquidacion = (typeof RESULTADO_LIQUIDACION_VALUES)[number];

export const RESULTADO_LABELS: Record<ResultadoLiquidacion, string> = {
  A_PAGAR: 'A pagar',
  SALDO_A_FAVOR: 'Saldo a favor',
  SIN_MOVIMIENTO: 'Sin movimiento',
};

export type ResultadoBadgeVariant = 'destructive' | 'secondary' | 'outline';

export const RESULTADO_BADGE_VARIANT: Record<ResultadoLiquidacion, ResultadoBadgeVariant> = {
  A_PAGAR: 'destructive',
  SALDO_A_FAVOR: 'secondary',
  SIN_MOVIMIENTO: 'outline',
};
