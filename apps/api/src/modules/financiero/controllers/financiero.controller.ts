import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
import { FinancieroService } from '../services/financiero.service';

@ApiTags('admin.financiero')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/financiero', version: '1' })
export class FinancieroController {
    constructor(private readonly service: FinancieroService) {}

    @Get('honorarios')
    getHonorarios(@Query('periodo') periodo?: string) { return this.service.getHonorarios(periodo); }

    @Get('rentabilidad')
    getRentabilidad() { return this.service.getRentabilidad(); }

    @Get('proyeccion')
    getProyeccion() { return this.service.getProyeccion(); }
}
