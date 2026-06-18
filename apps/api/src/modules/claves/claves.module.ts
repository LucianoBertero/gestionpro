import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClavesController } from './controllers/claves.controller';
import { ClavesService } from './services/claves.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ClavesController],
    providers: [ClavesService],
})
export class ClavesModule {}
