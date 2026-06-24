import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { AgendaService } from '../services/agenda.service';
import { CreateAgendaItemDto } from '../dtos/agenda.dto';
import { UpdateAgendaItemDto } from '../dtos/agenda.update.dto';

@ApiTags('admin.agenda')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/agenda', version: '1' })
export class AgendaAdminController {
    constructor(private readonly service: AgendaService) {}

    @Get('equipo')
    findEquipo(@Query('fechaDesde') fechaDesde?: string, @Query('fechaHasta') fechaHasta?: string) {
        return this.service.findEquipo({
            fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
            fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
        });
    }

    @Post()
    create(@Body() body: CreateAgendaItemDto, @AuthUser() user: IAuthUser) {
        return this.service.create({
            ...body,
            usuarioId: body.usuarioId || user.userId,
            origen: body.origen || 'MANUAL',
        });
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAgendaItemDto, @AuthUser() user: IAuthUser) {
        return this.service.update(id, user, body);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number, @AuthUser() user: IAuthUser): Promise<ApiGenericResponseDto> {
        return this.service.softDelete(id, user);
    }
}
