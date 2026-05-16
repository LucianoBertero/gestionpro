import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { NotificacionService } from '../services/notificaciones.service';

@ApiTags('public.notificaciones')
@ApiBearerAuth('accessToken')
@Controller({ path: '/notificaciones', version: '1' })
export class NotificacionesPublicController {
    constructor(private readonly service: NotificacionService) {}

    @Get()
    findAll(@AuthUser() user: IAuthUser, @Query('skip') skip?: string, @Query('take') take?: string) {
        return this.service.findByUsuario(user.userId, skip ? parseInt(skip) : 0, take ? parseInt(take) : 50);
    }

    @Get('no-leidas')
    countNoLeidas(@AuthUser() user: IAuthUser) {
        return this.service.countNoLeidas(user.userId);
    }

    @Post(':id/leer')
    marcarLeida(@Param('id', ParseIntPipe) id: number) {
        return this.service.marcarLeida(id);
    }

    @Post('leer-todas')
    marcarTodasLeidas(@AuthUser() user: IAuthUser) {
        return this.service.marcarTodasLeidas(user.userId);
    }
}
