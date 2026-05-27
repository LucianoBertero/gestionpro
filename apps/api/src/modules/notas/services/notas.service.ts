import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { NotaClienteRepository } from 'src/common/database/repositories/nota-cliente.repository';
import { ClienteRepository } from 'src/common/database/repositories/cliente.repository';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import type { CreateNotaDto, UpdateNotaDto } from '../dtos/notas.dto';

@Injectable()
export class NotasService {
    private readonly logger = new Logger(NotasService.name);

    constructor(
        private readonly notaRepository: NotaClienteRepository,
        private readonly clienteRepository: ClienteRepository,
    ) {}

    async findByClienteId(clienteId: number) {
        await this.assertClienteExists(clienteId);
        return this.notaRepository.findByClienteId(clienteId);
    }

    async findById(id: number) {
        const nota = await this.notaRepository.findById(id);
        if (!nota) throw new HttpException('notas.error.notFound', HttpStatus.NOT_FOUND);
        return nota;
    }

    async create(dto: CreateNotaDto & { creadoPorId: string }) {
        await this.assertClienteExists(dto.clienteId);
        return this.notaRepository.create(dto);
    }

    async update(id: number, dto: UpdateNotaDto, authUser: IAuthUser) {
        const nota = await this.notaRepository.findById(id);
        if (!nota) throw new HttpException('notas.error.notFound', HttpStatus.NOT_FOUND);

        if (nota.creadoPorId !== authUser.userId && authUser.role !== UserRole.SOCIO) {
            throw new HttpException('notas.error.notAuthorized', HttpStatus.FORBIDDEN);
        }

        return this.notaRepository.update(id, dto);
    }

    async delete(id: number, authUser: IAuthUser): Promise<ApiGenericResponseDto> {
        const nota = await this.notaRepository.findById(id);
        if (!nota) throw new HttpException('notas.error.notFound', HttpStatus.NOT_FOUND);

        if (nota.creadoPorId !== authUser.userId && authUser.role !== UserRole.SOCIO) {
            throw new HttpException('notas.error.notAuthorized', HttpStatus.FORBIDDEN);
        }

        await this.notaRepository.delete(id);
        return { success: true, message: 'notas.success.deleted' };
    }

    private async assertClienteExists(clienteId: number): Promise<void> {
        const exists = await this.clienteRepository.existsById(clienteId);
        if (!exists) throw new HttpException('clientes.error.clienteNotFound', HttpStatus.NOT_FOUND);
    }
}
