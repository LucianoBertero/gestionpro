import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
import { ExcelService } from '../services/excel.service';

@ApiTags('admin.excel-import')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/excel/import', version: '1' })
export class ExcelImportController {
    constructor(private readonly service: ExcelService) {}

    @Post('clientes')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    importClientes(@UploadedFile() file: any) {
        return this.service.importClientes(file);
    }

    @Post('comprobantes')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    importComprobantes(@UploadedFile() file: any) {
        return this.service.importComprobantes(file);
    }
}
