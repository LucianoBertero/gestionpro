import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { NotasController } from './controllers/notas.controller';
import { NotasService } from './services/notas.service';

@Module({
    imports: [DatabaseModule],
    controllers: [NotasController],
    providers: [NotasService],
    exports: [NotasService],
})
export class NotasModule {}
