import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { TareaRepository } from 'src/common/database/repositories/tarea.repository';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import type { TareaFindAllOptions } from 'src/common/database/interfaces/tarea.interface';
import type { CreateTareaDto, TareaResponseDto, UpdateTareaDto } from '../dtos/tareas.dto';

@Injectable()
export class TareaService {
    private readonly logger = new Logger(TareaService.name);

    constructor(private readonly tareaRepository: TareaRepository) {}

    // ─── COLABORADOR auto-filter ──────────────────────────────────────────

    private applyCollaboradorFilter(
        options: TareaFindAllOptions,
        authUser: IAuthUser,
    ): TareaFindAllOptions {
        // COLABORADOR solo ve sus tareas
        if (authUser.role === ('COLABORADOR' as any)) {
            return { ...options, encargadoId: authUser.userId };
        }
        return options;
    }

    // ─── Queries ──────────────────────────────────────────────────────────

    async findAll(
        options: TareaFindAllOptions,
        authUser: IAuthUser,
    ): Promise<TareaResponseDto[]> {
        const filtered = this.applyCollaboradorFilter(options, authUser);
        return this.tareaRepository.findAll(filtered) as Promise<TareaResponseDto[]>;
    }

    async countAll(
        options: TareaFindAllOptions,
        authUser: IAuthUser,
    ): Promise<number> {
        const filtered = this.applyCollaboradorFilter(options, authUser);
        return this.tareaRepository.countAll(filtered);
    }

    async findById(id: number): Promise<TareaResponseDto> {
        const tarea = await this.tareaRepository.findById(id);
        if (!tarea) {
            throw new HttpException(
                'tareas.error.tareaNotFound',
                HttpStatus.NOT_FOUND,
            );
        }
        return tarea as TareaResponseDto;
    }

    // ─── Mutations ────────────────────────────────────────────────────────

    async create(dto: CreateTareaDto): Promise<TareaResponseDto> {
        return this.tareaRepository.create(dto) as Promise<TareaResponseDto>;
    }

    async update(id: number, dto: UpdateTareaDto): Promise<TareaResponseDto> {
        await this.assertExists(id);
        return this.tareaRepository.update(id, dto) as Promise<TareaResponseDto>;
    }

    async completar(id: number): Promise<TareaResponseDto> {
        await this.assertExists(id);
        return this.tareaRepository.update(id, {
            estado: 'COMPLETADA' as any,
        }) as Promise<TareaResponseDto>;
    }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.assertExists(id);
        await this.tareaRepository.softDelete(id);
        return { success: true, message: 'tareas.success.tareaDeleted' };
    }

    // ─── Assertions ───────────────────────────────────────────────────────

    private async assertExists(id: number): Promise<void> {
        const exists = await this.tareaRepository.existsById(id);
        if (!exists) {
            throw new HttpException(
                'tareas.error.tareaNotFound',
                HttpStatus.NOT_FOUND,
            );
        }
    }
}
