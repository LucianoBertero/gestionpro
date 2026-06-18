import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClavesController } from './controllers/claves.controller';
import { ClaveClienteController } from './controllers/clave-cliente.controller';
import { ClavesService } from './services/claves.service';
import { ClaveClienteService } from './services/clave-cliente.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ClavesController, ClaveClienteController],
    providers: [ClavesService, ClaveClienteService],
})
export class ClavesModule {}
