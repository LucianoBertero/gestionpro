import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { AgendaModule } from 'src/modules/agenda/agenda.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ClientesModule } from 'src/modules/clientes/clientes.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { EmailTemplatesModule } from 'src/modules/email-templates/email-templates.module';
import { ExcelModule } from 'src/modules/excel/excel.module';
import { FinancieroModule } from 'src/modules/financiero/financiero.module';
import { LiquidacionesModule } from 'src/modules/liquidaciones/liquidaciones.module';
import { NotificacionesModule } from 'src/modules/notificaciones/notificaciones.module';
import { TareasModule } from 'src/modules/tareas/tareas.module';
import { UserModule } from 'src/modules/user/user.module';
import { VencimientosModule } from 'src/modules/vencimientos/vencimientos.module';
import { WorkerModule } from 'src/workers/worker.module';

import { HealthController } from './controllers/health.controller';

@Module({
    imports: [
        // Shared Common Services (includes ConfigModule)
        CommonModule,

        // Health Check
        TerminusModule,

        // Background Processing
        WorkerModule,

        // Feature Modules
        AuthModule,
        UserModule,
        ClientesModule,
        TareasModule,
        LiquidacionesModule,
        VencimientosModule,
        AgendaModule,
        NotificacionesModule,
        EmailTemplatesModule,
        DashboardModule,
        FinancieroModule,
        ExcelModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
