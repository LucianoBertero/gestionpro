import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ClavesService } from '../services/claves.service';
import { CreateClaveDto, UpdateClaveDto, ClaveResponseDto } from '../dtos/claves.dto';

@ApiTags('claves')
@ApiBearerAuth('accessToken')
@Controller({ path: '/claves', version: '1' })
export class ClavesController {
    constructor(private readonly service: ClavesService) {}

    @Get()
    @ApiEndpoint({ summary: 'List all claves', serialization: ClaveResponseDto, messageKey: 'claves.success.list' })
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiEndpoint({ summary: 'Get clave by ID', serialization: ClaveResponseDto, messageKey: 'claves.success.retrieved' })
    findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post()
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({ summary: 'Create clave', serialization: ClaveResponseDto, messageKey: 'claves.success.created', httpStatus: 201 })
    create(@Body() body: CreateClaveDto, @AuthUser() user: IAuthUser) {
        return this.service.create(body, user);
    }

    @Patch(':id')
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({ summary: 'Update clave', serialization: ClaveResponseDto, messageKey: 'claves.success.updated' })
    update(@Param('id') id: string, @Body() body: UpdateClaveDto, @AuthUser() user: IAuthUser) {
        return this.service.update(id, body, user);
    }

    @Delete(':id')
    @AllowedRoles([UserRole.SOCIO])
    @ApiEndpoint({ summary: 'Delete clave', messageKey: 'claves.success.deleted' })
    delete(@Param('id') id: string, @AuthUser() user: IAuthUser): Promise<ApiGenericResponseDto> {
        return this.service.delete(id, user);
    }
}
