import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgendaRepository } from './repositories/agenda.repository';
import { ArchivoRepository } from './repositories/archivo.repository';
import { CalendarioVencimientoRepository } from './repositories/calendario-vencimiento.repository';
import { ClienteRepository } from './repositories/cliente.repository';
import { ComunicacionRepository } from './repositories/comunicacion.repository';
import { EmailTemplateRepository } from './repositories/email-template.repository';
import { LiquidacionRepository } from './repositories/liquidacion.repository';
import { NotaClienteRepository } from './repositories/nota-cliente.repository';
import { NotificacionRepository } from './repositories/notificacion.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TareaRepository } from './repositories/tarea.repository';
import { UserRepository } from './repositories/user.repository';
import { DatabaseService } from './services/database.service';

@Module({
    imports: [ConfigModule],
    providers: [
        DatabaseService,
        UserRepository,
        RefreshTokenRepository,
        ClienteRepository,
        TareaRepository,
        LiquidacionRepository,
        CalendarioVencimientoRepository,
        AgendaRepository,
        NotificacionRepository,
        EmailTemplateRepository,
        ComunicacionRepository,
        ArchivoRepository,
        NotaClienteRepository,
    ],
    exports: [
        DatabaseService,
        UserRepository,
        RefreshTokenRepository,
        ClienteRepository,
        TareaRepository,
        LiquidacionRepository,
        CalendarioVencimientoRepository,
        AgendaRepository,
        NotificacionRepository,
        EmailTemplateRepository,
        ComunicacionRepository,
        ArchivoRepository,
        NotaClienteRepository,
    ],
})
export class DatabaseModule {}
