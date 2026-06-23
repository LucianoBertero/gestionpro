import {
    Body,
    Controller,
    Delete,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { UserRole } from 'src/common/database/enums/role.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { ArchivoResponseDto } from '../dtos/archivo.response.dto';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { ArchivosService } from '../services/archivos.service';

@ApiTags('admin.archivos')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/archivos', version: '1' })
export class ArchivosAdminController {
    constructor(private readonly archivosService: ArchivosService) {}

    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 10 * 1024 * 1024 },
            storage: memoryStorage(),
        }),
    )
    @ApiEndpoint({
        summary: 'Upload a file and attach to a parent entity (SOCIO only)',
        serialization: ArchivoResponseDto,
        httpStatus: HttpStatus.CREATED,
        messageKey: 'archivo.success.uploaded',
    })
    create(
        @UploadedFile(FileValidationPipe) file: Express.Multer.File,
        @Body('parent') parentRaw: string,
        @AuthUser() user: IAuthUser,
    ) {
        const parent = parentRaw
            ? (JSON.parse(parentRaw) as { type: string; id: number })
            : undefined;

        if (
            !parent ||
            !['cliente', 'tarea', 'liquidacion'].includes(parent.type)
        ) {
            throw new Error(
                'Missing or invalid parent. Expected multipart field "parent" as JSON: {"type":"cliente","id":42}',
            );
        }

        return this.archivosService.create(
            file,
            parent as {
                type: 'cliente' | 'tarea' | 'liquidacion';
                id: number;
            },
            user.userId,
        );
    }

    @Delete(':id')
    @ApiEndpoint({
        summary: 'Delete an archivo (soft delete, SOCIO only)',
        messageKey: 'archivo.success.deleted',
    })
    delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ApiGenericResponseDto> {
        return this.archivosService.delete(id);
    }
}
