import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/common/database/services/database.service';

interface AttachResult {
    tareaId: number;
    archivoId: number;
    orden: number;
}

@Injectable()
export class ArchivosTareasRepository {
    constructor(private readonly db: DatabaseService) {}

    attach(tareaId: number, archivoId: number, orden = 0): Promise<AttachResult> {
        return this.db.archivosTarea.create({
            data: { tareaId, archivoId, orden },
        });
    }

    detach(tareaId: number, archivoId: number): Promise<AttachResult> {
        return this.db.archivosTarea.delete({
            where: { tareaId_archivoId: { tareaId, archivoId } },
        });
    }

    findByTareaAndArchivo(tareaId: number, archivoId: number): Promise<AttachResult | null> {
        return this.db.archivosTarea.findUnique({
            where: { tareaId_archivoId: { tareaId, archivoId } },
        });
    }

    findByTarea(tareaId: number) {
        return this.db.archivosTarea.findMany({
            where: { tareaId },
            include: { archivo: true },
            orderBy: { orden: 'asc' },
        });
    }
}
