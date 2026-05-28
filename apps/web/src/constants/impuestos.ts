/**
 * TipoImpuesto domain constants.
 * Import from here — single source of truth.
 */

export const TIPO_IMPUESTO_VALUES = [
  'AUTONOMOS',
  'IVA',
  'IIBB_LOCAL',
  'MUNICIPAL',
  'SUELDOS',
  'MONOTRIBUTO',
  'GANANCIAS',
] as const;

export type TipoImpuesto = (typeof TIPO_IMPUESTO_VALUES)[number];

export const TIPO_IMPUESTO_LABELS: Record<TipoImpuesto, string> = {
  AUTONOMOS: 'Autónomos',
  IVA: 'IVA',
  IIBB_LOCAL: 'IIBB Local',
  MUNICIPAL: 'Municipal',
  SUELDOS: 'Sueldos',
  MONOTRIBUTO: 'Monotributo',
  GANANCIAS: 'Ganancias',
};
