import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { VencimientoService } from '../services/vencimientos.service';
import { VencimientoListFiltersDto } from '../dtos/vencimiento-list.dto';
import { VencimientoConClientesDto } from '../dtos/vencimiento-response.dto';
import type { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

@ApiTags('public.vencimientos')
@ApiBearerAuth('accessToken')
@Controller({ path: '/vencimientos', version: '1' })
export class VencimientosPublicController {
    constructor(private readonly service: VencimientoService) {}

    @Get()
    @ApiEndpoint({
        summary: 'List vencimientos with filters, pagination, and affected clients',
        serialization: VencimientoConClientesDto,
        paginated: true,
        messageKey: 'vencimientos.success.listWithClients',
    })
    async findAll(
        @Query() filters: VencimientoListFiltersDto,
    ): Promise<{ data: VencimientoConClientesDto[]; total: number; skip: number; take: number }> {
        return this.service.findAllWithClientes(filters);
    }

    @Get('calcular')
    @ApiEndpoint({ summary: 'Calculate vencimiento for CUIT', messageKey: 'vencimientos.success.calculated' })
    calcular(
        @Query('cuit') cuit: string,
        @Query('impuesto') impuesto: string,
        @Query('anio') anio: string,
        @Query('mes') mes: string,
    ) {
        return this.service.calcularVencimiento(
            cuit,
            impuesto.toUpperCase() as TipoImpuesto,
            parseInt(anio, 10),
            parseInt(mes, 10),
        );
    }
}
