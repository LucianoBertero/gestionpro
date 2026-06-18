import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { ClienteImpuestoDto } from '../dtos/clientes.dto';
import {
    AddClienteImpuestoDto,
    ToggleClienteImpuestoDto,
} from '../dtos/cliente-impuesto.dto';
import { ClienteImpuestoService } from '../services/cliente-impuesto.service';

@ApiTags('admin.clientes.impuestos')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/clientes/:clienteId/impuestos', version: '1' })
export class ClienteImpuestoAdminController {
    constructor(private readonly service: ClienteImpuestoService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiEndpoint({
        summary: 'Add or reactivate an impuesto for the cliente (SOCIO only)',
        serialization: ClienteImpuestoDto,
        messageKey: 'clientes.success.impuestoAdded',
    })
    add(
        @Param('clienteId', ParseIntPipe) clienteId: number,
        @Body() dto: AddClienteImpuestoDto,
    ): Promise<ClienteImpuestoDto> {
        return this.service.add(clienteId, dto.tipo);
    }

    @Patch(':clienteImpuestoId')
    @ApiEndpoint({
        summary: 'Toggle activo/inactivo of a cliente impuesto (SOCIO only)',
        serialization: ClienteImpuestoDto,
        messageKey: 'clientes.success.impuestoToggled',
    })
    toggle(
        @Param('clienteId', ParseIntPipe) clienteId: number,
        @Param('clienteImpuestoId', ParseIntPipe) clienteImpuestoId: number,
        @Body() dto: ToggleClienteImpuestoDto,
    ): Promise<ClienteImpuestoDto> {
        return this.service.toggle(clienteId, clienteImpuestoId, dto.activo);
    }

    @Delete(':clienteImpuestoId')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
        summary: 'Soft-delete a cliente impuesto (preserves history) (SOCIO only)',
        serialization: ClienteImpuestoDto,
        messageKey: 'clientes.success.impuestoRemoved',
    })
    remove(
        @Param('clienteId', ParseIntPipe) clienteId: number,
        @Param('clienteImpuestoId', ParseIntPipe) clienteImpuestoId: number,
    ): Promise<ClienteImpuestoDto> {
        return this.service.remove(clienteId, clienteImpuestoId);
    }
}
