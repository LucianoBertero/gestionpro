import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { ClienteImpuestoAdminController } from './controllers/cliente-impuesto.admin.controller';
import { ClientesAdminController } from './controllers/clientes.admin.controller';
import { ClientesAfipController } from './controllers/clientes.afip.controller';
import { ClientesPublicController } from './controllers/clientes.public.controller';
import { AfipService } from './services/afip.service';
import { ClienteImpuestoService } from './services/cliente-impuesto.service';
import { ClienteService } from './services/clientes.service';

@Module({
    imports: [DatabaseModule],
    controllers: [
        ClientesPublicController,
        ClientesAdminController,
        ClientesAfipController,
        ClienteImpuestoAdminController,
    ],
    providers: [ClienteService, ClienteImpuestoService, AfipService],
    exports: [ClienteService, ClienteImpuestoService],
})
export class ClientesModule {}
