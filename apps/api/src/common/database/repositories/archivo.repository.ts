import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import type { TipoArchivo } from '../enums/tipo-archivo.enum';

@Injectable()
export class ArchivoRepository {
    constructor(private readonly db: DatabaseService) {}

    findAll() {
        return this.db.archivo.findMany({
            where: { activo: true },
            orderBy: { creadoEn: 'desc' },
            include: { subidoPor: { select: { id: true, nombre: true } }, cliente: { select: { id: true, denominacion: true } } },
        });
    }

    findByClienteId(clienteId: number) {
        return this.db.archivo.findMany({
            where: { clienteId, activo: true },
            orderBy: { creadoEn: 'desc' },
            include: { subidoPor: { select: { id: true, nombre: true } } },
        });
    }

    findById(id: number) {
        return this.db.archivo.findUnique({ where: { id } });
    }

    create(data: {
        clienteId: number;
        nombre: string;
        tipo: TipoArchivo;
        periodo?: string;
        url: string;
        tamanioKb?: number;
        subidoPorId: string;
    }) {
        return this.db.archivo.create({ data });
    }

    softDelete(id: number) {
        return this.db.archivo.update({ where: { id }, data: { activo: false } });
    }

    async existsById(id: number) {
        const found = await this.db.archivo.findUnique({ where: { id }, select: { id: true } });
        return found !== null;
    }
}
