import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { AgendaModule } from 'src/modules/agenda/agenda.module';
import { ArchivoModule } from 'src/modules/archivo/archivo.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ClavesModule } from 'src/modules/claves/claves.module';
import { ClientesModule } from 'src/modules/clientes/clientes.module';
import { ComunicacionModule } from 'src/modules/comunicacion/comunicacion.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { EmailTemplatesModule } from 'src/modules/email-templates/email-templates.module';
import { ExcelModule } from 'src/modules/excel/excel.module';
import { FinancieroModule } from 'src/modules/financiero/financiero.module';
import { ImpuestosEstadoModule } from 'src/modules/impuestos-estado/impuestos-estado.module';
import { LiquidacionesModule } from 'src/modules/liquidaciones/liquidaciones.module';
import { NotasModule } from 'src/modules/notas/notas.module';
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

        // Shared Infrastructure
        StorageModule,

        // Feature Modules
        AuthModule,
        UserModule,
        ClientesModule,
        TareasModule,
        LiquidacionesModule,
        NotasModule,
        VencimientosModule,
        AgendaModule,
        NotificacionesModule,
        ComunicacionModule,
        ArchivoModule,
        ClavesModule,
        EmailTemplatesModule,
        DashboardModule,
        FinancieroModule,
        ExcelModule,
        ImpuestosEstadoModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
