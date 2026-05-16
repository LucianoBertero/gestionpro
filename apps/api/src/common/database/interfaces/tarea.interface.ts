import type { Tarea } from '@prisma/client';

import type { EstadoTarea } from '../enums/estado-tarea.enum';
import type { Prioridad } from '../enums/prioridad.enum';
import type { TipoImpuesto } from '../enums/tipo-impuesto.enum';
import type { TipoTarea } from '../enums/tipo-tarea.enum';

export type TareaEntity = Tarea;

export interface CreateTareaInput {
    estudioId?: number;
    clienteId?: number | null;
    encargadoId: string;
    titulo: string;
    descripcion?: string | null;
    tipo: TipoTarea;
    impuesto?: TipoImpuesto | null;
    periodo?: string | null;
    tiempoEstMin?: number | null;
    prioridad?: Prioridad;
    estado?: EstadoTarea;
    vence?: Date | string | null;
    esRecurrente?: boolean;
    reglaRecur?: Record<string, unknown> | null;
    notas?: string | null;
}

export interface UpdateTareaInput {
    clienteId?: number | null;
    encargadoId?: string;
    titulo?: string;
    descripcion?: string | null;
    tipo?: TipoTarea;
    impuesto?: TipoImpuesto | null;
    periodo?: string | null;
    tiempoEstMin?: number | null;
    prioridad?: Prioridad;
    estado?: EstadoTarea;
    vence?: Date | string | null;
    esRecurrente?: boolean;
    reglaRecur?: Record<string, unknown> | null;
    notas?: string | null;
    activo?: boolean;
}

export interface TareaFindAllOptions {
    skip?: number;
    take?: number;
    encargadoId?: string;
    estado?: EstadoTarea;
    prioridad?: Prioridad;
    clienteId?: number;
    search?: string;
}
