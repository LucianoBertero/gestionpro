import type { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';

export type ParentType = 'cliente' | 'tarea' | 'liquidacion' | 'estudio';

export type ArchivoParent =
    | { type: 'cliente'; id: number }
    | { type: 'tarea'; id: number }
    | { type: 'liquidacion'; id: number }
    | { type: 'estudio' };

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

export interface ArchivoParentInfo {
    type: ParentType;
    id?: number;
    name?: string;
}
