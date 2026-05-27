import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class NotaClienteRepository {
    constructor(private readonly db: DatabaseService) {}

    findByClienteId(clienteId: number) {
        return this.db.notaCliente.findMany({
            where: { clienteId },
            orderBy: { creadoEn: 'desc' },
            include: { creadoPor: { select: { id: true, nombre: true, emoji: true } } },
        });
    }

    findById(id: number) {
        return this.db.notaCliente.findUnique({
            where: { id },
            include: { creadoPor: { select: { id: true, nombre: true, emoji: true } } },
        });
    }

    create(data: { clienteId: number; contenido: string; creadoPorId: string }) {
        return this.db.notaCliente.create({
            data,
            include: { creadoPor: { select: { id: true, nombre: true, emoji: true } } },
        });
    }

    update(id: number, data: { contenido: string }) {
        return this.db.notaCliente.update({
            where: { id },
            data,
            include: { creadoPor: { select: { id: true, nombre: true, emoji: true } } },
        });
    }

    delete(id: number) {
        return this.db.notaCliente.delete({ where: { id } });
    }

    async existsById(id: number): Promise<boolean> {
        const found = await this.db.notaCliente.findUnique({ where: { id }, select: { id: true } });
        return found !== null;
    }
}
