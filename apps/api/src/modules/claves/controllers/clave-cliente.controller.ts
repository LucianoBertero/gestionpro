import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ClaveClienteService } from '../services/clave-cliente.service';
import { CreateClaveClienteDto, UpdateClaveClienteDto, ClaveClienteResponseDto } from '../dtos/clave-cliente.dto';

@ApiTags('cliente.claves')
@ApiBearerAuth('accessToken')
@Controller({ path: '/clientes/:clienteId/claves', version: '1' })
export class ClaveClienteController {
    constructor(private readonly service: ClaveClienteService) {}

    @Get()
    @ApiEndpoint({ summary: 'List claves by cliente', serialization: ClaveClienteResponseDto, messageKey: 'claves.success.list' })
    findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
        return this.service.findByCliente(clienteId);
    }

    @Get(':id')
    @ApiEndpoint({ summary: 'Get clave by ID', serialization: ClaveClienteResponseDto, messageKey: 'claves.success.retrieved' })
    findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({ summary: 'Create clave for cliente', serialization: ClaveClienteResponseDto, messageKey: 'claves.success.created' })
    create(@Param('clienteId', ParseIntPipe) clienteId: number, @Body() body: CreateClaveClienteDto, @AuthUser() user: IAuthUser) {
        return this.service.create(clienteId, body, user);
    }

    @Patch(':id')
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({ summary: 'Update clave', serialization: ClaveClienteResponseDto, messageKey: 'claves.success.updated' })
    update(@Param('id') id: string, @Body() body: UpdateClaveClienteDto) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({ summary: 'Delete clave', messageKey: 'claves.success.deleted' })
    delete(@Param('id') id: string): Promise<ApiGenericResponseDto> {
        return this.service.delete(id);
    }
}
