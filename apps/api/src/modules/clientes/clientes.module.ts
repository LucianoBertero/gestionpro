import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';

import { ArchivosClientesController } from './controllers/archivos-clientes.controller';
import { ClienteImpuestoAdminController } from './controllers/cliente-impuesto.admin.controller';
import { ClientesAdminController } from './controllers/clientes.admin.controller';
import { ClientesAfipController } from './controllers/clientes.afip.controller';
import { ClientesPublicController } from './controllers/clientes.public.controller';
import { ArchivosClientesRepository } from './repositories/archivos-clientes.repository';
import { AfipService } from './services/afip.service';
import { ArchivosClientesService } from './services/archivos-clientes.service';
import { ClienteImpuestoService } from './services/cliente-impuesto.service';
import { ClienteService } from './services/clientes.service';

@Module({
    imports: [DatabaseModule],
    controllers: [
        ClientesPublicController,
        ClientesAdminController,
        ClientesAfipController,
        ClienteImpuestoAdminController,
        ArchivosClientesController,
    ],
    providers: [ClienteService, ClienteImpuestoService, AfipService, ArchivosClientesService, ArchivosClientesRepository],
    exports: [ClienteService, ClienteImpuestoService, ArchivosClientesService],
})
export class ClientesModule {}
