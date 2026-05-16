import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class ComunicacionRepository {
    constructor(private readonly db: DatabaseService) {}

    findAll(filters: { clienteId?: number; tipo?: string }) {
        return this.db.comunicacion.findMany({
            where: { ...(filters.clienteId ? { clienteId: filters.clienteId } : {}), ...(filters.tipo ? { tipo: filters.tipo } : {}) },
            orderBy: { creadoEn: 'desc' },
            include: { usuario: { select: { id: true, nombre: true } }, cliente: { select: { id: true, denominacion: true } } },
        });
    }

    findById(id: number) {
        return this.db.comunicacion.findUnique({
            where: { id },
            include: { usuario: { select: { id: true, nombre: true } }, cliente: { select: { id: true, denominacion: true } } },
        });
    }

    create(data: { clienteId: number; usuarioId: string; tipo: string; asunto?: string; contenido?: string }) {
        return this.db.comunicacion.create({
            data,
            include: { usuario: { select: { id: true, nombre: true } } },
        });
    }

    update(id: number, data: { tipo?: string; asunto?: string; contenido?: string }) {
        return this.db.comunicacion.update({
            where: { id },
            data,
            include: { usuario: { select: { id: true, nombre: true } } },
        });
    }

    softDelete(id: number) {
        return this.db.comunicacion.delete({ where: { id } });
    }

    async existsById(id: number) {
        const found = await this.db.comunicacion.findUnique({ where: { id }, select: { id: true } });
        return found !== null;
    }
}
