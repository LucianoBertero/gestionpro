import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { CreateLiquidacionDto, LiquidacionResponseDto, UpdateLiquidacionDto } from '../dtos/liquidaciones.dto';
import { LiquidacionService } from '../services/liquidaciones.service';

@ApiTags('admin.liquidaciones')
@ApiBearerAuth('accessToken')
@Controller({ path: '/admin/liquidaciones', version: '1' })
export class LiquidacionesAdminController {
    constructor(private readonly liquidacionService: LiquidacionService) {}

    @Post()
    @ApiEndpoint({ summary: 'Create liquidacion', serialization: LiquidacionResponseDto, messageKey: 'liquidaciones.success.created', httpStatus: 201 })
    create(
        @Body() dto: CreateLiquidacionDto,
        @AuthUser() user: IAuthUser,
    ): Promise<LiquidacionResponseDto> {
        return this.liquidacionService.create(dto, user);
    }

    @Patch(':id')
    @ApiEndpoint({ summary: 'Update liquidacion', serialization: LiquidacionResponseDto, messageKey: 'liquidaciones.success.updated' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateLiquidacionDto,
    ): Promise<LiquidacionResponseDto> {
        return this.liquidacionService.update(id, dto);
    }

    @Delete(':id')
    @ApiEndpoint({ summary: 'Soft delete liquidacion', messageKey: 'liquidaciones.success.deleted' })
    softDelete(@Param('id', ParseIntPipe) id: number): Promise<ApiGenericResponseDto> {
        return this.liquidacionService.softDelete(id);
    }
}
