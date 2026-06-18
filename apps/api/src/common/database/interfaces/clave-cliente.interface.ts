export interface ClaveClienteEntity {
    id: string;
    clienteId: number;
    entidad: string;
    clave: string;
    creadoPorId: string;
    creadoEn: Date;
    actualizadoEn: Date;
}

export interface CreateClaveClienteInput {
    clienteId: number;
    entidad: string;
    clave: string;
    creadoPorId: string;
}

export interface UpdateClaveClienteInput {
    entidad?: string;
    clave?: string;
}
