import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';
import { LiquidacionesModule } from 'src/modules/liquidaciones/liquidaciones.module';

import { ImpuestosEstadoPublicController } from './controllers/impuestos-estado.public.controller';
import { ImpuestosEstadoService } from './services/impuestos-estado.service';

@Module({
    imports: [DatabaseModule, LiquidacionesModule],
    controllers: [ImpuestosEstadoPublicController],
    providers: [ImpuestosEstadoService],
})
export class ImpuestosEstadoModule {}
