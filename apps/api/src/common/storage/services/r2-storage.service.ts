import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { R2_S3_CLIENT } from '../constants/storage.constant';
import {
    PutObjectInput,
    StorageService,
} from '../interfaces/storage.interface';

@Injectable()
export class R2StorageService extends StorageService {
    private readonly logger = new Logger(R2StorageService.name);

    constructor(
        @Inject(R2_S3_CLIENT) private readonly s3Client: S3Client,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async put(input: PutObjectInput): Promise<{ key: string }> {
        const command = new PutObjectCommand({
            Bucket: this.configService.getOrThrow<string>('storage.bucket'),
            Key: input.key,
            Body: input.body,
            ContentType: input.contentType,
            Metadata: input.metadata,
        });

        await this.s3Client.send(command);
        return { key: input.key };
    }

    async get(key: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: this.configService.getOrThrow<string>('storage.bucket'),
            Key: key,
        });

        const response = await this.s3Client.send(command);
        return Buffer.from(await response.Body!.transformToByteArray());
    }

    async getSignedUrl(
        key: string,
        expiresInSec = 300,
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.configService.getOrThrow<string>('storage.bucket'),
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, {
            expiresIn: expiresInSec,
        });
    }

    async delete(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.configService.getOrThrow<string>('storage.bucket'),
            Key: key,
        });

        try {
            await this.s3Client.send(command);
        } catch (error) {
            // Idempotent: ignore if the key does not exist
            if ((error as { name?: string }).name !== 'NoSuchKey') {
                throw error;
            }
            this.logger.debug(
                `delete called on non-existent key (idempotent): ${key}`,
            );
        }
    }

    async exists(key: string): Promise<boolean> {
        const command = new HeadObjectCommand({
            Bucket: this.configService.getOrThrow<string>('storage.bucket'),
            Key: key,
        });

        try {
            await this.s3Client.send(command);
            return true;
        } catch (error) {
            const err = error as {
                name?: string;
                $metadata?: { httpStatusCode?: number };
            };

            if (
                err.name === 'NotFound' ||
                err.$metadata?.httpStatusCode === 404
            ) {
                return false;
            }

            throw error;
        }
    }
}
