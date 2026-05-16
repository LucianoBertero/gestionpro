import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ArchivoController } from './controllers/archivo.controller';
import { ArchivoService } from './services/archivo.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ArchivoController],
    providers: [ArchivoService],
    exports: [ArchivoService],
})
export class ArchivoModule {}
