import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type {
    CreateLiquidacionInput,
    LiquidacionEntity,
    LiquidacionFindAllOptions,
    UpdateLiquidacionInput,
} from 'src/common/database/interfaces/liquidacion.interface';

import { DatabaseService } from '../services/database.service';

@Injectable()
export class LiquidacionRepository {
    constructor(private readonly db: DatabaseService) {}

    async findAll(options?: LiquidacionFindAllOptions): Promise<LiquidacionEntity[]> {
        const { skip, take, clienteId, periodo, impuesto } = options ?? {};

        const where: Prisma.LiquidacionWhereInput = { activo: true };

        if (clienteId) where.clienteId = clienteId;
        if (periodo) where.periodo = periodo;
        if (impuesto) where.impuesto = impuesto;

        return this.db.liquidacion.findMany({
            where,
            skip,
            take,
            orderBy: { periodo: 'desc' },
            include: {
                cliente: { select: { id: true, denominacion: true } },
                cargadoPor: { select: { id: true, nombre: true } },
            },
        });
    }

    async countAll(options?: LiquidacionFindAllOptions): Promise<number> {
        const { clienteId, periodo, impuesto } = options ?? {};
        const where: Prisma.LiquidacionWhereInput = { activo: true };
        if (clienteId) where.clienteId = clienteId;
        if (periodo) where.periodo = periodo;
        if (impuesto) where.impuesto = impuesto;
        return this.db.liquidacion.count({ where });
    }

    findById(id: number): Promise<LiquidacionEntity | null> {
        return this.db.liquidacion.findUnique({
            where: { id },
            include: {
                cliente: { select: { id: true, denominacion: true } },
                cargadoPor: { select: { id: true, nombre: true } },
            },
        });
    }

    findByClienteId(clienteId: number): Promise<LiquidacionEntity[]> {
        return this.db.liquidacion.findMany({
            where: { clienteId, activo: true },
            orderBy: { periodo: 'desc' },
            include: {
                cargadoPor: { select: { id: true, nombre: true } },
            },
        });
    }

    findHistorialCliente(
        clienteId: number,
        limit = 12,
    ): Promise<LiquidacionEntity[]> {
        return this.db.liquidacion.findMany({
            where: { clienteId, activo: true },
            orderBy: { periodo: 'desc' },
            take: limit,
            include: {
                cargadoPor: { select: { id: true, nombre: true } },
            },
        });
    }

    findByPeriodo(
        clienteId: number,
        periodo: string,
    ): Promise<LiquidacionEntity[]> {
        return this.db.liquidacion.findMany({
            where: { clienteId, periodo, activo: true },
            include: {
                cargadoPor: { select: { id: true, nombre: true } },
            },
        });
    }

    create(data: CreateLiquidacionInput): Promise<LiquidacionEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.liquidacion.create({ data: data as any });
    }

    update(id: number, data: UpdateLiquidacionInput): Promise<LiquidacionEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.liquidacion.update({ where: { id }, data: data as any });
    }

    softDelete(id: number): Promise<LiquidacionEntity> {
        return this.db.liquidacion.update({
            where: { id },
            data: { activo: false },
        });
    }

    async existsById(id: number): Promise<boolean> {
        const found = await this.db.liquidacion.findUnique({
            where: { id },
            select: { id: true },
        });
        return found !== null;
    }

    async findImporteAnterior(
        clienteId: number,
        impuesto: string,
        periodo: string,
    ): Promise<number | null> {
        const anterior = await this.db.liquidacion.findFirst({
            where: { clienteId, impuesto: impuesto as any, activo: true, periodo: { lt: periodo } },
            orderBy: { periodo: 'desc' },
            select: { importe: true },
        });
        return anterior?.importe?.toNumber() ?? null;
    }
}
