import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { AgendaPublicController } from './controllers/agenda.public.controller';
import { AgendaAdminController } from './controllers/agenda.admin.controller';
import { AgendaService } from './services/agenda.service';

@Module({
    imports: [DatabaseModule],
    controllers: [AgendaPublicController, AgendaAdminController],
    providers: [AgendaService],
    exports: [AgendaService],
})
export class AgendaModule {}
