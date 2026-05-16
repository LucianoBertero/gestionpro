import { Injectable, Logger } from '@nestjs/common';
import { NotificacionRepository } from 'src/common/database/repositories/notificacion.repository';

@Injectable()
export class NotificacionService {
    private readonly logger = new Logger(NotificacionService.name);
    constructor(private readonly repo: NotificacionRepository) {}

    findByUsuario(usuarioId: string, skip?: number, take?: number) {
        return this.repo.findByUsuarioId(usuarioId, { skip, take });
    }

    countNoLeidas(usuarioId: string) { return this.repo.countNoLeidas(usuarioId); }

    marcarLeida(id: number) { return this.repo.marcarLeida(id); }

    marcarTodasLeidas(usuarioId: string) { return this.repo.marcarTodasLeidas(usuarioId); }

    crear(data: { usuarioId: string; tipo: any; titulo: string; mensaje: string; enlace?: string }) {
        return this.repo.create(data);
    }
}
