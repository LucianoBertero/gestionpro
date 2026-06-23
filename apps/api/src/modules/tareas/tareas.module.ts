import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { ArchivosTareasController } from './controllers/archivos-tareas.controller';
import { TareasAdminController } from './controllers/tareas.admin.controller';
import { TareasPublicController } from './controllers/tareas.public.controller';
import { ArchivosTareasRepository } from './repositories/archivos-tareas.repository';
import { ArchivosTareasService } from './services/archivos-tareas.service';
import { TareaService } from './services/tareas.service';

@Module({
    imports: [DatabaseModule],
    controllers: [TareasPublicController, TareasAdminController, ArchivosTareasController],
    providers: [TareaService, ArchivosTareasService, ArchivosTareasRepository],
    exports: [TareaService, ArchivosTareasService],
})
export class TareasModule {}
