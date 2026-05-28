import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
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

    @Get('equipo')
    findEquipo(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Query('usuarioId') usuarioId?: string,
    ) {
        return this.service.findEquipo({
            fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
            fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
            usuarioId,
        });
    }

    @Get('usuarios')
    findUsuarios() {
        return this.service.findUsuarios();
    }

    @Post()
    create(@Body() body: any, @AuthUser() user: IAuthUser) {
        return this.service.create({
            ...body,
            usuarioId: user.role === UserRole.SOCIO ? (body.usuarioId || user.userId) : user.userId,
            origen: body.origen || 'MANUAL',
        });
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }
}
