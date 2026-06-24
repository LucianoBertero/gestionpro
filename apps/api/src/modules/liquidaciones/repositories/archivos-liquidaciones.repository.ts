import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/common/database/services/database.service';

interface AttachResult {
    liquidacionId: number;
    archivoId: number;
    orden: number;
}

@Injectable()
export class ArchivosLiquidacionesRepository {
    constructor(private readonly db: DatabaseService) {}

    attach(liquidacionId: number, archivoId: number, orden = 0): Promise<AttachResult> {
        return this.db.archivosLiquidacion.create({
            data: { liquidacionId, archivoId, orden },
        });
    }

    detach(liquidacionId: number, archivoId: number): Promise<AttachResult> {
        return this.db.archivosLiquidacion.delete({
            where: { liquidacionId_archivoId: { liquidacionId, archivoId } },
        });
    }

    findByLiquidacionAndArchivo(liquidacionId: number, archivoId: number): Promise<AttachResult | null> {
        return this.db.archivosLiquidacion.findUnique({
            where: { liquidacionId_archivoId: { liquidacionId, archivoId } },
        });
    }

    findByLiquidacion(liquidacionId: number) {
        return this.db.archivosLiquidacion.findMany({
            where: { liquidacionId },
            include: { archivo: true },
            orderBy: { orden: 'asc' },
        });
    }
}
