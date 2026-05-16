import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { VencimientosPublicController } from './controllers/vencimientos.public.controller';
import { VencimientosAdminController } from './controllers/vencimientos.admin.controller';
import { VencimientoService } from './services/vencimientos.service';

@Module({
    imports: [DatabaseModule],
    controllers: [VencimientosPublicController, VencimientosAdminController],
    providers: [VencimientoService],
    exports: [VencimientoService],
})
export class VencimientosModule {}
