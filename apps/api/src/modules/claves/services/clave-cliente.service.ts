import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClaveClienteRepository } from 'src/common/database/repositories/clave-cliente.repository';
import type { CreateClaveClienteDto, UpdateClaveClienteDto } from '../dtos/clave-cliente.dto';
import type { ClaveClienteResponseDto } from '../dtos/clave-cliente.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import type { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { encryptClave, decryptClave } from '../utils/clave-crypto';

@Injectable()
export class ClaveClienteService {
    private readonly logger = new Logger(ClaveClienteService.name);
    private readonly encryptionSecret: string;

    constructor(
        private readonly repo: ClaveClienteRepository,
        private readonly configService: ConfigService,
    ) {
        this.encryptionSecret =
            process.env.CLAVES_ENCRYPTION_KEY ??
            this.configService.getOrThrow<string>('auth.accessToken.secret');
    }

    async findByCliente(clienteId: number): Promise<ClaveClienteResponseDto[]> {
        const claves = await this.repo.findByCliente(clienteId);
        return claves.map((c) => ({
            ...c,
            clave: decryptClave(c.clave, this.encryptionSecret),
        }));
    }

    async findById(id: string): Promise<ClaveClienteResponseDto> {
        const clave = await this.repo.findById(id);
        if (!clave) throw new HttpException('claves.error.notFound', HttpStatus.NOT_FOUND);
        return { ...clave, clave: decryptClave(clave.clave, this.encryptionSecret) };
    }

    async create(clienteId: number, dto: CreateClaveClienteDto, user: IAuthUser): Promise<ClaveClienteResponseDto> {
        const created = await this.repo.create({
            clienteId,
            entidad: dto.entidad,
            clave: encryptClave(dto.clave, this.encryptionSecret),
            creadoPorId: user.userId,
        });
        return { ...created, clave: decryptClave(created.clave, this.encryptionSecret) };
    }

    async update(id: string, dto: UpdateClaveClienteDto): Promise<ClaveClienteResponseDto> {
        const existing = await this.repo.findById(id);
        if (!existing) throw new HttpException('claves.error.notFound', HttpStatus.NOT_FOUND);

        const updateData: Record<string, string> = {};
        if (dto.entidad) updateData.entidad = dto.entidad;
        if (dto.clave) updateData.clave = encryptClave(dto.clave, this.encryptionSecret);

        const updated = await this.repo.update(id, updateData);
        return { ...updated, clave: decryptClave(updated.clave, this.encryptionSecret) };
    }

    async delete(id: string): Promise<ApiGenericResponseDto> {
        const existing = await this.repo.findById(id);
        if (!existing) throw new HttpException('claves.error.notFound', HttpStatus.NOT_FOUND);
        await this.repo.delete(id);
        return { success: true, message: 'claves.success.deleted' };
    }
}
