import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BullMqModule } from './bullmq/bullmq.module';
import { CacheModule } from './cache/cache.module';
import configs from './config';
import { DatabaseModule } from './database/database.module';
import { CustomLoggerModule } from './logger/logger.module';
import { RequestModule } from './request/request.module';
import { ResponseModule } from './response/response.module';
import { StorageModule } from './storage/storage.module';

@Module({
    imports: [
        // Configuration - Global
        ConfigModule.forRoot({
            load: configs,
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
            expandVariables: true,
        }),

        // Core Infrastructure
        DatabaseModule,

        // Cross-cutting Concerns
        CustomLoggerModule,
        RequestModule,
        ResponseModule,
        CacheModule,
        BullMqModule,
        StorageModule,
    ],
    exports: [DatabaseModule, CacheModule, StorageModule],
})
export class CommonModule {}
