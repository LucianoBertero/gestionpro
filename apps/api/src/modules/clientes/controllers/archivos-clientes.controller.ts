import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { ArchivosClientesService } from '../services/archivos-clientes.service';

@ApiTags('admin.clientes')
@ApiBearerAuth('accessToken')
@Controller({ path: '/clientes', version: '1' })
export class ArchivosClientesController {
    constructor(private readonly archivosClientesService: ArchivosClientesService) {}

    @Get(':id/archivos')
    @ApiEndpoint({
        summary: 'List archivos attached to a cliente',
        messageKey: 'archivo.success.list',
    })
    listByCliente(@Param('id', ParseIntPipe) clienteId: number) {
        return this.archivosClientesService.findByCliente(clienteId);
    }

    @Post(':id/archivos')
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({
        summary: 'Attach an existing archivo to a cliente (SOCIO only)',
        messageKey: 'archivo.success.attached',
        httpStatus: 201,
    })
    attach(
        @Param('id', ParseIntPipe) clienteId: number,
        @Body('archivoId') archivoId: number,
        @Body('orden') orden?: number,
    ) {
        return this.archivosClientesService.attach(clienteId, archivoId, orden);
    }

    @Delete(':id/archivos/:archivoId')
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({
        summary: 'Detach an archivo from a cliente (SOCIO only)',
        messageKey: 'archivo.success.detached',
    })
    detach(
        @Param('id', ParseIntPipe) clienteId: number,
        @Param('archivoId', ParseIntPipe) archivoId: number,
    ): Promise<ApiGenericResponseDto> {
        return this.archivosClientesService.detach(clienteId, archivoId).then(() => ({
            success: true,
            message: 'archivo.success.detached',
        }));
    }
}
