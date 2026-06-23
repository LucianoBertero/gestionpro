export type TipoArchivo = 'COMPROBANTE' | 'DDJJ' | 'CONTRATO' | 'OTRO';

export type ArchivoParent =
  | { type: 'cliente'; id: number }
  | { type: 'tarea'; id: number }
  | { type: 'liquidacion'; id: number };

export interface Archivo {
  id: number;
  storageKey: string;
  mimeType: string;
  extension: string;
  bytes: number;
  originalName: string;
  tipo: TipoArchivo;
  periodo: string | null;
  parent: ArchivoParent;
  subidoPorId: string;
  activo: boolean;
  creadoEn: string;
  /** Signed URL for reading from R2 — 5-min TTL. Present on GET single / upload responses. */
  signedUrl?: string;
}

export interface ArchivoFilters {
  parentType?: ArchivoParent['type'];
  parentId?: number;
}
