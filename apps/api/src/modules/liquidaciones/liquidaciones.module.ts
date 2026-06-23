import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { ArchivosLiquidacionesController } from './controllers/archivos-liquidaciones.controller';
import { LiquidacionesAdminController } from './controllers/liquidaciones.admin.controller';
import { LiquidacionesPublicController } from './controllers/liquidaciones.public.controller';
import { ArchivosLiquidacionesRepository } from './repositories/archivos-liquidaciones.repository';
import { ArchivosLiquidacionesService } from './services/archivos-liquidaciones.service';
import { LiquidacionService } from './services/liquidaciones.service';

@Module({
    imports: [DatabaseModule],
    controllers: [LiquidacionesPublicController, LiquidacionesAdminController, ArchivosLiquidacionesController],
    providers: [LiquidacionService, ArchivosLiquidacionesService, ArchivosLiquidacionesRepository],
    exports: [LiquidacionService, ArchivosLiquidacionesService],
})
export class LiquidacionesModule {}
