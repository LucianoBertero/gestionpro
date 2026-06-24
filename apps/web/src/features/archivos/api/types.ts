export type TipoArchivo = 'COMPROBANTE' | 'DDJJ' | 'CONTRATO' | 'OTRO';

export type ArchivoParent =
  | { type: 'cliente'; id: number }
  | { type: 'tarea'; id: number }
  | { type: 'liquidacion'; id: number }
  | { type: 'estudio' };

export interface Archivo {
  id: number;
  storageKey: string;
  mimeType: string;
  extension: string;
  bytes: number;
  originalName: string;
  tipo: TipoArchivo;
  periodo: string | null;
  subidoPorId: string;
  subidoPorNombre?: string | null;
  activo: boolean;
  creadoEn: string;
  signedUrl?: string;
}

export interface ArchivoParentInfo {
  type: ArchivoParent['type'];
  id?: number;
  name?: string;
}

export interface ArchivoWithParent extends Archivo {
  parent: ArchivoParentInfo;
}

export interface ArchivoListFilters {
  search?: string;
  tipo?: TipoArchivo | 'all';
  parentType?: 'all' | 'cliente' | 'tarea' | 'liquidacion' | 'estudio';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ArchivoListResponse {
  data: ArchivoWithParent[];
  total: number;
  page: number;
  limit: number;
}
