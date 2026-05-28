import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from 'src/common/database/database.module';
import { RefreshTokenRepository } from 'src/common/database/repositories/refresh-token.repository';

import { MidNightScheduleWorker } from './schedulers/midnight.scheduler';

@Module({
    imports: [ScheduleModule.forRoot(), DatabaseModule],
    providers: [MidNightScheduleWorker, RefreshTokenRepository],
})
export class WorkerModule {}
