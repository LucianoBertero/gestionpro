import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { DatabaseService } from '../services/database.service';
import type { TipoEvento } from '../enums/tipo-evento.enum';

@Injectable()
export class AgendaRepository {
    constructor(private readonly db: DatabaseService) {}

    findAll(options: { usuarioId?: string; fechaDesde?: Date; fechaHasta?: Date; esEstudio?: boolean }) {
        const where: Prisma.AgendaItemWhereInput = { activo: true };
        if (options.usuarioId) where.usuarioId = options.usuarioId;
        if (options.fechaDesde && options.fechaHasta) {
            where.fecha = { gte: options.fechaDesde, lte: options.fechaHasta };
        }
        if (options.esEstudio !== undefined) where.esEstudio = options.esEstudio;

        return this.db.agendaItem.findMany({
            where,
            orderBy: { fecha: 'asc' },
            take: 100,
            include: { usuario: { select: { id: true, nombre: true } }, tarea: { select: { id: true, titulo: true } } },
        });
    }

    findById(id: number) {
        return this.db.agendaItem.findUnique({ where: { id } });
    }

    create(data: any) {
        return this.db.agendaItem.create({ data });
    }

    update(id: number, data: any) {
        return this.db.agendaItem.update({ where: { id }, data });
    }

    softDelete(id: number) {
        return this.db.agendaItem.update({ where: { id }, data: { activo: false } });
    }

    async existsById(id: number) {
        const found = await this.db.agendaItem.findUnique({ where: { id }, select: { id: true } });
        return found !== null;
    }
}
