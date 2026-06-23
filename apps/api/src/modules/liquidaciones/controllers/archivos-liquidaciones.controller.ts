import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { ArchivosLiquidacionesService } from '../services/archivos-liquidaciones.service';

@ApiTags('admin.liquidaciones')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/liquidaciones', version: '1' })
export class ArchivosLiquidacionesController {
    constructor(private readonly archivosLiquidacionesService: ArchivosLiquidacionesService) {}

    @Get(':id/archivos')
    @ApiEndpoint({
        summary: 'List archivos attached to a liquidacion',
        messageKey: 'archivo.success.list',
    })
    listByLiquidacion(@Param('id', ParseIntPipe) liquidacionId: number) {
        return this.archivosLiquidacionesService.findByLiquidacion(liquidacionId);
    }

    @Post(':id/archivos')
    @ApiEndpoint({
        summary: 'Attach an existing archivo to a liquidacion (SOCIO only)',
        messageKey: 'archivo.success.attached',
        httpStatus: 201,
    })
    attach(
        @Param('id', ParseIntPipe) liquidacionId: number,
        @Body('archivoId') archivoId: number,
        @Body('orden') orden?: number,
    ) {
        return this.archivosLiquidacionesService.attach(liquidacionId, archivoId, orden);
    }

    @Delete(':id/archivos/:archivoId')
    @ApiEndpoint({
        summary: 'Detach an archivo from a liquidacion (SOCIO only)',
        messageKey: 'archivo.success.detached',
    })
    detach(
        @Param('id', ParseIntPipe) liquidacionId: number,
        @Param('archivoId', ParseIntPipe) archivoId: number,
    ): Promise<ApiGenericResponseDto> {
        return this.archivosLiquidacionesService.detach(liquidacionId, archivoId).then(() => ({
            success: true,
            message: 'archivo.success.detached',
        }));
    }
}
