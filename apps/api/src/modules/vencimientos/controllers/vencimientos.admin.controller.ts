import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
import { VencimientoService } from '../services/vencimientos.service';

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
}
