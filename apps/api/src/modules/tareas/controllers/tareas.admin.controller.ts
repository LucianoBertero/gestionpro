import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { UserRole } from 'src/common/database/enums/role.enum';
import { CreateTareaDto, TareaResponseDto, UpdateTareaDto } from '../dtos/tareas.dto';
import { TareaService } from '../services/tareas.service';

@ApiTags('admin.tareas')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/tareas', version: '1' })
export class TareasAdminController {
    constructor(private readonly tareaService: TareaService) {}

    @Post()
    @ApiEndpoint({
        summary: 'Create new tarea',
        serialization: TareaResponseDto,
        messageKey: 'tareas.success.created',
        httpStatus: 201,
    })
    create(@Body() dto: CreateTareaDto): Promise<TareaResponseDto> {
        return this.tareaService.create(dto);
    }

    @Patch(':id')
    @ApiEndpoint({
        summary: 'Update tarea',
        serialization: TareaResponseDto,
        messageKey: 'tareas.success.updated',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTareaDto,
    ): Promise<TareaResponseDto> {
        return this.tareaService.update(id, dto);
    }

    @Post(':id/completar')
    @ApiEndpoint({
        summary: 'Mark tarea as completed',
        serialization: TareaResponseDto,
        messageKey: 'tareas.success.completed',
    })
    completar(@Param('id', ParseIntPipe) id: number): Promise<TareaResponseDto> {
        return this.tareaService.completar(id);
    }

    @Delete(':id')
    @ApiEndpoint({
        summary: 'Soft delete tarea',
        messageKey: 'tareas.success.tareaDeleted',
    })
    softDelete(@Param('id', ParseIntPipe) id: number): Promise<ApiGenericResponseDto> {
        return this.tareaService.softDelete(id);
    }
}
