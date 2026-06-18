// ============================================================
// Impuestos Estado — Frontend
// Estado derivado (no persistido) por impuesto del cliente.
// ============================================================

import type { TipoImpuesto, ResultadoLiquidacion } from '@/constants';

export const ESTADO_IMPUESTO_VALUES = [
  'A_PRESENTAR',
  'PRESENTADO',
  'VENCIDO',
] as const;

export type EstadoImpuesto = (typeof ESTADO_IMPUESTO_VALUES)[number];

export const ESTADO_IMPUESTO_LABELS: Record<EstadoImpuesto, string> = {
  A_PRESENTAR: 'A presentar',
  PRESENTADO: 'Presentado',
  VENCIDO: 'Vencido',
};

export interface LiquidacionEstadoMin {
  id: number;
  periodo: string;
  resultado: ResultadoLiquidacion;
  vencimiento: string | null;
  creadoEn: string;
}

export interface ImpuestoConEstado {
  clienteImpuestoId: number;
  clienteId: number;
  tipo: TipoImpuesto;
  activo: boolean;
  periodoActual: string;
  estado: EstadoImpuesto;
  proximoVencimiento: string | null;
  liquidacionActual: LiquidacionEstadoMin | null;
}

// ─── Liquidacion (para historial) ──────────────────────────────────────────

export interface LiquidacionHistorialItem {
  id: number;
  clienteId: number;
  impuesto: TipoImpuesto;
  periodo: string;
  resultado: ResultadoLiquidacion;
  importe: number | null;
  importeRef: number | null;
  vencimiento: string | null;
  formaPago: string | null;
  comprobante: string | null;
  cargadoPorId: string;
  origenCarga: string;
  activo: boolean;
  creadoEn: string;
}
