import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import type { TipoArchivo } from '../enums/tipo-archivo.enum';

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
            (this.db as any).archivosCliente.deleteMany({
                where: { archivoId },
            }),
            (this.db as any).archivosTarea.deleteMany({
                where: { archivoId },
            }),
            (this.db as any).archivosLiquidacion.deleteMany({
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

    // ─── Private helpers ──────────────────────────────────────────────

    private getDelegates(parentType: ParentType) {
        switch (parentType) {
            case 'cliente':
                return (this.db as any).archivosCliente;
            case 'tarea':
                return (this.db as any).archivosTarea;
            case 'liquidacion':
                return (this.db as any).archivosLiquidacion;
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
