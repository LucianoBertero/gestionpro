import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';
import type {
    ClienteEntity,
    ClienteFindAllOptions,
    CreateClienteInput,
    UpdateClienteInput,
} from 'src/common/database/interfaces/cliente.interface';

import { DatabaseService } from '../services/database.service';

@Injectable()
export class ClienteRepository {
    constructor(private readonly db: DatabaseService) {}

    async findAll(options?: ClienteFindAllOptions): Promise<ClienteEntity[]> {
        const { skip, take, encargadoId, semaforo, search } = options ?? {};

        const where: Prisma.ClienteWhereInput = { activo: true };

        if (encargadoId) {
            where.encargadoId = encargadoId;
        }

        if (semaforo) {
            where.semaforo = semaforo;
        }

        if (search) {
            where.OR = [
                { denominacion: { contains: search, mode: 'insensitive' } },
                { cuit: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.db.cliente.findMany({
            where,
            skip: skip ?? 0,
            take: take ?? 20,
        });
    }

    async countAll(options?: ClienteFindAllOptions): Promise<number> {
        const { encargadoId, semaforo, search } = options ?? {};

        const where: Prisma.ClienteWhereInput = { activo: true };

        if (encargadoId) {
            where.encargadoId = encargadoId;
        }

        if (semaforo) {
            where.semaforo = semaforo;
        }

        if (search) {
            where.OR = [
                { denominacion: { contains: search, mode: 'insensitive' } },
                { cuit: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.db.cliente.count({ where });
    }

    findById(id: number): Promise<ClienteEntity | null> {
        return this.db.cliente.findUnique({
            where: { id },
            include: { impuestos: true },
        });
    }

    findLegajo(id: number): Promise<
        | (ClienteEntity & {
              impuestos: { id: number; clienteId: number; tipo: TipoImpuesto; activo: boolean }[];
              encargado: { id: string; nombre: string };
              supervisor: { id: string; nombre: string } | null;
          })
        | null
    > {
        return this.db.cliente.findUnique({
            where: { id, activo: true },
            include: {
                impuestos: true,
                encargado: { select: { id: true, nombre: true } },
                supervisor: { select: { id: true, nombre: true } },
            },
        });
    }

    create(data: CreateClienteInput): Promise<ClienteEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.cliente.create({ data: data as any });
    }

    async createWithImpuestos(
        data: CreateClienteInput,
        impuestos: TipoImpuesto[]
    ): Promise<ClienteEntity> {
        return this.db.$transaction(async (tx) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cliente = await tx.cliente.create({ data: data as any });

            if (impuestos.length > 0) {
                await tx.clienteImpuesto.createMany({
                    data: impuestos.map((tipo) => ({
                        clienteId: cliente.id,
                        tipo,
                    })),
                });
            }

            return cliente;
        });
    }

    async replaceImpuestos(
        clienteId: number,
        tipos: TipoImpuesto[]
    ): Promise<void> {
        await this.db.$transaction(async (tx) => {
            // Delete all existing impuestos for this cliente
            await tx.clienteImpuesto.deleteMany({ where: { clienteId } });
            // Create new ones
            if (tipos.length > 0) {
                await tx.clienteImpuesto.createMany({
                    data: tipos.map((tipo) => ({ clienteId, tipo })),
                });
            }
        });
    }

    update(id: number, data: UpdateClienteInput): Promise<ClienteEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.cliente.update({ where: { id }, data: data as any });
    }

    softDelete(id: number): Promise<ClienteEntity> {
        return this.db.cliente.update({
            where: { id },
            data: { activo: false },
        });
    }

    async existsById(id: number): Promise<boolean> {
        const found = await this.db.cliente.findUnique({
            where: { id },
            select: { id: true },
        });
        return found !== null;
    }

    async existsByCuit(cuit: string, excludeId?: number): Promise<boolean> {
        const where: Prisma.ClienteWhereInput = { cuit };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const found = await this.db.cliente.findFirst({
            where,
            select: { id: true },
        });
        return found !== null;
    }
}
