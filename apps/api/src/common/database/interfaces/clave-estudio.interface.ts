export interface ClaveEstudioEntity {
    id: string;
    estudioId: number;
    entidad: string;
    clave: string;
    creadoPorId: string;
    creadoEn: Date;
    actualizadoEn: Date;
}

export interface CreateClaveInput {
    entidad: string;
    clave: string;
    creadoPorId: string;
}

export interface UpdateClaveInput {
    entidad?: string;
    clave?: string;
}
