import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { EmailTemplateService } from '../services/email-templates.service';

@ApiTags('admin.email-templates')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/email-templates', version: '1' })
export class EmailTemplatesController {
    constructor(private readonly service: EmailTemplateService) {}

    @Get()
    findAll() { return this.service.findAll(); }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

    @Post()
    create(@Body() body: any) { return this.service.create(body); }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<ApiGenericResponseDto> { return this.service.softDelete(id); }
}
