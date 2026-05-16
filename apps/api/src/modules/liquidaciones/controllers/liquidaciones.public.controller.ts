import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { LiquidacionResponseDto } from '../dtos/liquidaciones.dto';
import { LiquidacionService } from '../services/liquidaciones.service';

@ApiTags('public.liquidaciones')
@ApiBearerAuth('accessToken')
@Controller({ path: '/liquidaciones', version: '1' })
export class LiquidacionesPublicController {
    constructor(private readonly liquidacionService: LiquidacionService) {}

    @Get()
    @ApiEndpoint({ summary: 'List liquidaciones with filters', messageKey: 'liquidaciones.success.list' })
    findAll(
        @Query('clienteId') clienteId?: string,
        @Query('periodo') periodo?: string,
        @Query('impuesto') impuesto?: string,
        @Query('skip') skip?: string,
        @Query('take') take?: string,
    ): Promise<LiquidacionResponseDto[]> {
        return this.liquidacionService.findAll({
            clienteId: clienteId ? parseInt(clienteId, 10) : undefined,
            periodo,
            impuesto: impuesto ? (impuesto.toUpperCase() as TipoImpuesto) : undefined,
            skip: skip ? parseInt(skip, 10) : undefined,
            take: take ? parseInt(take, 10) : undefined,
        });
    }

    @Get(':id')
    @ApiEndpoint({ summary: 'Get liquidacion by ID', serialization: LiquidacionResponseDto, messageKey: 'liquidaciones.success.retrieved' })
    findById(@Param('id', ParseIntPipe) id: number): Promise<LiquidacionResponseDto> {
        return this.liquidacionService.findById(id);
    }

    @Get('cliente/:clienteId')
    @ApiEndpoint({ summary: 'Get liquidaciones by cliente', messageKey: 'liquidaciones.success.list' })
    findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number): Promise<LiquidacionResponseDto[]> {
        return this.liquidacionService.findByClienteId(clienteId);
    }

    @Get('cliente/:clienteId/historial')
    @ApiEndpoint({ summary: 'Get liquidation history for client', messageKey: 'liquidaciones.success.list' })
    findHistorial(@Param('clienteId', ParseIntPipe) clienteId: number): Promise<LiquidacionResponseDto[]> {
        return this.liquidacionService.findHistorialCliente(clienteId);
    }
}
