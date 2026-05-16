import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { AgendaService } from '../services/agenda.service';

@ApiTags('public.agenda')
@ApiBearerAuth('accessToken')
@Controller({ path: '/agenda', version: '1' })
export class AgendaPublicController {
    constructor(private readonly service: AgendaService) {}

    @Get()
    findAll(
        @AuthUser() user: IAuthUser,
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
    ) {
        return this.service.findAll({
            usuarioId: user.userId,
            fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
            fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
        });
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }
}
