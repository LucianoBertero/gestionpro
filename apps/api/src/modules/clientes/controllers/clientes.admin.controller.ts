import {
    Body,
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import {
    ClienteResponseDto,
    CreateClienteDto,
    UpdateClienteDto,
} from '../dtos/clientes.dto';
import { ClienteService } from '../services/clientes.service';

@ApiTags('admin.clientes')
@ApiBearerAuth('accessToken')
@Controller({ path: '/clientes', version: '1' })
export class ClientesAdminController {
    constructor(private readonly clienteService: ClienteService) {}

    @Post()
    @ApiEndpoint({
        summary: 'Create cliente with impuestos (SOCIO only)',
        serialization: ClienteResponseDto,
        httpStatus: 201,
        messageKey: 'clientes.success.created',
    })
    create(
        @Body() dto: CreateClienteDto
    ): Promise<ClienteResponseDto> {
        return this.clienteService.create(dto);
    }

    @Patch(':id')
    @ApiEndpoint({
        summary: 'Update cliente (SOCIO only)',
        serialization: ClienteResponseDto,
        messageKey: 'clientes.success.updated',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateClienteDto
    ): Promise<ClienteResponseDto> {
        return this.clienteService.update(id, dto);
    }

    @Delete(':id')
    @ApiEndpoint({
        summary: 'Soft-delete cliente (SOCIO only)',
        messageKey: 'clientes.success.clienteDeleted',
    })
    delete(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiGenericResponseDto> {
        return this.clienteService.softDelete(id);
    }
}
