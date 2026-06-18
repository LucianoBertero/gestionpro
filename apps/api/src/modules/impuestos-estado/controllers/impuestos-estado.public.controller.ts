import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { LiquidacionResponseDto } from 'src/modules/liquidaciones/dtos/liquidaciones.dto';
import { ImpuestoConEstadoResponseDto } from '../dtos/impuestos-estado.dto';
import { ImpuestosEstadoService } from '../services/impuestos-estado.service';

@ApiTags('public.impuestos-estado')
@ApiBearerAuth('accessToken')
@Controller({ path: '/clientes/:clienteId/impuestos', version: '1' })
export class ImpuestosEstadoPublicController {
    constructor(private readonly service: ImpuestosEstadoService) {}

    @Get('con-estado')
    @ApiEndpoint({
        summary: 'List impuestos del cliente con estado derivado (A_PRESENTAR/PRESENTADO/VENCIDO)',
        serialization: ImpuestoConEstadoResponseDto,
        messageKey: 'impuestos-estado.success.list',
    })
    findAll(@Param('clienteId', ParseIntPipe) clienteId: number): Promise<ImpuestoConEstadoResponseDto[]> {
        return this.service.findAllByCliente(clienteId);
    }

    @Post(':clienteImpuestoId/marcar-presentado')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
        summary: 'Marcar un impuesto del cliente como presentado (crea Liquidación del período actual)',
        serialization: ImpuestoConEstadoResponseDto,
        messageKey: 'impuestos-estado.success.markedPresented',
    })
    marcarPresentado(
        @Param('clienteId', ParseIntPipe) clienteId: number,
        @Param('clienteImpuestoId', ParseIntPipe) clienteImpuestoId: number,
        @AuthUser() user: IAuthUser,
    ): Promise<ImpuestoConEstadoResponseDto> {
        return this.service.marcarPresentado(clienteId, clienteImpuestoId, user);
    }

    @Get(':clienteImpuestoId/historial')
    @ApiEndpoint({
        summary: 'Historial de liquidaciones de un impuesto específico del cliente',
        serialization: LiquidacionResponseDto,
        messageKey: 'impuestos-estado.success.historial',
    })
    findHistorial(
        @Param('clienteId', ParseIntPipe) clienteId: number,
        @Param('clienteImpuestoId', ParseIntPipe) clienteImpuestoId: number,
    ): Promise<LiquidacionResponseDto[]> {
        return this.service.findHistorial(clienteId, clienteImpuestoId);
    }
}
