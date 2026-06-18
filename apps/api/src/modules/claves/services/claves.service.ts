import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClaveEstudioRepository } from 'src/common/database/repositories/clave-estudio.repository';
import type { CreateClaveDto, UpdateClaveDto } from '../dtos/claves.dto';
import type { ClaveResponseDto } from '../dtos/claves.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import type { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { encryptClave, decryptClave } from '../utils/clave-crypto';

@Injectable()
export class ClavesService {
    private readonly logger = new Logger(ClavesService.name);
    private readonly encryptionSecret: string;

    constructor(
        private readonly repo: ClaveEstudioRepository,
        private readonly configService: ConfigService,
    ) {
        // Use explicit env var, or derive a dev fallback from the app secret
        this.encryptionSecret =
            process.env.CLAVES_ENCRYPTION_KEY ??
            this.configService.getOrThrow<string>('auth.accessToken.secret');
    }

    async findAll(): Promise<ClaveResponseDto[]> {
        const claves = await this.repo.findAll();
        return claves.map((c) => ({
            ...c,
            clave: decryptClave(c.clave, this.encryptionSecret),
        }));
    }

    async findById(id: string): Promise<ClaveResponseDto> {
        const clave = await this.repo.findById(id);
        if (!clave) throw new HttpException('claves.error.notFound', HttpStatus.NOT_FOUND);
        return {
            ...clave,
            clave: decryptClave(clave.clave, this.encryptionSecret),
        };
    }

    async create(dto: CreateClaveDto, user: IAuthUser): Promise<ClaveResponseDto> {
        const exists = await this.repo.existsByEntidad(dto.entidad);
        if (exists) throw new HttpException('claves.error.alreadyExists', HttpStatus.CONFLICT);

        const created = await this.repo.create({
            entidad: dto.entidad,
            clave: encryptClave(dto.clave, this.encryptionSecret),
            creadoPorId: user.userId,
        });

        return {
            ...created,
            clave: decryptClave(created.clave, this.encryptionSecret),
        };
    }

    async update(id: string, dto: UpdateClaveDto, user: IAuthUser): Promise<ClaveResponseDto> {
        await this.assertExists(id);

        if (dto.entidad) {
            const existing = await this.repo.findByEntidad(dto.entidad);
            if (existing && existing.id !== id) {
                throw new HttpException('claves.error.alreadyExists', HttpStatus.CONFLICT);
            }
        }

        const updateData: Record<string, string> = {};
        if (dto.entidad) updateData.entidad = dto.entidad;
        if (dto.clave) updateData.clave = encryptClave(dto.clave, this.encryptionSecret);

        const updated = await this.repo.update(id, updateData);
        return {
            ...updated,
            clave: decryptClave(updated.clave, this.encryptionSecret),
        };
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
