import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { ClienteRepository } from 'src/common/database/repositories/cliente.repository';

import { ArchivosClientesRepository } from '../repositories/archivos-clientes.repository';

@Injectable()
export class ArchivosClientesService {
    private readonly logger = new Logger(ArchivosClientesService.name);

    constructor(
        private readonly junctionRepo: ArchivosClientesRepository,
        private readonly clienteRepo: ClienteRepository,
        private readonly archivoRepo: ArchivoRepository,
    ) {}

    async attach(clienteId: number, archivoId: number, orden = 0) {
        const clienteExists = await this.clienteRepo.existsById(clienteId);
        if (!clienteExists) {
            throw new HttpException(
                'clientes.error.clienteNotFound',
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

        return this.junctionRepo.attach(clienteId, archivoId, orden);
    }

    async detach(clienteId: number, archivoId: number) {
        const junction = await this.junctionRepo.findByClienteAndArchivo(clienteId, archivoId);
        if (!junction) {
            throw new HttpException(
                'archivo.error.notFound',
                HttpStatus.NOT_FOUND,
            );
        }

        return this.junctionRepo.detach(clienteId, archivoId);
    }

    findByCliente(clienteId: number) {
        return this.junctionRepo.findByCliente(clienteId);
    }
}
