import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { LiquidacionesAdminController } from './controllers/liquidaciones.admin.controller';
import { LiquidacionesPublicController } from './controllers/liquidaciones.public.controller';
import { LiquidacionService } from './services/liquidaciones.service';

@Module({
    imports: [DatabaseModule],
    controllers: [LiquidacionesPublicController, LiquidacionesAdminController],
    providers: [LiquidacionService],
    exports: [LiquidacionService],
})
export class LiquidacionesModule {}
