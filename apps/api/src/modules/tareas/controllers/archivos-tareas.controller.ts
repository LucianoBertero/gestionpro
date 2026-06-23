import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { ArchivosTareasService } from '../services/archivos-tareas.service';

@ApiTags('admin.tareas')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/tareas', version: '1' })
export class ArchivosTareasController {
    constructor(private readonly archivosTareasService: ArchivosTareasService) {}

    @Get(':id/archivos')
    @ApiEndpoint({
        summary: 'List archivos attached to a tarea',
        messageKey: 'archivo.success.list',
    })
    listByTarea(@Param('id', ParseIntPipe) tareaId: number) {
        return this.archivosTareasService.findByTarea(tareaId);
    }

    @Post(':id/archivos')
    @ApiEndpoint({
        summary: 'Attach an existing archivo to a tarea (SOCIO only)',
        messageKey: 'archivo.success.attached',
        httpStatus: 201,
    })
    attach(
        @Param('id', ParseIntPipe) tareaId: number,
        @Body('archivoId') archivoId: number,
        @Body('orden') orden?: number,
    ) {
        return this.archivosTareasService.attach(tareaId, archivoId, orden);
    }

    @Delete(':id/archivos/:archivoId')
    @ApiEndpoint({
        summary: 'Detach an archivo from a tarea (SOCIO only)',
        messageKey: 'archivo.success.detached',
    })
    detach(
        @Param('id', ParseIntPipe) tareaId: number,
        @Param('archivoId', ParseIntPipe) archivoId: number,
    ): Promise<ApiGenericResponseDto> {
        return this.archivosTareasService.detach(tareaId, archivoId).then(() => ({
            success: true,
            message: 'archivo.success.detached',
        }));
    }
}
