import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';

import type { AfipData } from '../services/afip.service';
import { AfipService } from '../services/afip.service';

@ApiTags('public.clientes')
@ApiBearerAuth('accessToken')
@Controller({ path: '/clientes/afip', version: '1' })
export class ClientesAfipController {
    constructor(private readonly afipService: AfipService) {}

    @Get(':cuit')
    @ApiEndpoint({
        summary: 'Look up CUIT data from AFIP mock service',
        messageKey: 'clientes.success.afipRetrieved',
    })
    getAfipData(@Param('cuit') cuit: string): AfipData {
        return this.afipService.getAfipData(cuit);
    }
}
