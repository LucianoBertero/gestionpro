import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class NotificacionRepository {
    constructor(private readonly db: DatabaseService) {}

    findByUsuarioId(usuarioId: string, options?: { skip?: number; take?: number }) {
        return this.db.notificacion.findMany({
            where: { usuarioId },
            orderBy: { creadoEn: 'desc' },
            skip: options?.skip,
            take: options?.take ?? 50,
        });
    }

    countNoLeidas(usuarioId: string) {
        return this.db.notificacion.count({ where: { usuarioId, leida: false } });
    }

    create(data: { usuarioId: string; tipo: any; titulo: string; mensaje: string; enlace?: string }) {
        return this.db.notificacion.create({ data });
    }

    marcarLeida(id: number) {
        return this.db.notificacion.update({ where: { id }, data: { leida: true } });
    }

    marcarTodasLeidas(usuarioId: string) {
        return this.db.notificacion.updateMany({ where: { usuarioId, leida: false }, data: { leida: true } });
    }
}
