import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { NotificacionesPublicController } from './controllers/notificaciones.public.controller';
import { NotificacionService } from './services/notificaciones.service';

@Module({
    imports: [DatabaseModule],
    controllers: [NotificacionesPublicController],
    providers: [NotificacionService],
    exports: [NotificacionService],
})
export class NotificacionesModule {}
