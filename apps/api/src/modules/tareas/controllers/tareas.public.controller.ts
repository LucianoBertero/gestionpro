import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { EstadoTarea } from 'src/common/database/enums/estado-tarea.enum';
import { Prioridad } from 'src/common/database/enums/prioridad.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { TareaResponseDto } from '../dtos/tareas.dto';
import { TareaService } from '../services/tareas.service';

function parseEstado(value: string | undefined): EstadoTarea | undefined {
    if (!value) return undefined;
    if (Object.values(EstadoTarea).includes(value as EstadoTarea)) {
        return value as EstadoTarea;
    }
    return undefined;
}

function parsePrioridad(value: string | undefined): Prioridad | undefined {
    if (!value) return undefined;
    if (Object.values(Prioridad).includes(value as Prioridad)) {
        return value as Prioridad;
    }
    return undefined;
}

@ApiTags('public.tareas')
@ApiBearerAuth('accessToken')
@Controller({ path: '/tareas', version: '1' })
export class TareasPublicController {
    constructor(private readonly tareaService: TareaService) {}

    @Get()
    @ApiEndpoint({
        summary: 'List tareas with optional filters',
        messageKey: 'tareas.success.list',
    })
    findAll(
        @AuthUser() user: IAuthUser,
        @Query('search') search?: string,
        @Query('estado') estado?: string,
        @Query('prioridad') prioridad?: string,
        @Query('encargadoId') encargadoId?: string,
        @Query('clienteId') clienteId?: string,
        @Query('skip') skip?: string,
        @Query('take') take?: string,
    ): Promise<TareaResponseDto[]> {
        return this.tareaService.findAll(
            {
                search,
                estado: parseEstado(estado),
                prioridad: parsePrioridad(prioridad),
                encargadoId,
                clienteId: clienteId ? parseInt(clienteId, 10) : undefined,
                skip: skip ? parseInt(skip, 10) : undefined,
                take: take ? parseInt(take, 10) : undefined,
            },
            user,
        );
    }

    @Get(':id')
    @ApiEndpoint({
        summary: 'Get tarea by ID',
        serialization: TareaResponseDto,
        messageKey: 'tareas.success.retrieved',
    })
    findById(@Param('id', ParseIntPipe) id: number): Promise<TareaResponseDto> {
        return this.tareaService.findById(id);
    }
}
