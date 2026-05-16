import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class ComunicacionRepository {
    constructor(private readonly db: DatabaseService) {}

    findByClienteId(clienteId: number) {
        return this.db.comunicacion.findMany({
            where: { clienteId },
            orderBy: { creadoEn: 'desc' },
            include: { usuario: { select: { id: true, nombre: true } } },
        });
    }

    create(data: { clienteId: number; usuarioId: string; tipo: string; asunto?: string; contenido?: string }) {
        return this.db.comunicacion.create({ data });
    }
}
