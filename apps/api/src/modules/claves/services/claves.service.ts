import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClaveEstudioRepository } from 'src/common/database/repositories/clave-estudio.repository';
import type { CreateClaveDto, UpdateClaveDto } from '../dtos/claves.dto';
import type { ClaveResponseDto } from '../dtos/claves.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import type { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

@Injectable()
export class ClavesService {
    private readonly logger = new Logger(ClavesService.name);

    constructor(private readonly repo: ClaveEstudioRepository) {}

    async findAll(): Promise<ClaveResponseDto[]> {
        return this.repo.findAll();
    }

    async findById(id: string): Promise<ClaveResponseDto> {
        const clave = await this.repo.findById(id);
        if (!clave) throw new HttpException('claves.error.notFound', HttpStatus.NOT_FOUND);
        return clave;
    }

    async create(dto: CreateClaveDto, user: IAuthUser): Promise<ClaveResponseDto> {
        const exists = await this.repo.existsByEntidad(dto.entidad);
        if (exists) throw new HttpException('claves.error.alreadyExists', HttpStatus.CONFLICT);

        return this.repo.create({
            entidad: dto.entidad,
            clave: dto.clave,
            creadoPorId: user.userId,
        });
    }

    async update(id: string, dto: UpdateClaveDto, user: IAuthUser): Promise<ClaveResponseDto> {
        await this.assertExists(id);

        // If entidad is changing, check uniqueness
        if (dto.entidad) {
            const existing = await this.repo.findByEntidad(dto.entidad);
            if (existing && existing.id !== id) {
                throw new HttpException('claves.error.alreadyExists', HttpStatus.CONFLICT);
            }
        }

        return this.repo.update(id, dto);
    }

    async delete(id: string, user: IAuthUser): Promise<ApiGenericResponseDto> {
        await this.assertExists(id);
        await this.repo.delete(id);
        return { success: true, message: 'claves.success.deleted' };
    }

    private async assertExists(id: string): Promise<void> {
        const exists = await this.repo.findById(id);
        if (!exists) throw new HttpException('claves.error.notFound', HttpStatus.NOT_FOUND);
    }
}
