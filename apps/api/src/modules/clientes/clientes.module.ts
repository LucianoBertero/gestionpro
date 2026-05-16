import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { ClientesAdminController } from './controllers/clientes.admin.controller';
import { ClientesAfipController } from './controllers/clientes.afip.controller';
import { ClientesPublicController } from './controllers/clientes.public.controller';
import { AfipService } from './services/afip.service';
import { ClienteService } from './services/clientes.service';

@Module({
    imports: [DatabaseModule],
    controllers: [
        ClientesPublicController,
        ClientesAdminController,
        ClientesAfipController,
    ],
    providers: [ClienteService, AfipService],
    exports: [ClienteService],
})
export class ClientesModule {}
