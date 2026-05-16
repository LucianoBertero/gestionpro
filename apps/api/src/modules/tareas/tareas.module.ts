import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { TareasAdminController } from './controllers/tareas.admin.controller';
import { TareasPublicController } from './controllers/tareas.public.controller';
import { TareaService } from './services/tareas.service';

@Module({
    imports: [DatabaseModule],
    controllers: [TareasPublicController, TareasAdminController],
    providers: [TareaService],
    exports: [TareaService],
})
export class TareasModule {}
