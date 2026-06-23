import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { TareaRepository } from 'src/common/database/repositories/tarea.repository';

import { ArchivosTareasRepository } from '../repositories/archivos-tareas.repository';

@Injectable()
export class ArchivosTareasService {
    private readonly logger = new Logger(ArchivosTareasService.name);

    constructor(
        private readonly junctionRepo: ArchivosTareasRepository,
        private readonly tareaRepo: TareaRepository,
        private readonly archivoRepo: ArchivoRepository,
    ) {}

    /**
     * Attach an existing archivo to a tarea.
     */
    async attach(tareaId: number, archivoId: number, orden = 0) {
        const tareaExists = await this.tareaRepo.existsById(tareaId);
        if (!tareaExists) {
            throw new HttpException(
                'tareas.error.tareaNotFound',
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

        return this.junctionRepo.attach(tareaId, archivoId, orden);
    }

    /**
     * Detach an archivo from a tarea (junction row only — does not delete the archivo).
     */
    async detach(tareaId: number, archivoId: number) {
        const junction = await this.junctionRepo.findByTareaAndArchivo(tareaId, archivoId);
        if (!junction) {
            throw new HttpException(
                'archivo.error.notFound',
                HttpStatus.NOT_FOUND,
            );
        }

        return this.junctionRepo.detach(tareaId, archivoId);
    }

    /**
     * List archivos attached to a tarea with full archivo metadata.
     */
    findByTarea(tareaId: number) {
        return this.junctionRepo.findByTarea(tareaId);
    }
}
