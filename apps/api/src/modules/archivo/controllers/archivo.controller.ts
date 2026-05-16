import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { ArchivoService } from '../services/archivo.service';
import { CreateArchivoDto } from '../dtos/archivo.dto';

@ApiTags('archivos')
@ApiBearerAuth('accessToken')
@Controller({ path: '/archivos', version: '1' })
export class ArchivoController {
    constructor(private readonly service: ArchivoService) {}

    @Get()
    findAll(@Query('clienteId') clienteId?: string) {
        return this.service.findAll({
            ...(clienteId ? { clienteId: parseInt(clienteId) } : {}),
        });
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }

    @Post()
    @AllowedRoles([UserRole.SOCIO])
    create(@Body() body: CreateArchivoDto, @AuthUser() user: IAuthUser) {
        return this.service.create({ ...body, subidoPorId: user.userId });
    }

    @Delete(':id')
    @AllowedRoles([UserRole.SOCIO])
    delete(@Param('id', ParseIntPipe) id: number): Promise<ApiGenericResponseDto> {
        return this.service.softDelete(id);
    }
}
