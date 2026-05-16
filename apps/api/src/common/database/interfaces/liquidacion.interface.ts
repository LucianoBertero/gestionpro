import type { Liquidacion } from '@prisma/client';
import type { ResultadoLiq } from '../enums/resultado-liq.enum';
import type { TipoImpuesto } from '../enums/tipo-impuesto.enum';

export type LiquidacionEntity = Liquidacion;

export interface CreateLiquidacionInput {
    estudioId?: number;
    clienteId: number;
    impuesto: TipoImpuesto;
    periodo: string;
    resultado: ResultadoLiq;
    importe?: number | null;
    importeRef?: number | null;
    vencimiento?: Date | string | null;
    formaPago?: string | null;
    comprobante?: string | null;
    cargadoPorId: string;
    origenCarga?: string;
}

export interface UpdateLiquidacionInput {
    impuesto?: TipoImpuesto;
    periodo?: string;
    resultado?: ResultadoLiq;
    importe?: number | null;
    importeRef?: number | null;
    vencimiento?: Date | string | null;
    formaPago?: string | null;
    comprobante?: string | null;
    origenCarga?: string;
    activo?: boolean;
}

export interface LiquidacionFindAllOptions {
    skip?: number;
    take?: number;
    clienteId?: number;
    periodo?: string;
    impuesto?: TipoImpuesto;
}
