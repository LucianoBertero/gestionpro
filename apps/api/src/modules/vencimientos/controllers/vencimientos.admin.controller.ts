import { Body, Controller, Post, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
import { VencimientoService } from '../services/vencimientos.service';
import {
    CreateVencimientoDto,
    CreateVencimientoBatchDto,
    DuplicateYearDto,
} from '../dtos/vencimiento-create.dto';

@ApiTags('admin.vencimientos')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/vencimientos', version: '1' })
export class VencimientosAdminController {
    constructor(private readonly service: VencimientoService) {}

    @Post('cargar')
    upsert(@Body() body: { impuesto: string; anio: number; mes: number; digitoCuit: number; fechaVence: string }) {
        return this.service.upsert({
            impuesto: body.impuesto as any,
            anio: body.anio,
            mes: body.mes,
            digitoCuit: body.digitoCuit,
            fechaVence: new Date(body.fechaVence),
        });
    }

    @Post()
    @ApiEndpoint({
        summary: 'Create a single vencimiento',
        messageKey: 'vencimientos.success.created',
        httpStatus: HttpStatus.CREATED,
    })
    create(@Body() dto: CreateVencimientoDto) {
        return this.service.create(dto);
    }

    @Post('batch')
    @ApiEndpoint({
        summary: 'Create vencimientos in batch (upsert by unique key)',
        messageKey: 'vencimientos.success.createdBatch',
        httpStatus: HttpStatus.CREATED,
    })
    createBatch(@Body() dto: CreateVencimientoBatchDto) {
        return this.service.createBatch(dto.rows);
    }

    @Post('duplicate')
    @ApiEndpoint({
        summary: 'Duplicate vencimientos from one year to another, shifting dates by 365/366 days',
        messageKey: 'vencimientos.success.duplicatedYear',
        httpStatus: HttpStatus.CREATED,
    })
    duplicateYear(@Body() dto: DuplicateYearDto) {
        return this.service.duplicateYear(dto.sourceYear, dto.targetYear);
    }
}
