import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { NotasService } from '../services/notas.service';
import { CreateNotaDto, UpdateNotaDto, NotaClienteResponseDto } from '../dtos/notas.dto';

@ApiTags('notas')
@ApiBearerAuth('accessToken')
@Controller({ path: '/notas', version: '1' })
export class NotasController {
    constructor(private readonly service: NotasService) {}

    @Get('cliente/:clienteId')
    @ApiEndpoint({ summary: 'List notas by cliente', serialization: NotaClienteResponseDto, messageKey: 'notas.success.list' })
    findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
        return this.service.findByClienteId(clienteId);
    }

    @Get(':id')
    @ApiEndpoint({ summary: 'Get nota by ID', serialization: NotaClienteResponseDto, messageKey: 'notas.success.retrieved' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }

    @Post()
    @ApiEndpoint({ summary: 'Create nota', serialization: NotaClienteResponseDto, messageKey: 'notas.success.created', httpStatus: 201 })
    create(@Body() body: CreateNotaDto, @AuthUser() user: IAuthUser) {
        return this.service.create({ ...body, creadoPorId: user.userId });
    }

    @Patch(':id')
    @ApiEndpoint({ summary: 'Update nota', serialization: NotaClienteResponseDto, messageKey: 'notas.success.updated' })
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateNotaDto, @AuthUser() user: IAuthUser) {
        return this.service.update(id, body, user);
    }

    @Delete(':id')
    @ApiEndpoint({ summary: 'Delete nota', messageKey: 'notas.success.deleted' })
    delete(@Param('id', ParseIntPipe) id: number, @AuthUser() user: IAuthUser): Promise<ApiGenericResponseDto> {
        return this.service.delete(id, user);
    }
}
