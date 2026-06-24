import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { LiquidacionRepository } from 'src/common/database/repositories/liquidacion.repository';

import { ArchivosLiquidacionesRepository } from '../repositories/archivos-liquidaciones.repository';

@Injectable()
export class ArchivosLiquidacionesService {
    private readonly logger = new Logger(ArchivosLiquidacionesService.name);

    constructor(
        private readonly junctionRepo: ArchivosLiquidacionesRepository,
        private readonly liquidacionRepo: LiquidacionRepository,
        private readonly archivoRepo: ArchivoRepository,
    ) {}

    async attach(liquidacionId: number, archivoId: number, orden = 0) {
        const liquidacionExists = await this.liquidacionRepo.existsById(liquidacionId);
        if (!liquidacionExists) {
            throw new HttpException(
                'liquidaciones.error.liquidacionNotFound',
                HttpStatus.NOT_FOUND,
            );
        }

        const archivoExists = await this.archivoRepo.existsById(archivoId);
        if (!archivoExists) {
            throw new HttpException(
                'archivo.error.notFound',
                HttpStatus.NOT_FOUND,
            );
        }

        return this.junctionRepo.attach(liquidacionId, archivoId, orden);
    }

    async detach(liquidacionId: number, archivoId: number) {
        const junction = await this.junctionRepo.findByLiquidacionAndArchivo(liquidacionId, archivoId);
        if (!junction) {
            throw new HttpException(
                'archivo.error.notFound',
                HttpStatus.NOT_FOUND,
            );
        }

        return this.junctionRepo.detach(liquidacionId, archivoId);
    }

    findByLiquidacion(liquidacionId: number) {
        return this.junctionRepo.findByLiquidacion(liquidacionId);
    }
}
