export type TipoArchivo = 'COMPROBANTE' | 'DDJJ' | 'CONTRATO' | 'OTRO';

export interface Archivo {
  id: number;
  clienteId: number;
  nombre: string;
  tipo: TipoArchivo;
  periodo: string | null;
  url: string;
  tamanioKb: number | null;
  subidoPorId: string;
  activo: boolean;
  creadoEn: string;
  subidoPor?: { id: string; nombre: string };
}

export interface CreateArchivoPayload {
  clienteId: number;
  nombre: string;
  tipo: TipoArchivo;
  periodo?: string;
  url: string;
  tamanioKb?: number;
}

export interface ArchivoFilters {
  clienteId?: number;
}
