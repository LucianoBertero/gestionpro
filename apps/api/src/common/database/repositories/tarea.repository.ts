import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type {
    CreateTareaInput,
    TareaEntity,
    TareaFindAllOptions,
    UpdateTareaInput,
} from 'src/common/database/interfaces/tarea.interface';

import { DatabaseService } from '../services/database.service';

@Injectable()
export class TareaRepository {
    constructor(private readonly db: DatabaseService) {}

    async findAll(options?: TareaFindAllOptions): Promise<TareaEntity[]> {
        const {
            skip,
            take,
            encargadoId,
            estado,
            prioridad,
            clienteId,
            search,
        } = options ?? {};

        const where: Prisma.TareaWhereInput = { activo: true };

        if (encargadoId) {
            where.encargadoId = encargadoId;
        }
        if (estado) {
            where.estado = estado;
        }
        if (prioridad) {
            where.prioridad = prioridad;
        }
        if (clienteId) {
            where.clienteId = clienteId;
        }
        if (search) {
            where.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.db.tarea.findMany({
            where,
            skip,
            take,
            orderBy: { creadoEn: 'desc' },
            include: {
                cliente: { select: { id: true, denominacion: true } },
                encargado: { select: { id: true, nombre: true } },
            },
        });
    }

    async countAll(options?: TareaFindAllOptions): Promise<number> {
        const {
            encargadoId,
            estado,
            prioridad,
            clienteId,
            search,
        } = options ?? {};

        const where: Prisma.TareaWhereInput = { activo: true };

        if (encargadoId) where.encargadoId = encargadoId;
        if (estado) where.estado = estado;
        if (prioridad) where.prioridad = prioridad;
        if (clienteId) where.clienteId = clienteId;
        if (search) {
            where.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.db.tarea.count({ where });
    }

    findById(id: number): Promise<TareaEntity | null> {
        return this.db.tarea.findUnique({
            where: { id },
            include: {
                cliente: { select: { id: true, denominacion: true } },
                encargado: { select: { id: true, nombre: true } },
            },
        });
    }

    create(data: CreateTareaInput): Promise<TareaEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.tarea.create({ data: data as any });
    }

    update(id: number, data: UpdateTareaInput): Promise<TareaEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.tarea.update({ where: { id }, data: data as any });
    }

    softDelete(id: number): Promise<TareaEntity> {
        return this.db.tarea.update({
            where: { id },
            data: { activo: false },
        });
    }

    async existsById(id: number): Promise<boolean> {
        const found = await this.db.tarea.findUnique({
            where: { id },
            select: { id: true },
        });
        return found !== null;
    }

    findByClienteId(clienteId: number): Promise<TareaEntity[]> {
        return this.db.tarea.findMany({
            where: { clienteId, activo: true },
            orderBy: { vence: 'asc' },
            include: {
                encargado: { select: { id: true, nombre: true } },
            },
        });
    }
}
