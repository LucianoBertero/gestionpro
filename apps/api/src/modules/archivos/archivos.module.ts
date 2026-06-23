import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';
import { StorageModule } from 'src/common/storage/storage.module';

import { ArchivosAdminController } from './controllers/archivos.admin.controller';
import { ArchivosPublicController } from './controllers/archivos.public.controller';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { ArchivosService } from './services/archivos.service';

@Module({
    imports: [DatabaseModule, StorageModule],
    controllers: [ArchivosPublicController, ArchivosAdminController],
    providers: [ArchivosService, FileValidationPipe],
    exports: [ArchivosService],
})
export class ArchivosModule {}
