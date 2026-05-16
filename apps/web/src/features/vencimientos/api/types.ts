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
  impuesto?: string;
  anio?: number;
  mes?: number;
  digitoCuit?: number;
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
