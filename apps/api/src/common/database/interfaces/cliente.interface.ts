import type { Cliente } from '@prisma/client';

import type { EstadoSemaforo } from '../enums/estado-semaforo.enum';

export type ClienteEntity = Cliente;

export interface CreateClienteInput {
    cuit: string;
    denominacion: string;
    condicionIva: string;
    encargadoId: string;
    termino?: number;
    actividades?: string[];
    domicilio?: string | null;
    telefono?: string | null;
    email?: string | null;
    whatsapp?: string | null;
    supervisorId?: string | null;
    semaforo?: EstadoSemaforo;
    estudioId?: number;
}

export interface UpdateClienteInput {
    cuit?: string;
    denominacion?: string;
    condicionIva?: string;
    encargadoId?: string;
    termino?: number;
    actividades?: string[];
    domicilio?: string | null;
    telefono?: string | null;
    email?: string | null;
    whatsapp?: string | null;
    supervisorId?: string | null;
    semaforo?: EstadoSemaforo;
    activo?: boolean;
}

export interface ClienteFindAllOptions {
    skip?: number;
    take?: number;
    encargadoId?: string;
    semaforo?: EstadoSemaforo;
    search?: string;
}
