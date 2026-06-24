import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';

import { ArchivoListDto } from '../dtos/archivo-list.dto';
import { ArchivoResponseDto } from '../dtos/archivo.response.dto';
import { ArchivosService } from '../services/archivos.service';

@ApiTags('public.archivos')
@ApiBearerAuth('accessToken')
@Controller({ path: '/archivos', version: '1' })
export class ArchivosPublicController {
    constructor(private readonly archivosService: ArchivosService) {}

    @Get()
    @ApiEndpoint({
        summary:
            'List archivos with filters (text search, type, parent, date range)',
        messageKey: 'archivo.success.list',
    })
    findAll(@Query() filters: ArchivoListDto) {
        return this.archivosService.findAll(filters);
    }

    @Get(':id')
    @ApiEndpoint({
        summary: 'Get archivo metadata and signed download URL',
        serialization: ArchivoResponseDto,
        messageKey: 'archivo.success.found',
    })
    findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ArchivoResponseDto> {
        return this.archivosService.findById(id);
    }
}
