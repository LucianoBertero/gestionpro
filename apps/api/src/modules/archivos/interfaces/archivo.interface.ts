import type { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';

export type ParentType = 'cliente' | 'tarea' | 'liquidacion';

export interface ArchivoParent {
    type: ParentType;
    id: number;
}

export interface CreateArchivoInput {
    storageKey: string;
    mimeType: string;
    extension: string;
    bytes: number;
    originalName: string;
    tipo: TipoArchivo;
    periodo?: string | null;
    subidoPorId: string;
}

export interface ArchivoEntity {
    id: number;
    storageKey: string;
    mimeType: string;
    extension: string;
    bytes: number;
    originalName: string;
    tipo: TipoArchivo;
    periodo: string | null;
    subidoPorId: string;
    activo: boolean;
    creadoEn: Date;
}
