import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { ComunicacionService } from '../services/comunicacion.service';
import { CreateComunicacionDto, UpdateComunicacionDto } from '../dtos/comunicacion.dto';

@ApiTags('comunicaciones')
@ApiBearerAuth('accessToken')
@Controller({ path: '/comunicaciones', version: '1' })
export class ComunicacionController {
    constructor(private readonly service: ComunicacionService) {}

    @Get()
    findAll(
        @Query('clienteId') clienteId?: string,
        @Query('tipo') tipo?: string,
    ) {
        return this.service.findAll({
            ...(clienteId ? { clienteId: parseInt(clienteId) } : {}),
            ...(tipo ? { tipo } : {}),
        });
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }

    @Post()
    @AllowedRoles([UserRole.SOCIO])
    create(@Body() body: CreateComunicacionDto, @AuthUser() user: IAuthUser) {
        return this.service.create({ ...body, usuarioId: user.userId });
    }

    @Patch(':id')
    @AllowedRoles([UserRole.SOCIO])
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateComunicacionDto) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    @AllowedRoles([UserRole.SOCIO])
    delete(@Param('id', ParseIntPipe) id: number): Promise<ApiGenericResponseDto> {
        return this.service.softDelete(id);
    }
}
