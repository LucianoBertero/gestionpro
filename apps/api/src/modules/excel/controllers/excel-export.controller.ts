import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExcelService } from '../services/excel.service';

@ApiTags('public.excel-export')
@ApiBearerAuth('accessToken')
@Controller({ path: '/excel/export', version: '1' })
export class ExcelExportController {
    constructor(private readonly service: ExcelService) {}

    @Get('clientes')
    exportClientes(@Res() res: Response) { return this.service.exportClientes(res); }

    @Get('tareas')
    exportTareas(@Res() res: Response) { return this.service.exportTareas(res); }

    @Get('liquidaciones')
    exportLiquidaciones(@Res() res: Response, @Query('clienteId') clienteId?: string) {
        return this.service.exportLiquidaciones(res, clienteId ? parseInt(clienteId, 10) : undefined);
    }

    @Get('vencimientos')
    exportVencimientos(@Res() res: Response) { return this.service.exportVencimientos(res); }
}
