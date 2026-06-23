import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/common/database/services/database.service';

interface AttachResult {
    clienteId: number;
    archivoId: number;
    orden: number;
}

@Injectable()
export class ArchivosClientesRepository {
    constructor(private readonly db: DatabaseService) {}

    attach(clienteId: number, archivoId: number, orden = 0): Promise<AttachResult> {
        return this.db.archivosCliente.create({
            data: { clienteId, archivoId, orden },
        });
    }

    detach(clienteId: number, archivoId: number): Promise<AttachResult> {
        return this.db.archivosCliente.delete({
            where: { clienteId_archivoId: { clienteId, archivoId } },
        });
    }

    findByClienteAndArchivo(clienteId: number, archivoId: number): Promise<AttachResult | null> {
        return this.db.archivosCliente.findUnique({
            where: { clienteId_archivoId: { clienteId, archivoId } },
        });
    }

    findByCliente(clienteId: number) {
        return this.db.archivosCliente.findMany({
            where: { clienteId },
            include: { archivo: true },
            orderBy: { orden: 'asc' },
        });
    }
}
