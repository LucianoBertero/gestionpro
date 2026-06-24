import type { TipoImpuesto } from '@/constants';

export interface Vencimiento {
  id: number;
  impuesto: string;
  anio: number;
  mes: number;
  digitoCuit: number;
  fechaVence: string;
  creadoEn: string;
}

export interface VencimientoFilters {
  impuesto?: TipoImpuesto;
  anio?: number;
  mes?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface VencimientoCliente {
  id: number;
  denominacion: string;
  cuit: string;
}

export interface VencimientoConClientes {
  id: number;
  impuesto: TipoImpuesto;
  anio: number;
  mes: number;
  digitoCuit: number;
  fechaVence: string;
  clientes: VencimientoCliente[];
}

export interface VencimientosListMeta {
  total: number;
  skip: number;
  take: number;
}

export interface VencimientosListResponse {
  data: VencimientoConClientes[];
  total: number;
  skip: number;
  take: number;
}

export interface CalendarioVencimientoRow {
  impuesto: string;
  anio: number;
  mes: number;
  digitoCuit: number;
  fechaVence: string;
}

export interface ImportResult {
  created: number;
  errors: string[];
}
