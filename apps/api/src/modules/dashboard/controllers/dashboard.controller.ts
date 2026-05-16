import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('public.dashboard')
@ApiBearerAuth('accessToken')
@Controller({ path: '/dashboard', version: '1' })
export class DashboardController {
    constructor(private readonly service: DashboardService) {}

    @Get('metricas')
    getMetricas() { return this.service.getMetricas(); }

    @Get('semaforos')
    getSemaforos() { return this.service.getSemaforos(); }

    @Get('tareas-por-colaborador')
    getTareasPorColaborador() { return this.service.getTareasPorColaborador(); }

    @Get('vencimientos-semana')
    getVencimientosSemana() { return this.service.getVencimientosSemana(); }
}
