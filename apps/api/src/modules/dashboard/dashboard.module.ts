import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
    imports: [DatabaseModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
