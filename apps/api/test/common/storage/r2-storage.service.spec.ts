import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import {
    R2_S3_CLIENT,
    STORAGE_SERVICE,
} from 'src/common/storage/constants/storage.constant';
import { StorageService } from 'src/common/storage/interfaces/storage.interface';
import { R2StorageService } from 'src/common/storage/services/r2-storage.service';

// Mock the presigner so we don't need a real S3Client for signed URL generation.
// jest.mock calls are hoisted to the top of the file automatically.
// Use an inline factory to avoid hoisting issues with outer-scope variables.
jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest
        .fn()
        .mockResolvedValue(
            'https://signed-url.example.com/file?token=fake',
        ),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const presigner = require('@aws-sdk/s3-request-presigner');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyS3Command = new (...args: any[]) => unknown;

/** Helper: assert that the command sent to S3Client has the expected type, Bucket, and Key. */
function assertCommand(
    mockSend: jest.Mock,
    ExpectedCommand: AnyS3Command,
    expectedBucket: string,
    expectedKey: string,
) {
    expect(mockSend).toHaveBeenCalledTimes(1);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(ExpectedCommand);
     
    expect((cmd).input).toMatchObject({
        Bucket: expectedBucket,
        Key: expectedKey,
    });
}

describe('R2StorageService', () => {
    let service: R2StorageService;
    let mockS3Client: { send: jest.Mock };
    let mockConfigService: Partial<ConfigService>;

    const bucket = 'test-bucket';

    beforeEach(async () => {
        mockS3Client = { send: jest.fn() };
        mockConfigService = {
            get: jest.fn().mockReturnValue(bucket),
            getOrThrow: jest.fn().mockReturnValue(bucket),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                R2StorageService,
                {
                    provide: R2_S3_CLIENT,
                    useValue: mockS3Client,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: STORAGE_SERVICE,
                    useExisting: R2StorageService,
                },
            ],
        }).compile();

        service = module.get<R2StorageService>(R2StorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should extend StorageService', () => {
        expect(service).toBeInstanceOf(StorageService);
    });

    describe('put', () => {
        const putInput = {
            key: 'estudios/1/clientes/42/2026-06/abc.pdf',
            body: Buffer.from('fake-pdf-content'),
            contentType: 'application/pdf',
            metadata: { uploadedBy: 'user-1' },
        };

        it('should upload an object and return its key', async () => {
            mockS3Client.send.mockResolvedValue({});

            const result = await service.put(putInput);

            expect(result).toEqual({ key: putInput.key });
            assertCommand(
                mockS3Client.send,
                PutObjectCommand,
                bucket,
                putInput.key,
            );

            // Additionally assert ContentType and Body on the command
            const cmd = mockS3Client.send.mock.calls[0][0] as PutObjectCommand;
            expect(cmd.input.ContentType).toBe('application/pdf');
            expect(cmd.input.Body).toBe(putInput.body);
        });

        it('should throw on network error', async () => {
            const networkError = new Error('Network failure');
            mockS3Client.send.mockRejectedValue(networkError);

            await expect(service.put(putInput)).rejects.toThrow(
                'Network failure',
            );
        });
    });

    describe('get', () => {
        const key = 'estudios/1/clientes/42/2026-06/abc.pdf';
        const fileContent = Buffer.from('fake-pdf-content');

        it('should retrieve an object as Buffer', async () => {
            const mockBody = {
                transformToByteArray: jest
                    .fn()
                    .mockResolvedValue(fileContent),
            };
            mockS3Client.send.mockResolvedValue({ Body: mockBody });

            const result = await service.get(key);

            expect(result).toEqual(fileContent);
            expect(mockBody.transformToByteArray).toHaveBeenCalledTimes(1);
            assertCommand(
                mockS3Client.send,
                GetObjectCommand,
                bucket,
                key,
            );
        });

        it('should throw when key does not exist', async () => {
            const notFoundError = Object.assign(new Error('NoSuchKey'), {
                name: 'NoSuchKey',
            });
            mockS3Client.send.mockRejectedValue(notFoundError);

            await expect(service.get(key)).rejects.toThrow('NoSuchKey');
        });
    });

    describe('getSignedUrl', () => {
        const key = 'estudios/1/clientes/42/2026-06/abc.pdf';

        beforeEach(() => {
            presigner.getSignedUrl.mockClear();
        });

        it('should return a signed URL string with default 300s TTL', async () => {
            const result = await service.getSignedUrl(key);

            expect(typeof result).toBe('string');
            expect(presigner.getSignedUrl).toHaveBeenCalledTimes(1);

            // Verify the command passed to the presigner is a GetObjectCommand
            // with the correct Bucket and Key
            const [, cmdArg, optsArg] = presigner.getSignedUrl.mock.calls[0];
            expect(cmdArg).toBeInstanceOf(GetObjectCommand);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((cmdArg as Record<string, any>).input).toMatchObject({
                Bucket: bucket,
                Key: key,
            });
            expect(optsArg).toEqual({ expiresIn: 300 });
        });

        it('should accept a custom TTL', async () => {
            const result = await service.getSignedUrl(key, 600);

            expect(typeof result).toBe('string');
            expect(presigner.getSignedUrl).toHaveBeenCalledTimes(1);

            const [_, __, optsArg] = presigner.getSignedUrl.mock.calls[0];
            expect(optsArg).toEqual({ expiresIn: 600 });
        });
    });

    describe('delete', () => {
        const key = 'estudios/1/clientes/42/2026-06/abc.pdf';

        it('should delete an existing object', async () => {
            mockS3Client.send.mockResolvedValue({});

            await expect(service.delete(key)).resolves.toBeUndefined();
            assertCommand(
                mockS3Client.send,
                DeleteObjectCommand,
                bucket,
                key,
            );
        });

        it('should be idempotent when key does not exist', async () => {
            const notFoundError = Object.assign(new Error('NoSuchKey'), {
                name: 'NoSuchKey',
            });
            mockS3Client.send.mockRejectedValue(notFoundError);

            await expect(service.delete(key)).resolves.toBeUndefined();
            assertCommand(
                mockS3Client.send,
                DeleteObjectCommand,
                bucket,
                key,
            );
        });

        it('should rethrow non-NoSuchKey errors', async () => {
            const accessDeniedError = Object.assign(new Error('AccessDenied'), {
                name: 'AccessDenied',
            });
            mockS3Client.send.mockRejectedValue(accessDeniedError);

            await expect(service.delete(key)).rejects.toThrow('AccessDenied');
        });
    });

    describe('exists', () => {
        const key = 'estudios/1/clientes/42/2026-06/abc.pdf';

        it('should return true when key exists', async () => {
            mockS3Client.send.mockResolvedValue({});

            const result = await service.exists(key);

            expect(result).toBe(true);
            assertCommand(
                mockS3Client.send,
                HeadObjectCommand,
                bucket,
                key,
            );
        });

        it('should return false when key does not exist (NotFound)', async () => {
            const notFoundError = Object.assign(new Error('NotFound'), {
                name: 'NotFound',
                $metadata: { httpStatusCode: 404 },
            });
            mockS3Client.send.mockRejectedValue(notFoundError);

            const result = await service.exists(key);

            expect(result).toBe(false);
            expect(mockS3Client.send).toHaveBeenCalledTimes(1);
        });

        it('should return false when key does not exist (404 status)', async () => {
            const notFoundError = Object.assign(new Error('Not Found'), {
                $metadata: { httpStatusCode: 404 },
            });
            mockS3Client.send.mockRejectedValue(notFoundError);

            const result = await service.exists(key);

            expect(result).toBe(false);
        });

        it('should rethrow unexpected errors', async () => {
            const accessDeniedError = Object.assign(new Error('AccessDenied'), {
                name: 'AccessDenied',
            });
            mockS3Client.send.mockRejectedValue(accessDeniedError);

            await expect(service.exists(key)).rejects.toThrow('AccessDenied');
        });
    });
});
