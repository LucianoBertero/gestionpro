import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import type { ClaveClienteEntity, CreateClaveClienteInput, UpdateClaveClienteInput } from '../interfaces/clave-cliente.interface';

@Injectable()
export class ClaveClienteRepository {
    constructor(private readonly db: DatabaseService) {}

    findByCliente(clienteId: number): Promise<ClaveClienteEntity[]> {
        return this.db.claveCliente.findMany({
            where: { clienteId },
            orderBy: { entidad: 'asc' },
        });
    }

    findById(id: string): Promise<ClaveClienteEntity | null> {
        return this.db.claveCliente.findUnique({ where: { id } });
    }

    create(data: CreateClaveClienteInput): Promise<ClaveClienteEntity> {
        return this.db.claveCliente.create({ data });
    }

    update(id: string, data: UpdateClaveClienteInput): Promise<ClaveClienteEntity> {
        return this.db.claveCliente.update({ where: { id }, data });
    }

    delete(id: string): Promise<ClaveClienteEntity> {
        return this.db.claveCliente.delete({ where: { id } });
    }
}
