import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { CreateArchivoDto, UpdateArchivoDto } from '../dtos/archivo.dto';

@Injectable()
export class ArchivoService {
    private readonly logger = new Logger(ArchivoService.name);
    constructor(private readonly repo: ArchivoRepository) {}

    findAll(filters: { clienteId?: number }) {
        if (filters.clienteId) {
            return this.repo.findByClienteId(filters.clienteId);
        }
        return this.repo.findAll();
    }

    async findById(id: number) {
        const item = await this.repo.findById(id);
        if (!item) throw new HttpException('archivo.error.notFound', HttpStatus.NOT_FOUND);
        return item;
    }

    create(data: CreateArchivoDto & { subidoPorId: string }) {
        return this.repo.create(data);
    }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.assertExists(id);
        await this.repo.softDelete(id);
        return { success: true, message: 'archivo.success.deleted' };
    }

    private async assertExists(id: number): Promise<void> {
        const exists = await this.repo.existsById(id);
        if (!exists) throw new HttpException('archivo.error.notFound', HttpStatus.NOT_FOUND);
    }
}
