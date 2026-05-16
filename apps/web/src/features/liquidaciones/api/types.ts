export type TipoImpuesto = 'AUTONOMOS' | 'IVA' | 'IIBB_LOCAL' | 'MUNICIPAL' | 'SUELDOS' | 'MONOTRIBUTO' | 'GANANCIAS';
export type ResultadoLiq = 'A_PAGAR' | 'SALDO_A_FAVOR' | 'SIN_MOVIMIENTO';

export interface Liquidacion {
  id: number; estudioId: number; clienteId: number;
  impuesto: TipoImpuesto; periodo: string; resultado: ResultadoLiq;
  importe: number | null; importeRef: number | null;
  vencimiento: string | null; formaPago: string | null;
  comprobante: string | null; cargadoPorId: string;
  origenCarga: string; activo: boolean; creadoEn: string;
  cliente?: { id: number; denominacion: string } | null;
  cargadoPor?: { id: string; nombre: string } | null;
}

export interface LiquidacionFilters { clienteId?: number; periodo?: string; impuesto?: string; }
export interface CreateLiquidacionPayload { clienteId: number; impuesto: TipoImpuesto; periodo: string; resultado: ResultadoLiq; importe?: number; vencimiento?: string; formaPago?: string; }
export interface UpdateLiquidacionPayload { impuesto?: TipoImpuesto; periodo?: string; resultado?: ResultadoLiq; importe?: number; vencimiento?: string; formaPago?: string; }
