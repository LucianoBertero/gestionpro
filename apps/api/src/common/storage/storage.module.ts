import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { R2_S3_CLIENT, STORAGE_SERVICE } from './constants/storage.constant';
import { R2StorageService } from './services/r2-storage.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: R2_S3_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): S3Client => {
                const accountId =
                    configService.getOrThrow<string>('storage.accountId');
                const accessKeyId = configService.getOrThrow<string>(
                    'storage.accessKeyId',
                );
                const secretAccessKey = configService.getOrThrow<string>(
                    'storage.secretAccessKey',
                );
                const region =
                    configService.get<string>('storage.region') ?? 'auto';

                const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

                return new S3Client({
                    region,
                    endpoint,
                    credentials: {
                        accessKeyId,
                        secretAccessKey,
                    },
                });
            },
        },
        R2StorageService,
        {
            provide: STORAGE_SERVICE,
            useExisting: R2StorageService,
        },
    ],
    exports: [STORAGE_SERVICE],
})
export class StorageModule {}
