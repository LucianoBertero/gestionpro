import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ComunicacionRepository } from 'src/common/database/repositories/comunicacion.repository';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { CreateComunicacionDto, UpdateComunicacionDto } from '../dtos/comunicacion.dto';

@Injectable()
export class ComunicacionService {
    private readonly logger = new Logger(ComunicacionService.name);
    constructor(private readonly repo: ComunicacionRepository) {}

    findAll(filters: { clienteId?: number; tipo?: string }) {
        return this.repo.findAll(filters);
    }

    async findById(id: number) {
        const item = await this.repo.findById(id);
        if (!item) throw new HttpException('comunicacion.error.notFound', HttpStatus.NOT_FOUND);
        return item;
    }

    create(data: CreateComunicacionDto & { usuarioId: string }) {
        return this.repo.create(data);
    }

    async update(id: number, data: UpdateComunicacionDto) {
        await this.assertExists(id);
        return this.repo.update(id, data);
    }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.assertExists(id);
        await this.repo.softDelete(id);
        return { success: true, message: 'comunicacion.success.deleted' };
    }

    private async assertExists(id: number): Promise<void> {
        const exists = await this.repo.existsById(id);
        if (!exists) throw new HttpException('comunicacion.error.notFound', HttpStatus.NOT_FOUND);
    }
}
