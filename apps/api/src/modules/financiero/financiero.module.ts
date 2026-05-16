import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { FinancieroController } from './controllers/financiero.controller';
import { FinancieroService } from './services/financiero.service';

@Module({
    imports: [DatabaseModule],
    controllers: [FinancieroController],
    providers: [FinancieroService],
})
export class FinancieroModule {}
