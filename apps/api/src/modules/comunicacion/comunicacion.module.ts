import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ComunicacionController } from './controllers/comunicacion.controller';
import { ComunicacionService } from './services/comunicacion.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ComunicacionController],
    providers: [ComunicacionService],
    exports: [ComunicacionService],
})
export class ComunicacionModule {}
