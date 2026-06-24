import { Injectable } from '@nestjs/common';

import type { TipoArchivo } from '../enums/tipo-archivo.enum';
import { DatabaseService } from '../services/database.service';

type ParentType = 'cliente' | 'tarea' | 'liquidacion';

interface CreateArchivoInput {
    storageKey: string;
    mimeType: string;
    extension: string;
    bytes: number;
    originalName: string;
    tipo: TipoArchivo;
    periodo?: string;
    subidoPorId: string;
}

interface CreateJunctionResult {
    archivoId: number;
    orden: number;
}

@Injectable()
export class ArchivoRepository {
    constructor(private readonly db: DatabaseService) {}

    /**
     * Find archivos attached to a parent entity via junction tables.
     * Returns junction rows with included archivo data.
     */
    findByParent(parentType: ParentType, parentId: number) {
        const delegates = this.getDelegates(parentType);
        return delegates.findMany({
            where: { [this.parentIdField(parentType)]: parentId },
            include: {
                archivo: true,
            },
        });
    }

    findById(id: number) {
        return this.db.archivo.findUnique({ where: { id } });
    }

    create(data: CreateArchivoInput) {
        return this.db.archivo.create({ data });
    }

    createJunction(
        parentType: ParentType,
        parentId: number,
        archivoId: number,
        orden = 0
    ): Promise<CreateJunctionResult> {
        const delegates = this.getDelegates(parentType);
        const idField = this.parentIdField(parentType);
        return delegates.create({
            data: { [idField]: parentId, archivoId, orden },
        });
    }

    deleteJunctions(archivoId: number): Promise<void> {
        return Promise.all([
            this.db.archivosCliente.deleteMany({
                where: { archivoId },
            }),
            this.db.archivosTarea.deleteMany({
                where: { archivoId },
            }),
            this.db.archivosLiquidacion.deleteMany({
                where: { archivoId },
            }),
        ]).then(() => undefined);
    }

    softDelete(id: number) {
        return this.db.archivo.update({
            where: { id },
            data: { activo: false },
        });
    }

    async existsById(id: number): Promise<boolean> {
        const found = await this.db.archivo.findUnique({
            where: { id },
            select: { id: true },
        });
        return found !== null;
    }

    // ─── Global list with filters ──────────────────────────────────────

    /**
     * Query archivos with text/tipo/date/parentType filters.
     * Returns rows with parent relationships and user info for display.
     */
    async findAllWithParent(filters: {
        search?: string;
        tipo?: TipoArchivo;
        parentType?: string;
        dateFrom?: Date;
        dateTo?: Date;
        skip?: number;
        take?: number;
    }) {
        const { search, tipo, parentType, dateFrom, dateTo, skip, take } = filters;

        const whereConditions: Record<string, unknown>[] = [{ activo: true }];

        if (search) {
            whereConditions.push({ originalName: { contains: search, mode: 'insensitive' } });
        }
        if (tipo) {
            whereConditions.push({ tipo });
        }
        if (dateFrom) {
            whereConditions.push({ creadoEn: { gte: dateFrom } });
        }
        if (dateTo) {
            whereConditions.push({ creadoEn: { lte: dateTo } });
        }
        if (parentType === 'cliente') {
            whereConditions.push({ archivosCliente: { some: {} } });
        } else if (parentType === 'tarea') {
            whereConditions.push({ archivosTarea: { some: {} } });
        } else if (parentType === 'liquidacion') {
            whereConditions.push({ archivosLiquidacion: { some: {} } });
        } else if (parentType === 'estudio') {
            whereConditions.push({
                archivosCliente: { none: {} },
                archivosTarea: { none: {} },
                archivosLiquidacion: { none: {} },
            });
        }

        const where = { AND: whereConditions };

        const [data, total] = await Promise.all([
            this.db.archivo.findMany({
                where: where as any,
                include: {
                    subidoPor: { select: { id: true, nombre: true } },
                    archivosCliente: { include: { cliente: { select: { id: true, denominacion: true } } } },
                    archivosTarea: { include: { tarea: { select: { id: true, titulo: true } } } },
                    archivosLiquidacion: { include: { liquidacion: { select: { id: true, periodo: true } } } },
                },
                orderBy: { creadoEn: 'desc' },
                skip,
                take,
            }),
            this.db.archivo.count({ where: where as any }),
        ]);

        return { data, total };
    }

    // ─── Private helpers ──────────────────────────────────────────────

    private getDelegates(parentType: ParentType) {
        switch (parentType) {
            case 'cliente':
                return this.db.archivosCliente;
            case 'tarea':
                return this.db.archivosTarea;
            case 'liquidacion':
                return this.db.archivosLiquidacion;
        }
    }

    private parentIdField(parentType: ParentType): string {
        switch (parentType) {
            case 'cliente':
                return 'clienteId';
            case 'tarea':
                return 'tareaId';
            case 'liquidacion':
                return 'liquidacionId';
        }
    }
}
